'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check, Plus, User } from 'lucide-react'
import { isDemoMode, supabase } from '@/lib/supabase'
import { UserRole } from '@/types'

interface Resident {
  id: string
  name: string
  room_number?: string
  primary_diagnosis?: string
}

interface ResidentSelectorProps {
  currentPatientId: string
  currentPatientName: string
  onSelectResident: (patientId: string, patientName: string) => void
  userRole: UserRole
  onAddResident?: () => void
}

export default function ResidentSelector({
  currentPatientId,
  currentPatientName,
  onSelectResident,
  userRole,
  onAddResident,
}: ResidentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load residents
  useEffect(() => {
    async function loadResidents() {
      if (isDemoMode) {
        setResidents([
          {
            id: currentPatientId,
            name: currentPatientName,
            room_number: '204',
            primary_diagnosis: 'Post-surgical recovery',
          },
        ])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, name, room_number, primary_diagnosis')
          .order('name')

        if (error) {
          console.error('[ResidentSelector] Error loading residents:', error)
          return
        }

        if (data && data.length > 0) {
          setResidents(data)
        } else {
          // Fallback to current patient
          setResidents([{ id: currentPatientId, name: currentPatientName }])
        }
      } catch (err) {
        console.error('[ResidentSelector] Error:', err)
        setResidents([{ id: currentPatientId, name: currentPatientName }])
      } finally {
        setLoading(false)
      }
    }

    loadResidents()
  }, [currentPatientId, currentPatientName])

  const isDisabled = isDemoMode && residents.length <= 1

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2" ref={dropdownRef}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side: current resident with dropdown */}
        <div className="relative">
          <button
            onClick={() => !isDisabled && setIsOpen(!isOpen)}
            disabled={isDisabled}
            className={`flex items-center gap-2 min-h-[44px] px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              isDisabled
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-900 hover:bg-white hover:shadow-sm'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="h-3.5 w-3.5 text-primary-600" />
            </div>
            <span className="font-semibold">{currentPatientName}</span>
            {!isDisabled && (
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
              <div className="p-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-400 px-2 py-1">SELECT RESIDENT</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-3 text-sm text-slate-400">Loading residents...</div>
                ) : (
                  residents.map((resident) => {
                    const isActive = resident.id === currentPatientId
                    return (
                      <button
                        key={resident.id}
                        onClick={() => {
                          onSelectResident(resident.id, resident.name)
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px] ${
                          isActive ? 'bg-primary-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-700' : 'text-slate-900'}`}>
                            {resident.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {[
                              resident.room_number ? `Room ${resident.room_number}` : null,
                              resident.primary_diagnosis,
                            ]
                              .filter(Boolean)
                              .join(' · ') || 'No details'}
                          </p>
                        </div>
                        {isActive && (
                          <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right side: Add Resident button (admin only) */}
        {userRole === 'admin' && (
          <button
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
            onClick={() => onAddResident?.()}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Resident</span>
          </button>
        )}
      </div>
    </div>
  )
}
