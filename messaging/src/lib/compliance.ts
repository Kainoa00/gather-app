// src/lib/compliance.ts
// Privacy-by-default enforcement layer.
// Every outbound SMS must pass through checkConsent() before delivery.

import { prisma } from './prisma'
import { ConsentCategory, ConsentStatus, MessageStatus, AuditActor } from '@prisma/client'
import { EventType } from '@prisma/client'

// Map EHR event types → consent categories
const EVENT_TO_CONSENT: Record<EventType, ConsentCategory> = {
  ADMISSION:               ConsentCategory.ADMISSIONS_DISCHARGES,
  DISCHARGE:               ConsentCategory.ADMISSIONS_DISCHARGES,
  LAB_RESULT:              ConsentCategory.LAB_RESULTS,
  MEDICATION_CHANGE:       ConsentCategory.MEDICATION_CHANGES,
  PSYCHOTROPIC_MED_CONSENT:ConsentCategory.PSYCHOTROPIC_CONSENT,
  IMMUNIZATION:            ConsentCategory.IMMUNIZATIONS,
  WEIGHT_CHANGE:           ConsentCategory.WEIGHT_VITALS,
  ROOM_TRANSFER:           ConsentCategory.ROOM_TRANSFERS,
  MANUAL:                  ConsentCategory.GENERAL,
}

export async function checkConsent({
  contactId,
  eventType,
}: {
  contactId: string
  eventType: EventType
}): Promise<{ allowed: boolean; reason?: string }> {
  const category = EVENT_TO_CONSENT[eventType]

  const consent = await prisma.consent.findUnique({
    where: { contactId_category: { contactId, category } },
  })

  if (!consent) return { allowed: false, reason: 'NO_CONSENT_RECORD' }
  if (consent.status === ConsentStatus.REVOKED) return { allowed: false, reason: 'CONSENT_REVOKED' }
  if (consent.status === ConsentStatus.PENDING) return { allowed: false, reason: 'CONSENT_PENDING' }
  if (consent.status === ConsentStatus.ACTIVE) return { allowed: true }

  return { allowed: false, reason: 'UNKNOWN_STATUS' }
}

// Suppress a message with full audit trail
export async function suppressMessage({
  messageId,
  facilityId,
  reason,
}: {
  messageId: string
  facilityId: string
  reason: string
}) {
  await prisma.message.update({
    where: { id: messageId },
    data: { status: MessageStatus.SUPPRESSED, failureReason: reason },
  })

  await prisma.auditLog.create({
    data: {
      facilityId,
      actorType: AuditActor.SYSTEM,
      action: 'NOTIFICATION_SUPPRESSED',
      entityType: 'Message',
      entityId: messageId,
      metadata: { reason },
    },
  })
}
