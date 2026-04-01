// src/app/audit/page.tsx
import { prisma } from '@/lib/prisma'
import { getFacilityId } from '@/lib/facility'
import { Prisma } from '@prisma/client'
import { formatDate } from '@/lib/format'
import Link from 'next/link'

const PAGE_SIZE = 20

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  const facilityId = await getFacilityId()
  const query = params.q ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const where: Prisma.AuditLogWhereInput = { facilityId }
  if (query) {
    where.OR = [
      { action: { contains: query, mode: 'insensitive' } },
      { entityType: { contains: query, mode: 'insensitive' } },
      { entityId: { contains: query, mode: 'insensitive' } },
    ]
  }

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const actorColor: Record<string, string> = {
    SYSTEM:         'bg-gray-100 text-gray-600',
    STAFF:          'bg-blue-50 text-blue-700',
    WEBHOOK:        'bg-purple-50 text-purple-700',
    FAMILY_CONTACT: 'bg-amber-50 text-amber-700',
  }

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (overrides.q ?? query) p.set('q', overrides.q ?? query)
    if (overrides.page) p.set('page', overrides.page)
    const qs = p.toString()
    return qs ? `/audit?${qs}` : '/audit'
  }

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Audit log</h2>
          <span className="text-xs text-gray-400">HIPAA · 6-year retention · AES-256 · Immutable</span>
        </div>

        {/* Search bar */}
        <form className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by action, entity type, or entity ID..."
            className="text-[12px] px-3 py-1.5 border border-gray-200 rounded-md flex-1 focus:outline-none focus:ring-1 focus:ring-brand-300"
          />
          <button
            type="submit"
            className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-800 transition-colors"
          >
            Search
          </button>
          {query && (
            <Link href="/audit" className="text-[11px] text-gray-400 hover:text-gray-600">Clear</Link>
          )}
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '140px' }} />
              <col style={{ width: '160px' }} />
              <col />
              <col style={{ width: '110px' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-2.5 text-[11px] font-medium text-gray-400">Timestamp</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-medium text-gray-400">Action</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-medium text-gray-400">Details</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-medium text-gray-400">Actor</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-mono text-[10px] text-gray-400 whitespace-nowrap">
                    {formatDate(log.createdAt, { includeTime: true })}
                  </td>
                  <td className="px-5 py-2.5 font-medium text-gray-800 whitespace-nowrap">{log.action}</td>
                  <td className="px-5 py-2.5 text-gray-500 truncate">
                    {log.entityType} · {log.entityId.slice(0, 12)}...
                    {log.metadata ? ` · ${JSON.stringify(log.metadata).slice(0, 60)}` : ''}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${actorColor[log.actorType] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.actor?.name ?? log.actorType}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    {query ? 'No audit entries match your search.' : 'No audit entries yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[11px] text-gray-400">
              Page {page} of {totalPages} ({totalCount} entries)
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            All logs stored encrypted at rest (AES-256) on AWS US-East-1. Retained 6 years per 45 CFR §164.530(j). Logs are immutable — no deletions permitted.
          </p>
        </div>
      </div>
    </div>
  )
}
