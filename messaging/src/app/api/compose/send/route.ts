import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFacilityId } from '@/lib/facility'
import { sendSMS } from '@/lib/sms'
import { checkConsent } from '@/lib/compliance'
import { applyRateLimit } from '@/lib/rate-limit'
import { EventType, MessageDirection, MessageStatus, AuditActor } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SendSchema = z.object({
  messages: z.array(z.object({
    residentId: z.string(),
    contactId: z.string(),
    body: z.string().min(1),
    phone: z.string(),
  })).min(1).max(100),
})

export async function POST(req: NextRequest) {
  const rateLimited = applyRateLimit(req, 'compose-send', 3, 60000)
  if (rateLimited) return rateLimited

  const rawBody = await req.json()
  const parsed = SendSchema.safeParse(rawBody)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const facilityId = await getFacilityId()

  // Create a single MANUAL CareEvent for this compose batch
  const event = await prisma.careEvent.create({
    data: {
      residentId: parsed.data.messages[0].residentId,
      type: EventType.MANUAL,
      details: { source: 'compose', messageCount: parsed.data.messages.length } as any,
      occurredAt: new Date(),
      processedAt: new Date(),
    },
  })

  const results = await Promise.allSettled(
    parsed.data.messages.map(async (msg) => {
      // Check consent
      const consent = await checkConsent({ contactId: msg.contactId, eventType: EventType.MANUAL })

      // Create message record
      const message = await prisma.message.create({
        data: {
          residentId: msg.residentId,
          contactId: msg.contactId,
          eventId: event.id,
          direction: MessageDirection.OUTBOUND,
          body: msg.body,
          status: consent.allowed ? MessageStatus.QUEUED : MessageStatus.SUPPRESSED,
        },
      })

      if (!consent.allowed) {
        return { contactId: msg.contactId, status: 'SUPPRESSED', reason: consent.reason }
      }

      try {
        const sid = await sendSMS({
          to: msg.phone,
          body: msg.body,
          messageId: message.id,
          facilityId,
        })
        return { contactId: msg.contactId, status: 'SENT', twilioSid: sid }
      } catch (err) {
        await prisma.message.update({
          where: { id: message.id },
          data: { status: MessageStatus.FAILED, failedAt: new Date(), failureReason: String(err) },
        })
        return { contactId: msg.contactId, status: 'FAILED', error: String(err) }
      }
    })
  )

  const outcomes = results.map(r => r.status === 'fulfilled' ? r.value : { status: 'FAILED', error: 'Promise rejected' })

  // Audit log
  await prisma.auditLog.create({
    data: {
      facilityId,
      actorType: AuditActor.STAFF,
      action: 'COMPOSE_BATCH_SENT',
      entityType: 'CareEvent',
      entityId: event.id,
      metadata: {
        messageCount: parsed.data.messages.length,
        sent: outcomes.filter(o => o.status === 'SENT').length,
        suppressed: outcomes.filter(o => o.status === 'SUPPRESSED').length,
        failed: outcomes.filter(o => o.status === 'FAILED').length,
      },
    },
  })

  revalidatePath('/')
  revalidatePath('/messages')
  revalidatePath('/events')

  return NextResponse.json({ eventId: event.id, results: outcomes })
}
