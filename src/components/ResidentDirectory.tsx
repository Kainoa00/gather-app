'use client'

import { Plus, Activity, Heart, Wind } from 'lucide-react'
import { UserRole } from '@/types'
import { ResidentSnapshot } from '@/lib/demo-data'
import { format } from 'date-fns'

interface ResidentDirectoryProps {
  residents: ResidentSnapshot[]
  currentUserRole: UserRole
  onViewResident: (id: string, name: string) => void
  onAddResident: () => void
}

const moodConfig = {
  great: { label: 'Great', color: '#22c55e', bg: '#f0fdf4' },
  good:  { label: 'Good',  color: '#14b8a6', bg: '#f0fdfa' },
  fair:  { label: 'Fair',  color: '#f59e0b', bg: '#fffbeb' },
  poor:  { label: 'Poor',  color: '#ef4444', bg: '#fef2f2' },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function avatarColor(name: string) {
  const colors = [
    { bg: '#e0f2fe', text: '#0369a1' },
    { bg: '#fce7f3', text: '#9d174d' },
    { bg: '#d1fae5', text: '#065f46' },
    { bg: '#ede9fe', text: '#5b21b6' },
    { bg: '#fef3c7', text: '#92400e' },
    { bg: '#fee2e2', text: '#991b1b' },
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export default function ResidentDirectory({
  residents,
  currentUserRole,
  onViewResident,
  onAddResident,
}: ResidentDirectoryProps) {
  const isAdmin = currentUserRole === 'admin'
  const title = isAdmin ? 'All Residents' : 'My Patients'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--navy-800)' }}>
            {title}
          </h2>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}
          >
            {residents.length}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={onAddResident}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--primary-600)' }}
          >
            <Plus className="h-4 w-4" />
            Add Resident
          </button>
        )}
      </div>

      {/* Grid */}
      {residents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">No residents found.</p>
          {isAdmin && (
            <button onClick={onAddResident} className="mt-3 text-sm font-medium underline" style={{ color: 'var(--primary-600)' }}>
              Add your first resident
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {residents.map((r) => {
            const mood = moodConfig[r.currentMood]
            const av = avatarColor(r.name)
            const vitalsAge = Math.round((Date.now() - r.lastVitals.recordedAt.getTime()) / (60 * 60 * 1000))
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                {/* Top row: avatar + name + room */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: av.bg, color: av.text }}
                  >
                    {getInitials(r.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--navy-800)' }}>
                        {r.name}
                      </p>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ background: 'var(--navy-50)', color: 'var(--navy-600)' }}
                      >
                        Rm {r.roomNumber}
                      </span>
                    </div>
                    {!isAdmin && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--navy-400)' }}>
                        {r.primaryDiagnosis}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vitals snapshot — nurses only, not admins */}
                {!isAdmin && (
                  <div
                    className="rounded-xl p-3 grid grid-cols-3 gap-2"
                    style={{ background: 'var(--navy-50)' }}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <Activity className="h-3.5 w-3.5" style={{ color: 'var(--navy-400)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--navy-800)' }}>
                        {r.lastVitals.bp}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--navy-400)' }}>BP</p>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Heart className="h-3.5 w-3.5" style={{ color: 'var(--navy-400)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--navy-800)' }}>
                        {r.lastVitals.heartRate > 0 ? r.lastVitals.heartRate : '—'}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--navy-400)' }}>HR</p>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Wind className="h-3.5 w-3.5" style={{ color: 'var(--navy-400)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--navy-800)' }}>
                        {r.lastVitals.o2 > 0 ? `${r.lastVitals.o2}%` : '—'}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--navy-400)' }}>O₂</p>
                    </div>
                  </div>
                )}

                {/* Bottom row: mood (nurses only) + view button */}
                <div className="flex items-center justify-between">
                  {!isAdmin ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: mood.bg, color: mood.color }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: mood.color }}
                        />
                        {mood.label}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--navy-400)' }}>
                        {vitalsAge === 0 ? 'Just now' : `${vitalsAge}h ago`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--navy-400)' }}>
                      Admitted {format(r.admissionDate, 'MMM d, yyyy')}
                    </p>
                  )}
                  <button
                    onClick={() => onViewResident(r.id, r.name)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}
                  >
                    View Dashboard
                  </button>
                </div>

                {/* Admitted date — nurses only (admin shows it inline above) */}
                {!isAdmin && (
                  <p className="text-[10px]" style={{ color: 'var(--navy-400)' }}>
                    Admitted {format(r.admissionDate, 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
