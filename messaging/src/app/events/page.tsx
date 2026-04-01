// src/app/events/page.tsx
import { prisma } from '@/lib/prisma'
import { getFacilityId } from '@/lib/facility'
import { EventType, MessageStatus, Prisma } from '@prisma/client'
import { formatTime } from '@/lib/format'
import { EVENT_DOT_COLOR, MSG_STATUS_BADGE, MSG_STATUS_LABEL } from '@/lib/ui-constants'
import { Pagination } from '@/components/Pagination'
import Link from 'next/link'

const PAGE_SIZE = 20

function formatEventDetails(details: Record<string, unknown>): string {
  const parts: string[] = []
  if (details.test) parts.push(`Test: ${details.test}`)
  if (details.result) parts.push(`Result: ${details.result}`)
  if (details.note) parts.push(String(details.note))
  if (details.medName) parts.push(`Medication: ${details.medName}`)
  if (details.vaccineName) parts.push(`Vaccine: ${details.vaccineName}`)
  if (details.newRoom) parts.push(`New room: ${details.newRoom}`)
  if (details.oldRoom) parts.push(`From room: ${details.oldRoom}`)
  if (details.weight) parts.push(`Weight: ${details.weight}`)
  if (details.labValue) parts.push(`Lab value: ${details.labValue}`)
  if (parts.length === 0 && Object.keys(details).length > 0) {
    return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(' · ')
  }
  return parts.join(' · ')
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  ADMISSION: 'Admission',
  DISCHARGE: 'Discharge',
  LAB_RESULT: 'Lab result',
  MEDICATION_CHANGE: 'Medication change',
  PSYCHOTROPIC_MED_CONSENT: 'Psychotropic consent',
  IMMUNIZATION: 'Immunization',
  WEIGHT_CHANGE: 'Weight change',
  ROOM_TRANSFER: 'Room transfer',
  MANUAL: 'Manual update',
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>
}) {
  const params = await searchParams
  const facilityId = await getFacilityId()
  const query = params.q ?? ''
  const typeFilter = params.type ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const where: Prisma.CareEventWhereInput = { resident: { facilityId } }
  if (typeFilter && Object.values(EventType).includes(typeFilter as EventType)) {
    where.type = typeFilter as EventType
  }
  if (query) {
    where.resident = {
      facilityId,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { roomNumber: { contains: query, mode: 'insensitive' } },
      ],
    } as Prisma.ResidentWhereInput
  }

  const [events, totalCount] = await Promise.all([
    prisma.careEvent.findMany({
      where,
      include: {
        resident: true,
        messages: { include: { contact: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { occurredAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.careEvent.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (overrides.q ?? query) p.set('q', overrides.q ?? query)
    if (overrides.type ?? typeFilter) p.set('type', overrides.type ?? typeFilter)
    if (overrides.page) p.set('page', overrides.page)
    const qs = p.toString()
    return qs ? `/events?${qs}` : '/events'
  }

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">EHR event log</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium bg-blue-50 text-blue-700 rounded px-2 py-0.5">PointClickCare</span>
            <span className="text-[11px] text-gray-400">{totalCount} total events</span>
          </div>
        </div>

        {/* Search + filter bar */}
        <form className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by resident name or room..."
            className="text-[12px] px-3 py-1.5 border border-gray-200 rounded-md flex-1 focus:outline-none focus:ring-1 focus:ring-brand-300"
          />
          <select
            name="type"
            defaultValue={typeFilter}
            className="text-[12px] px-3 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-300"
          >
            <option value="">All event types</option>
            {Object.values(EventType).map(t => (
              <option key={t} value={t}>{EVENT_TYPE_LABELS[t] ?? t.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button
            type="submit"
            className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-800 transition-colors"
          >
            Search
          </button>
          {(query || typeFilter) && (
            <Link href="/events" className="text-[11px] text-gray-400 hover:text-gray-600">Clear</Link>
          )}
        </form>

        {events.map(ev => {
          const msg = ev.messages[0]
          const status = msg?.status ?? 'QUEUED'
          const details = ev.details as Record<string, unknown>
          const detailStr = formatEventDetails(details)

          return (
            <div key={ev.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${EVENT_DOT_COLOR[ev.type] ?? 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-medium">{EVENT_TYPE_LABELS[ev.type] ?? ev.type.replace(/_/g, ' ')}</p>
                  {ev.pccNoteWritten && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 rounded px-1.5 py-0.5">Write-back pending</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {ev.resident.firstName} {ev.resident.lastName} · Room {ev.resident.roomNumber}
                  {msg?.contact ? ` · ${msg.contact.name} notified` : ''}
                </p>
                {detailStr && (
                  <p className="text-[11px] text-gray-300 mt-0.5">{detailStr}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${MSG_STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {MSG_STATUS_LABEL[status] ?? status}
                </span>
                <p className="text-[10px] text-gray-300 mt-1">
                  {formatTime(ev.occurredAt)}
                </p>
              </div>
            </div>
          )
        })}

        {events.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">
            {query || typeFilter
              ? 'No events match your search criteria.'
              : 'No EHR events yet. Events appear here when PointClickCare webhooks are received.'}
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} totalCount={totalCount} entityLabel="events" buildUrl={buildUrl} />
        )}

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Progress notes are automatically written back to the PCC patient chart for every delivered notification.
          </p>
        </div>
      </div>
    </div>
  )
}
