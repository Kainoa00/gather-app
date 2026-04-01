// src/app/dsr/page.tsx
import { prisma } from '@/lib/prisma'
import { getFacilityId } from '@/lib/facility'
import { DSRStatus } from '@prisma/client'
import { DSRStatusSelect } from './DSRStatusSelect'
import { NewDSRForm } from './NewDSRForm'

export default async function DSRPage() {
  const facilityId = await getFacilityId()

  const requests = await prisma.dataSubjectRequest.findMany({
    where: { facilityId },
    orderBy: { receivedAt: 'desc' },
  })

  const now = new Date()

  return (
    <div className="p-6">
      {/* New DSR button/form */}
      <div className="mb-4">
        <NewDSRForm facilityId={facilityId} />
      </div>

      <div className="card-glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">Data subject rights requests</h2>
          <span className="text-xs text-gray-400">30-day SLA per HIPAA 45 CFR &sect;164.528</span>
        </div>

        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-medium text-gray-400">
              <th className="text-left px-5 py-2.5">Request type</th>
              <th className="text-left px-5 py-2.5">Requestor</th>
              <th className="text-left px-5 py-2.5">Resident</th>
              <th className="text-left px-5 py-2.5">Received</th>
              <th className="text-left px-5 py-2.5">Due</th>
              <th className="text-left px-5 py-2.5">Status</th>
              <th className="text-left px-5 py-2.5">Notes</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const overdue = req.status !== DSRStatus.COMPLETED && req.dueAt < now
              return (
                <tr key={req.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 ${overdue ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3 font-medium">{req.requestType.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{req.requestorName}</p>
                    {req.requestorPhone && <p className="text-[10px] text-gray-400">{req.requestorPhone}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{req.residentName}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(req.receivedAt).toLocaleDateString()}</td>
                  <td className={`px-5 py-3 font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                    {new Date(req.dueAt).toLocaleDateString()}{overdue ? ' (overdue)' : ''}
                  </td>
                  <td className="px-5 py-3">
                    <DSRStatusSelect dsrId={req.id} currentStatus={req.status} />
                  </td>
                  <td className="px-5 py-3 text-[11px] text-gray-500 max-w-[200px] truncate">
                    {req.notes ?? '-'}
                  </td>
                </tr>
              )
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No DSR requests on file.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            PHI-related requests are routed to the SNF (Covered Entity) in the first instance. CareBridge Connect Messaging cooperates per BAA. Rights: Access, Correction, Deletion, Withdraw Consent, Restrict Processing, Disclosure Accounting.
          </p>
        </div>
      </div>
    </div>
  )
}
