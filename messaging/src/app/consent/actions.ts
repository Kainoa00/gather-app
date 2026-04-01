// src/app/consent/actions.ts
'use server'
import { prisma } from '@/lib/prisma'
import { sendConsentRequest } from '@/lib/sms'
import { revalidatePath } from 'next/cache'

export async function sendConsentSMS(contactId: string) {
  const contact = await prisma.familyContact.findUnique({
    where: { id: contactId },
    include: { resident: { include: { facility: true } } },
  })
  if (!contact) throw new Error('Contact not found')

  await sendConsentRequest({
    contactId,
    facilityId: contact.resident.facilityId,
    facilityName: contact.resident.facility.name,
    residentName: `${contact.resident.firstName} ${contact.resident.lastName}`,
    to: contact.phone,
  })

  revalidatePath('/consent')
}
