// src/lib/events.ts
// Shared event processing pipeline — used by both PCC webhooks and manual triggers
import { prisma } from './prisma'
import { checkConsent, suppressMessage } from './compliance'
import { sendSMS } from './sms'
import { EventType, MessageDirection, MessageStatus, AuditActor } from '@prisma/client'

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
}

export interface ProcessEventResult {
  contactId: string
  status: 'SENT' | 'SUPPRESSED' | 'FAILED'
  twilioSid?: string
  reason?: string
  error?: string
}

export async function processEventNotifications({
  residentId,
  eventId,
  eventType,
  details,
}: {
  residentId: string
  eventId: string
  eventType: EventType
  details: Record<string, unknown>
}): Promise<ProcessEventResult[]> {
  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
    include: { contacts: true, facility: true },
  })
  if (!resident) return []

  const results: ProcessEventResult[] = []

  for (const contact of resident.contacts) {
    const consentCheck = await checkConsent({ contactId: contact.id, eventType })

    const template = await prisma.messageTemplate.findFirst({
      where: { eventType, isDefault: true },
    })

    let body = template
      ? interpolate(template.body, {
          contactFirstName: contact.name.split(' ')[0],
          residentName: `${resident.firstName} ${resident.lastName}`,
          roomNumber: resident.roomNumber,
          facilityName: resident.facility.name,
          facilityPhone: resident.facility.phone,
          immunizationName: (details as Record<string, string>)?.vaccineName ?? 'vaccine',
        })
      : `Update for ${resident.firstName} ${resident.lastName} from ${resident.facility.name}.`

    // For MANUAL events, use the nurse's note as the message body
    if (eventType === EventType.MANUAL && details.note) {
      body = `${resident.facility.name}: ${details.note as string} — regarding ${resident.firstName} ${resident.lastName}.`
    }

    const msg = await prisma.message.create({
      data: {
        residentId,
        contactId: contact.id,
        eventId,
        direction: MessageDirection.OUTBOUND,
        body,
        status: MessageStatus.QUEUED,
      },
    })

    if (!consentCheck.allowed) {
      await suppressMessage({
        messageId: msg.id,
        facilityId: resident.facilityId,
        reason: consentCheck.reason ?? 'NO_CONSENT',
      })
      results.push({ contactId: contact.id, status: 'SUPPRESSED', reason: consentCheck.reason })
      continue
    }

    try {
      const sid = await sendSMS({
        to: contact.phone,
        body,
        messageId: msg.id,
        facilityId: resident.facilityId,
      })
      results.push({ contactId: contact.id, status: 'SENT', twilioSid: sid })
    } catch (err) {
      await prisma.message.update({
        where: { id: msg.id },
        data: { status: MessageStatus.FAILED, failedAt: new Date(), failureReason: String(err) },
      })
      results.push({ contactId: contact.id, status: 'FAILED', error: String(err) })
    }
  }

  return results
}
