// src/app/api/events/route.ts
// Manual event trigger — useful for testing without a live PCC connection.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkConsent, suppressMessage } from '@/lib/compliance'
import { sendSMS } from '@/lib/sms'
import { EventType, MessageDirection, MessageStatus, AuditActor } from '@prisma/client'
import { z } from 'zod'

const TriggerSchema = z.object({
  residentId: z.string(),
  eventType:  z.nativeEnum(EventType),
  details:    z.record(z.unknown()).optional(),
})

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (_, k) => vars[k] ?? `{{${k}}}`)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = TriggerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { residentId, eventType, details = {} } = parsed.data

  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
    include: { contacts: { where: { isPrimary: true } }, facility: true },
  })
  if (!resident) return NextResponse.json({ error: 'Resident not found' }, { status: 404 })

  const event = await prisma.careEvent.create({
    data: { residentId, type: eventType, details: details as any, occurredAt: new Date(), processedAt: new Date() },
  })

  const results = []

  for (const contact of resident.contacts) {
    const allowed = await checkConsent({ contactId: contact.id, eventType })

    const tmpl = await prisma.messageTemplate.findFirst({ where: { eventType, isDefault: true } })
    const bodyText = tmpl
      ? interpolate(tmpl.body, {
          contactFirstName: contact.name.split(' ')[0],
          residentName: `${resident.firstName} ${resident.lastName}`,
          roomNumber: resident.roomNumber,
          facilityName: resident.facility.name,
          facilityPhone: resident.facility.phone,
        })
      : `Update for ${resident.firstName} ${resident.lastName} from ${resident.facility.name}.`

    const msg = await prisma.message.create({
      data: {
        residentId, contactId: contact.id, eventId: event.id,
        direction: MessageDirection.OUTBOUND,
        body: bodyText, status: MessageStatus.QUEUED,
      },
    })

    if (!allowed.allowed) {
      await suppressMessage({ messageId: msg.id, facilityId: resident.facilityId, reason: allowed.reason ?? 'NO_CONSENT' })
      results.push({ contactId: contact.id, status: 'SUPPRESSED', reason: allowed.reason })
      continue
    }

    try {
      const sid = await sendSMS({ to: contact.phone, body: bodyText, messageId: msg.id, facilityId: resident.facilityId })
      results.push({ contactId: contact.id, status: 'SENT', twilioSid: sid })
    } catch (err) {
      await prisma.message.update({ where: { id: msg.id }, data: { status: MessageStatus.FAILED, failedAt: new Date(), failureReason: String(err) } })
      results.push({ contactId: contact.id, status: 'FAILED', error: String(err) })
    }
  }

  await prisma.auditLog.create({
    data: {
      facilityId: resident.facilityId,
      actorType: AuditActor.STAFF,
      action: 'MANUAL_EVENT_TRIGGERED',
      entityType: 'CareEvent',
      entityId: event.id,
      metadata: { eventType, results },
    },
  })

  return NextResponse.json({ eventId: event.id, results })
}
