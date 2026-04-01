// src/app/audit/page.tsx
import { prisma } from '@/lib/prisma'

export default async function AuditPage() {
  const facilityId = (await prisma.facility.findFirst())?.id ?? ''

  const logs = await prisma.auditLog.findMany({
    where: { facilityId },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const actorColor: Record<string, string> = {
    SYSTEM:         'bg-gray-100 text-gray-600',
    STAFF:          'bg-blue-50 text-blue-700',
    WEBHOOK:        'bg-purple-50 text-purple-700',
    FAMILY_CONTACT: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Audit log</h2>
          <span className="text-xs text-gray-400">HIPAA · 6-year retention · AES-256 · Immutable</span>
        </div>

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
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-2.5 font-medium text-gray-800 whitespace-nowrap">{log.action}</td>
                  <td className="px-5 py-2.5 text-gray-500 truncate">
                    {log.entityType} · {log.entityId.slice(0, 12)}…
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
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No audit entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            All logs stored encrypted at rest (AES-256) on AWS US-East-1. Retained 6 years per 45 CFR §164.530(j). Logs are immutable — no deletions permitted.
          </p>
        </div>
      </div>
    </div>
  )
}
