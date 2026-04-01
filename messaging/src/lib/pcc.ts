// src/lib/pcc.ts
// PointClickCare webhook event processor.
// Ingests EHR events, creates CareEvent records, triggers notifications.

import { prisma } from './prisma'
import { processEventNotifications } from './events'
import { EventType, AuditActor } from '@prisma/client'

// Main event processor — called after PCC webhook is verified
export async function processPccEvent(pccEventId: string) {
  const raw = await prisma.pccWebhookEvent.findUnique({ where: { pccEventId } })
  if (!raw || raw.processed) return

  const payload = raw.payload as Record<string, unknown>
  const pccPatientId = payload.patientId as string
  const eventTypeRaw = payload.eventType as string

  // Map PCC event type string → our EventType enum
  const typeMap: Record<string, EventType> = {
    'ADT_ADMIT':           EventType.ADMISSION,
    'ADT_DISCHARGE':       EventType.DISCHARGE,
    'LAB_RESULT':          EventType.LAB_RESULT,
    'MED_CHANGE':          EventType.MEDICATION_CHANGE,
    'PSYCH_CONSENT':       EventType.PSYCHOTROPIC_MED_CONSENT,
    'IMMUNIZATION':        EventType.IMMUNIZATION,
    'WEIGHT_CHANGE':       EventType.WEIGHT_CHANGE,
    'ROOM_TRANSFER':       EventType.ROOM_TRANSFER,
  }

  const eventType = typeMap[eventTypeRaw]
  if (!eventType) {
    await prisma.pccWebhookEvent.update({
      where: { pccEventId },
      data: { processed: true, error: `Unknown event type: ${eventTypeRaw}` },
    })
    return
  }

  // Find resident by PCC patient ID
  const resident = await prisma.resident.findUnique({
    where: { pccPatientId },
    include: { facility: true },
  })

  if (!resident) {
    await prisma.pccWebhookEvent.update({
      where: { pccEventId },
      data: { processed: true, error: `Resident not found: ${pccPatientId}` },
    })
    return
  }

  // Create CareEvent record
  const event = await prisma.careEvent.create({
    data: {
      residentId: resident.id,
      pccEventId,
      type: eventType,
      details: (payload.details ?? {}) as any,
      occurredAt: new Date(payload.occurredAt as string ?? Date.now()),
      processedAt: new Date(),
    },
  })

  // Notify all primary contacts using shared pipeline
  const results = await processEventNotifications({
    residentId: resident.id,
    eventId: event.id,
    eventType,
    details: (payload.details ?? {}) as Record<string, unknown>,
  })

  // Write progress note back to PCC (stub — implement PCC write API)
  await writePccProgressNote({ pccPatientId, event: eventTypeRaw, resident })
  // PCC write-back not yet implemented — don't mark as written

  await prisma.pccWebhookEvent.update({
    where: { pccEventId },
    data: { processed: true, processedAt: new Date() },
  })

  // Audit
  await prisma.auditLog.create({
    data: {
      facilityId: resident.facilityId,
      actorType: AuditActor.WEBHOOK,
      action: 'PCC_EVENT_PROCESSED',
      entityType: 'CareEvent',
      entityId: event.id,
      metadata: { pccEventId, eventType, residentId: resident.id, results: JSON.parse(JSON.stringify(results)) },
    },
  })
}

// Stub for PCC chart write-back — implement with PCC REST API
async function writePccProgressNote({ pccPatientId, event, resident }: {
  pccPatientId: string
  event: string
  resident: { firstName: string; lastName: string }
}) {
  // TODO: POST to PCC /api/public/preview1/patients/{pccPatientId}/progressNotes
  // Body: { note: `Family notification sent for event: ${event}`, authorId: ... }
  console.log(`[PCC write-back] ${pccPatientId}: family notified for ${event}`)
}
