'use client'
import { useState } from 'react'
import { updateDSRStatus } from './actions'
import { DSRStatus } from '@prisma/client'

export function DSRStatusSelect({ dsrId, currentStatus }: { dsrId: string; currentStatus: DSRStatus }) {
  const [status, setStatus] = useState<DSRStatus>(currentStatus)
  const [saving, setSaving] = useState(false)

  async function handleChange(newStatus: DSRStatus) {
    setSaving(true)
    setStatus(newStatus)
    await updateDSRStatus(dsrId, newStatus)
    setSaving(false)
  }

  const colors: Record<string, string> = {
    OPEN: 'border-amber-300 text-amber-700 bg-amber-50',
    IN_PROGRESS: 'border-blue-300 text-blue-700 bg-blue-50',
    COMPLETED: 'border-green-300 text-green-700 bg-green-50',
    DENIED: 'border-red-300 text-red-700 bg-red-50',
  }

  return (
    <select
      value={status}
      onChange={e => handleChange(e.target.value as DSRStatus)}
      disabled={saving}
      className={`text-[11px] font-medium px-2 py-1 rounded-md border ${colors[status] ?? 'border-gray-200'} focus:outline-none cursor-pointer`}
    >
      <option value="OPEN">Open</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="COMPLETED">Completed</option>
      <option value="DENIED">Denied</option>
    </select>
  )
}
