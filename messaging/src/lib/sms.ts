// src/lib/sms.ts
import twilio from 'twilio'
import { prisma } from './prisma'
import { ConsentStatus, MessageDirection, MessageStatus, AuditActor } from '@prisma/client'

let _client: ReturnType<typeof twilio> | null = null

function getTwilioClient() {
  if (_client) return _client
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) {
    console.warn('[sms] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set — SMS disabled')
    return null
  }
  _client = twilio(sid, token)
  return _client
}

function getFromNumber() {
  return process.env.TWILIO_PHONE_NUMBER ?? ''
}

// ─── Send an SMS (after consent verified) ────────────────────────────────────
export async function sendSMS({
  to,
  body,
  messageId,
  facilityId,
}: {
  to: string
  body: string
  messageId: string
  facilityId: string
}) {
  const client = getTwilioClient()
  if (!client) {
    console.warn('[sms] Twilio not configured — skipping SMS to', to.slice(0, 6) + '...')
    await prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.SENT, sentAt: new Date() },
    })
    return 'SMS_DISABLED_NO_TWILIO'
  }

  const msg = await client.messages.create({ from: getFromNumber(), to, body })

  await prisma.message.update({
    where: { id: messageId },
    data: { twilioSid: msg.sid, status: MessageStatus.SENT, sentAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      facilityId,
      actorType: AuditActor.SYSTEM,
      action: 'SMS_SENT',
      entityType: 'Message',
      entityId: messageId,
      metadata: { to, twilioSid: msg.sid },
    },
  })

  return msg.sid
}

// ─── Send consent request SMS ────────────────────────────────────────────────
export async function sendConsentRequest({
  contactId,
  facilityId,
  facilityName,
  residentName,
  to,
}: {
  contactId: string
  facilityId: string
  facilityName: string
  residentName: string
  to: string
}) {
  const body = `Hi, this is ${facilityName}. To receive important care updates via SMS for ${residentName}, reply YES to consent. Reply STOP at any time to unsubscribe. Msg & data rates may apply.`

  const client = getTwilioClient()
  let sid = 'SMS_DISABLED_NO_TWILIO'

  if (client) {
    const msg = await client.messages.create({ from: getFromNumber(), to, body })
    sid = msg.sid
  } else {
    console.warn('[sms] Twilio not configured — consent request logged but not sent')
  }

  await prisma.auditLog.create({
    data: {
      facilityId,
      actorType: AuditActor.SYSTEM,
      action: 'CONSENT_REQUEST_SENT',
      entityType: 'FamilyContact',
      entityId: contactId,
      metadata: { to, twilioSid: sid },
    },
  })

  return sid
}

// ─── Handle inbound SMS (YES / STOP / other) ──────────────────────────────────
export async function handleInboundSMS({
  from,
  body,
  twilioSid,
}: {
  from: string
  body: string
  twilioSid: string
}) {
  const normalised = body.trim().toUpperCase()

  const contact = await prisma.familyContact.findFirst({
    where: { phone: from },
    include: { resident: { include: { facility: true } } },
  })

  if (!contact) return { status: 'UNKNOWN_CONTACT' }

  const facilityId = contact.resident.facilityId

  if (normalised === 'YES') {
    // Activate only PENDING consents for this contact
    const updated = await prisma.consent.updateMany({
      where: { contactId: contact.id, status: ConsentStatus.PENDING },
      data: { status: ConsentStatus.ACTIVE, consentedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        facilityId,
        actorType: AuditActor.FAMILY_CONTACT,
        action: 'CONSENT_GRANTED',
        entityType: 'FamilyContact',
        entityId: contact.id,
        metadata: { from, twilioSid, categoriesActivated: updated.count },
      },
    })

    await prisma.message.create({
      data: {
        residentId: contact.residentId,
        contactId: contact.id,
        direction: MessageDirection.INBOUND,
        body,
        status: MessageStatus.DELIVERED,
        twilioSid,
        deliveredAt: new Date(),
      },
    })

    return { status: 'CONSENT_GRANTED', contactId: contact.id, count: updated.count }
  }

  if (normalised === 'STOP') {
    await prisma.consent.updateMany({
      where: { contactId: contact.id },
      data: { status: ConsentStatus.REVOKED, revokedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        facilityId,
        actorType: AuditActor.FAMILY_CONTACT,
        action: 'CONSENT_REVOKED_STOP',
        entityType: 'FamilyContact',
        entityId: contact.id,
        metadata: { from, twilioSid },
      },
    })

    return { status: 'OPT_OUT', contactId: contact.id }
  }

  // Generic inbound message — store for staff review
  await prisma.message.create({
    data: {
      residentId: contact.residentId,
      contactId: contact.id,
      direction: MessageDirection.INBOUND,
      body,
      status: MessageStatus.DELIVERED,
      twilioSid,
      deliveredAt: new Date(),
    },
  })

  return { status: 'MESSAGE_STORED', contactId: contact.id }
}
