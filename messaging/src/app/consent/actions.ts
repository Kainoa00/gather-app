'use server'
import { prisma } from '@/lib/prisma'
import { sendConsentRequest } from '@/lib/sms'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { ConsentCategory, ConsentStatus } from '@prisma/client'
import { ONE_DAY_MS } from '@/lib/ui-constants'

const ALL_CATEGORIES = Object.values(ConsentCategory) as ConsentCategory[]

export async function sendConsentSMS(contactId: string): Promise<{ success: boolean; error?: string }> {
  const hdrs = await headers()
  const origin = hdrs.get('origin')
  const host = hdrs.get('host')
  if (origin && host && !origin.includes(host)) {
    return { success: false, error: 'Invalid request origin' }
  }

  const contact = await prisma.familyContact.findUnique({
    where: { id: contactId },
    include: {
      resident: { include: { facility: true } },
      consents: true,
    },
  })
  if (!contact) return { success: false, error: 'Contact not found' }

  // Check if consent SMS was already sent recently (within 24h)
  const recentPending = contact.consents.find(
    c => c.status === ConsentStatus.PENDING &&
    c.createdAt > new Date(Date.now() - ONE_DAY_MS)
  )
  if (recentPending) {
    return { success: false, error: 'Consent SMS already sent in the last 24 hours' }
  }

  try {
    const sid = await sendConsentRequest({
      contactId,
      facilityId: contact.resident.facilityId,
      facilityName: contact.resident.facility.name,
      residentName: `${contact.resident.firstName} ${contact.resident.lastName}`,
      to: contact.phone,
    })

    // Create PENDING consent records for all categories that don't already have an ACTIVE consent
    const existingActive = new Set(
      contact.consents
        .filter(c => c.status === ConsentStatus.ACTIVE)
        .map(c => c.category)
    )

    for (const category of ALL_CATEGORIES) {
      if (existingActive.has(category)) continue
      await prisma.consent.upsert({
        where: { contactId_category: { contactId, category } },
        update: { status: ConsentStatus.PENDING, twilioMessageSid: sid, updatedAt: new Date() },
        create: { contactId, category, status: ConsentStatus.PENDING, twilioMessageSid: sid },
      })
    }

    revalidatePath('/consent')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
