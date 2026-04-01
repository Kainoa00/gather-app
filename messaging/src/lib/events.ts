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
  // Bind to const so closures see a non-null type
  const res = resident

  // Hoist template query out of loop — result depends only on eventType
  const template = await prisma.messageTemplate.findFirst({
    where: { eventType, isDefault: true },
  })

  async function processContact(contact: typeof res.contacts[number]): Promise<ProcessEventResult> {
    const consentCheck = await checkConsent({ contactId: contact.id, eventType })

    let body = template
      ? interpolate(template.body, {
          contactFirstName: contact.name.split(' ')[0],
          residentName: `${res.firstName} ${res.lastName}`,
          roomNumber: res.roomNumber,
          facilityName: res.facility.name,
          facilityPhone: res.facility.phone,
          immunizationName: String(details.vaccineName ?? 'vaccine'),
        })
      : `Update for ${res.firstName} ${res.lastName} from ${res.facility.name}.`

    // For MANUAL events, use the nurse's note as the message body
    if (eventType === EventType.MANUAL && details.note) {
      body = `${res.facility.name}: ${details.note as string} — regarding ${res.firstName} ${res.lastName}.`
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
        facilityId: res.facilityId,
        reason: consentCheck.reason ?? 'NO_CONSENT',
      })
      return { contactId: contact.id, status: 'SUPPRESSED', reason: consentCheck.reason }
    }

    try {
      const sid = await sendSMS({
        to: contact.phone,
        body,
        messageId: msg.id,
        facilityId: res.facilityId,
      })
      return { contactId: contact.id, status: 'SENT', twilioSid: sid }
    } catch (err) {
      await prisma.message.update({
        where: { id: msg.id },
        data: { status: MessageStatus.FAILED, failedAt: new Date(), failureReason: String(err) },
      })
      return { contactId: contact.id, status: 'FAILED', error: String(err) }
    }
  }

  const settled = await Promise.allSettled(res.contacts.map(processContact))
  return settled.map(r =>
    r.status === 'fulfilled'
      ? r.value
      : { contactId: 'unknown', status: 'FAILED' as const, error: String(r.reason) }
  )
}
