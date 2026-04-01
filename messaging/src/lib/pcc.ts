// src/lib/pcc.ts
// PointClickCare webhook event processor.
// Ingests EHR events, creates CareEvent records, triggers notifications.

import { prisma } from './prisma'
import { checkConsent, suppressMessage } from './compliance'
import { sendSMS } from './sms'
import { EventType, MessageDirection, MessageStatus, AuditActor } from '@prisma/client'

// Template variable interpolation
function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

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
    include: { contacts: { where: { isPrimary: true } }, facility: true },
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

  // Notify all primary contacts
  for (const contact of resident.contacts) {
    const consentCheck = await checkConsent({ contactId: contact.id, eventType })

    // Get matching template
    const template = await prisma.messageTemplate.findFirst({
      where: { eventType, isDefault: true },
    })

    const body = template
      ? interpolate(template.body, {
          contactFirstName: contact.name.split(' ')[0],
          residentName: `${resident.firstName} ${resident.lastName}`,
          roomNumber: resident.roomNumber,
          facilityName: resident.facility.name,
          facilityPhone: resident.facility.phone,
          immunizationName: (payload.details as Record<string, string>)?.vaccineName ?? 'vaccine',
        })
      : `Update for ${resident.firstName} ${resident.lastName} from ${resident.facility.name}.`

    // Create message record
    const message = await prisma.message.create({
      data: {
        residentId: resident.id,
        contactId: contact.id,
        eventId: event.id,
        direction: MessageDirection.OUTBOUND,
        body,
        status: MessageStatus.QUEUED,
      },
    })

    if (!consentCheck.allowed) {
      await suppressMessage({
        messageId: message.id,
        facilityId: resident.facilityId,
        reason: consentCheck.reason ?? 'NO_CONSENT',
      })
      continue
    }

    // Send via Twilio
    try {
      await sendSMS({
        to: contact.phone,
        body,
        messageId: message.id,
        facilityId: resident.facilityId,
      })
    } catch (err) {
      await prisma.message.update({
        where: { id: message.id },
        data: { status: MessageStatus.FAILED, failedAt: new Date(), failureReason: String(err) },
      })
    }
  }

  // Write progress note back to PCC (stub — implement PCC write API)
  await writePccProgressNote({ pccPatientId, event: eventTypeRaw, resident })
  await prisma.careEvent.update({ where: { id: event.id }, data: { pccNoteWritten: true } })

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
      metadata: { pccEventId, eventType, residentId: resident.id },
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
