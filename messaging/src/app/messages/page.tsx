// src/app/messages/page.tsx
import { prisma } from '@/lib/prisma'
import { getFacilityId } from '@/lib/facility'
import { MessageDirection } from '@prisma/client'
import { formatTime } from '@/lib/format'
import Link from 'next/link'

const RESIDENTS_PER_PAGE = 10

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const facilityId = await getFacilityId()
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const totalResidents = await prisma.resident.count({ where: { facilityId, status: 'ACTIVE' } })
  const totalPages = Math.max(1, Math.ceil(totalResidents / RESIDENTS_PER_PAGE))

  const residents = await prisma.resident.findMany({
    where: { facilityId, status: 'ACTIVE' },
    include: {
      messages: {
        include: { contact: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
      contacts: { where: { isPrimary: true } },
    },
    orderBy: { lastName: 'asc' },
    skip: (page - 1) * RESIDENTS_PER_PAGE,
    take: RESIDENTS_PER_PAGE,
  })

  const statusColor: Record<string, string> = {
    DELIVERED:  'text-green-600',
    SENT:       'text-blue-600',
    SUPPRESSED: 'text-red-500',
    QUEUED:     'text-amber-600',
    FAILED:     'text-red-600',
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {residents.map(resident => {
          const msgs = resident.messages
          const primary = resident.contacts[0]

          return (
            <div key={resident.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-[11px] font-medium text-brand-600 shrink-0">
                  {resident.firstName[0]}{resident.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{resident.firstName} {resident.lastName}</p>
                  <p className="text-[11px] text-gray-400">Room {resident.roomNumber} · {primary?.name ?? 'No primary contact'}</p>
                </div>
                <span className="text-[10px] text-gray-300">{msgs.length} msgs</span>
              </div>

              {/* Thread */}
              <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50/50">
                {msgs.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-4">No messages yet</p>
                ) : (
                  msgs.map(msg => (
                    <div key={msg.id} className={`flex ${msg.direction === MessageDirection.OUTBOUND ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-lg text-[11px] leading-relaxed ${
                        msg.direction === MessageDirection.OUTBOUND
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                      }`}>
                        <p>{msg.body}</p>
                        <p className={`text-[9px] mt-1 ${msg.direction === MessageDirection.OUTBOUND ? 'text-brand-100 opacity-70' : 'text-gray-400'} ${statusColor[msg.status] ?? ''}`}>
                          {msg.direction === MessageDirection.OUTBOUND ? msg.status.toLowerCase() : 'received'} ·{' '}
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {residents.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-12">No active residents. Run the seed script to add demo data.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-gray-400">
            Page {page} of {totalPages} ({totalResidents} residents)
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/messages?page=${page - 1}`}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/messages?page=${page + 1}`}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
