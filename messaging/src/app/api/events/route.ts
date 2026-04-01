// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processEventNotifications } from '@/lib/events'
import { applyRateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'
import { EventType, AuditActor } from '@prisma/client'
import { z } from 'zod'

const TriggerSchema = z.object({
  residentId: z.string(),
  eventType:  z.nativeEnum(EventType),
  details:    z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  const rateLimited = applyRateLimit(req, 'events')
  if (rateLimited) return rateLimited

  const body = await req.json()
  const parsed = TriggerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { residentId, eventType, details = {} } = parsed.data

  const resident = await prisma.resident.findUnique({ where: { id: residentId }, include: { facility: true } })
  if (!resident) return NextResponse.json({ error: 'Resident not found' }, { status: 404 })

  const event = await prisma.careEvent.create({
    data: { residentId, type: eventType, details: details as any, occurredAt: new Date(), processedAt: new Date() },
  })

  const results = await processEventNotifications({ residentId, eventId: event.id, eventType, details })

  await prisma.auditLog.create({
    data: {
      facilityId: resident.facilityId,
      actorType: AuditActor.STAFF,
      action: 'MANUAL_EVENT_TRIGGERED',
      entityType: 'CareEvent',
      entityId: event.id,
      metadata: { eventType, results: JSON.parse(JSON.stringify(results)) },
    },
  })

  revalidatePath('/')
  revalidatePath('/events')
  revalidatePath('/messages')

  return NextResponse.json({ eventId: event.id, results })
}
