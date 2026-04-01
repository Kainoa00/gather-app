// src/app/consent/page.tsx
import { prisma } from '@/lib/prisma'
import { getFacilityId } from '@/lib/facility'
import { ConsentStatus } from '@prisma/client'
import { SendConsentButton } from './SendConsentButton'

export default async function ConsentPage() {
  const facilityId = await getFacilityId()

  const contacts = await prisma.familyContact.findMany({
    where: { resident: { facilityId, status: 'ACTIVE' } },
    include: {
      resident: true,
      consents: { orderBy: { updatedAt: 'desc' } },
    },
    orderBy: { resident: { lastName: 'asc' } },
  })

  const gaps = contacts.filter(c =>
    !c.consents.some(s => s.status === ConsentStatus.ACTIVE)
  )

  return (
    <div className="p-6">
      {gaps.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-3 mb-6">
          <div className="shrink-0 mt-0.5 w-4 h-4 text-red-500">⚠</div>
          <p className="text-sm text-red-700">
            {gaps.length} contact{gaps.length > 1 ? 's' : ''} missing consent — notifications are suppressed until consent is collected.
          </p>
        </div>
      )}

      <div className="card-glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Family consent registry</h2>
          <span className="text-xs text-gray-400">{contacts.length} contacts</span>
        </div>

        {contacts.map(contact => {
          const active = contact.consents.some(c => c.status === ConsentStatus.ACTIVE)
          const revoked = contact.consents.some(c => c.status === ConsentStatus.REVOKED)
          const pending = contact.consents.some(c => c.status === ConsentStatus.PENDING)

          const statusLabel = active ? 'Active' : revoked ? 'Opted out' : pending ? 'Pending' : 'No consent'
          const statusClass = active
            ? 'bg-green-50 text-green-700'
            : revoked
            ? 'bg-red-50 text-red-700'
            : 'bg-amber-50 text-amber-700'

          const consentedAt = contact.consents.find(c => c.status === ConsentStatus.ACTIVE)?.consentedAt

          return (
            <div
              key={contact.id}
              className={`flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 ${!active ? 'bg-red-50/30' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{contact.resident.firstName} {contact.resident.lastName} — {contact.name}</p>
                <p className="text-[11px] text-gray-400">{contact.relationship} · {contact.phone}{consentedAt ? ` · Consented ${new Date(consentedAt).toLocaleDateString()}` : ''}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusClass}`}>{statusLabel}</span>
              {!active && !revoked && (
                <SendConsentButton
                  contactId={contact.id}
                  residentName={`${contact.resident.firstName} ${contact.resident.lastName}`}
                />
              )}
            </div>
          )
        })}

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Recipients may opt out at any time by replying STOP. Opt-outs are logged immediately and notifications suppressed. Per HIPAA privacy policy §5.
          </p>
        </div>
      </div>
    </div>
  )
}
