'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'

export interface NewResidentData {
  name: string
  dateOfBirth: Date
  roomNumber: string
  primaryDiagnosis: string
  admissionDate: Date
}

interface AddResidentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: NewResidentData) => void
}

const today = format(new Date(), 'yyyy-MM-dd')

export default function AddResidentModal({ isOpen, onClose, onAdd }: AddResidentModalProps) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [admissionDate, setAdmissionDate] = useState(today)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Full name is required.'
    if (!dob) e.dob = 'Date of birth is required.'
    if (!roomNumber.trim()) e.roomNumber = 'Room number is required.'
    if (!admissionDate) e.admissionDate = 'Admission date is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onAdd({
      name: name.trim(),
      dateOfBirth: new Date(dob),
      roomNumber: roomNumber.trim(),
      primaryDiagnosis: diagnosis.trim(),
      admissionDate: new Date(admissionDate),
    })
    // Reset form
    setName('')
    setDob('')
    setRoomNumber('')
    setDiagnosis('')
    setAdmissionDate(today)
    setErrors({})
  }

  function handleClose() {
    setName('')
    setDob('')
    setRoomNumber('')
    setDiagnosis('')
    setAdmissionDate(today)
    setErrors({})
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--navy-800)' }}>
            Add New Resident
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--navy-700)' }}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Margaret Chen"
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: errors.name ? '#ef4444' : 'var(--navy-200)',
                color: 'var(--navy-800)',
              }}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Two-column: DOB + Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--navy-700)' }}>
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.dob ? '#ef4444' : 'var(--navy-200)',
                  color: 'var(--navy-800)',
                }}
              />
              {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--navy-700)' }}>
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 214"
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.roomNumber ? '#ef4444' : 'var(--navy-200)',
                  color: 'var(--navy-800)',
                }}
              />
              {errors.roomNumber && <p className="text-xs text-red-500 mt-1">{errors.roomNumber}</p>}
            </div>
          </div>

          {/* Primary Diagnosis */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--navy-700)' }}>
              Primary Diagnosis
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Post-hip replacement recovery"
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--navy-200)', color: 'var(--navy-800)' }}
            />
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--navy-700)' }}>
              Admission Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: errors.admissionDate ? '#ef4444' : 'var(--navy-200)',
                color: 'var(--navy-800)',
              }}
            />
            {errors.admissionDate && <p className="text-xs text-red-500 mt-1">{errors.admissionDate}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
              style={{ borderColor: 'var(--navy-200)', color: 'var(--navy-600)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: 'var(--primary-600)' }}
            >
              Add Resident
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
