'use client'
import { useState } from 'react'
import { createDSR } from './actions'

const DSR_TYPES = [
  'ACCESS',
  'CORRECTION',
  'DELETION',
  'WITHDRAW_CONSENT',
  'RESTRICT_PROCESSING',
  'DISCLOSURE_ACCOUNTING',
] as const

const inputClass = 'w-full text-[12px] px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-300'

export function NewDSRForm({ facilityId }: { facilityId: string }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    await createDSR({
      facilityId,
      requestType: form.get('requestType') as any,
      requestorName: form.get('requestorName') as string,
      requestorPhone: (form.get('requestorPhone') as string) || undefined,
      requestorEmail: (form.get('requestorEmail') as string) || undefined,
      residentName: form.get('residentName') as string,
      notes: (form.get('notes') as string) || undefined,
    })
    setSaving(false)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] font-medium px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-800 transition-colors"
      >
        + New DSR
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-medium mb-4">New data subject request</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Request type</label>
          <select
            name="requestType"
            required
            className={`${inputClass} bg-white`}
          >
            {DSR_TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Requestor name</label>
          <input
            name="requestorName"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Requestor phone</label>
          <input
            name="requestorPhone"
            type="tel"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Requestor email</label>
          <input
            name="requestorEmail"
            type="email"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Resident name</label>
          <input
            name="residentName"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Notes</label>
          <input
            name="notes"
            className={inputClass}
          />
        </div>
        <div className="col-span-2 flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="text-[12px] font-medium px-4 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create request'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[12px] text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
