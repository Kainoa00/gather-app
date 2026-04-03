import { prisma } from '@/lib/prisma'
import { getFacilityId } from '@/lib/facility'
import { ComposeWizard } from '@/components/compose/ComposeWizard'

export default async function ComposePage() {
  const facilityId = await getFacilityId()

  const residents = await prisma.resident.findMany({
    where: { facilityId, status: 'ACTIVE' },
    include: { contacts: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  const residentOptions = residents.map(r => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    roomNumber: r.roomNumber,
    contactCount: r.contacts.length,
  }))

  const allContacts = residents.flatMap(r =>
    r.contacts.map(c => ({
      id: c.id,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      email: c.email ?? undefined,
      residentId: r.id,
      residentFirstName: r.firstName,
      residentLastName: r.lastName,
    }))
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--navy-800)' }}>Compose family update</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--navy-400)' }}>
          Select residents, write one update, and AI personalizes it for each family member.
        </p>
      </div>
      <ComposeWizard residents={residentOptions} contacts={allContacts} />
    </div>
  )
}
