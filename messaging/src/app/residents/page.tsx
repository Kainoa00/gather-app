// src/app/residents/page.tsx
import { prisma } from '@/lib/prisma'
import { ConsentStatus } from '@prisma/client'

export default async function ResidentsPage() {
  const facilityId = (await prisma.facility.findFirst())?.id ?? ''

  const residents = await prisma.resident.findMany({
    where: { facilityId, status: 'ACTIVE' },
    include: {
      contacts: { include: { consents: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      events:   { orderBy: { occurredAt: 'desc' }, take: 1 },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Residents — East Wing</h2>
          <span className="text-xs text-gray-400">{residents.length} active</span>
        </div>

        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-medium text-gray-400">
              <th className="text-left px-5 py-2.5">Resident</th>
              <th className="text-left px-5 py-2.5">Room</th>
              <th className="text-left px-5 py-2.5">Primary contact</th>
              <th className="text-left px-5 py-2.5">Consent</th>
              <th className="text-left px-5 py-2.5">Last event</th>
              <th className="text-left px-5 py-2.5">Admitted</th>
            </tr>
          </thead>
          <tbody>
            {residents.map(r => {
              const primary = r.contacts.find(c => c.isPrimary) ?? r.contacts[0]
              const hasConsent = primary?.consents.some(c => c.status === ConsentStatus.ACTIVE)
              const lastEvent = r.events[0]

              return (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-[10px] font-medium text-brand-600 shrink-0">
                        {r.firstName[0]}{r.lastName[0]}
                      </div>
                      <span className="font-medium">{r.firstName} {r.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{r.roomNumber}</td>
                  <td className="px-5 py-3">
                    {primary ? (
                      <div>
                        <p className="font-medium text-gray-800">{primary.name}</p>
                        <p className="text-[10px] text-gray-400">{primary.relationship} · {primary.phone}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      hasConsent ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {hasConsent ? 'Active' : 'Missing'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {lastEvent ? (
                      <div>
                        <p>{lastEvent.type.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-gray-400">{new Date(lastEvent.occurredAt).toLocaleDateString()}</p>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{new Date(r.admittedAt).toLocaleDateString()}</td>
                </tr>
              )
            })}
            {residents.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No active residents. Run the seed script to add demo data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
