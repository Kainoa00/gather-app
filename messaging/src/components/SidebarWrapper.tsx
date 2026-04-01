import { prisma } from '@/lib/prisma'
import { getFacility } from '@/lib/facility'
import { ConsentStatus, MessageDirection } from '@prisma/client'
import { Sidebar } from './Sidebar'

export async function SidebarWrapper() {
  const facility = await getFacility()
  const facilityId = facility.id
  const facilityName = facility.name

  const [eventCount, inboundCount, consentGaps, staffUser] = await Promise.all([
    prisma.careEvent.count({
      where: { resident: { facilityId }, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.message.count({
      where: { resident: { facilityId }, direction: MessageDirection.INBOUND, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.familyContact.count({
      where: { resident: { facilityId }, consents: { none: { status: ConsentStatus.ACTIVE } } },
    }),
    prisma.staffUser.findFirst({ where: { facilityId } }),
  ])

  return <Sidebar eventCount={eventCount} inboundCount={inboundCount} consentGaps={consentGaps} facilityName={facilityName} userName={staffUser?.name ?? 'Staff'} userRole={staffUser?.role ?? 'ADMIN'} />
}
