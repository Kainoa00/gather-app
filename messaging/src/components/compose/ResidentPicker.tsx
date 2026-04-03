'use client'
import { useState, useMemo } from 'react'
import { Search, CheckSquare, Square, Users } from 'lucide-react'

export interface ResidentOption {
  id: string
  firstName: string
  lastName: string
  roomNumber: string
  contactCount: number
}

interface ResidentPickerProps {
  residents: ResidentOption[]
  selected: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export function ResidentPicker({ residents, selected, onToggle, onSelectAll, onDeselectAll }: ResidentPickerProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return residents
    const q = search.toLowerCase()
    return residents.filter(r =>
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.roomNumber.includes(q)
    )
  }, [residents, search])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--navy-800)' }}>Select residents</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--navy-400)' }}>
            Choose whose families should receive this update
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSelectAll} className="text-[11px] font-medium hover:underline" style={{ color: 'var(--primary-600)' }}>
            Select all
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={onDeselectAll} className="text-[11px] font-medium hover:underline" style={{ color: 'var(--navy-400)' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--navy-400)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or room..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--navy-200)', color: 'var(--navy-800)' }}
        />
      </div>

      {/* List */}
      <div className="card-glass overflow-hidden max-h-[400px] overflow-y-auto">
        {filtered.map(r => {
          const isSelected = selected.has(r.id)
          return (
            <button
              key={r.id}
              onClick={() => onToggle(r.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors text-left ${
                isSelected ? 'bg-primary-50/50' : 'hover:bg-gray-50'
              }`}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-600)' }} />
              ) : (
                <Square className="w-4 h-4 shrink-0 text-gray-300" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--navy-800)' }}>
                  {r.firstName} {r.lastName}
                </p>
                <p className="text-xs" style={{ color: 'var(--navy-400)' }}>
                  Room {r.roomNumber}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--navy-400)' }}>
                <Users className="w-3 h-3" />
                {r.contactCount}
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--navy-400)' }}>No residents match your search</p>
        )}
      </div>

      <p className="text-xs mt-3" style={{ color: 'var(--navy-400)' }}>
        {selected.size} resident{selected.size !== 1 ? 's' : ''} selected ({residents.reduce((sum, r) => selected.has(r.id) ? sum + r.contactCount : sum, 0)} family contacts)
      </p>
    </div>
  )
}
