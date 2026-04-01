import { prisma } from '@/lib/prisma'
import { ConsentStatus, MessageDirection } from '@prisma/client'
import { Sidebar } from './Sidebar'

export async function SidebarWrapper() {
  const facilityId = (await prisma.facility.findFirst())?.id ?? ''

  const [eventCount, inboundCount, consentGaps] = await Promise.all([
    prisma.careEvent.count({
      where: { resident: { facilityId }, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.message.count({
      where: { resident: { facilityId }, direction: MessageDirection.INBOUND, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.familyContact.count({
      where: { resident: { facilityId }, consents: { none: { status: ConsentStatus.ACTIVE } } },
    }),
  ])

  return <Sidebar eventCount={eventCount} inboundCount={inboundCount} consentGaps={consentGaps} />
}
