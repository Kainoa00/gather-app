'use client'

import { useState, useRef } from 'react'
import {
  X,
  Upload,
  Sparkles,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Trash2,
  Heart,
  Pill,
  Activity,
  Brain,
  CheckCircle2,
} from 'lucide-react'
import { LogEntry, UserRole } from '@/types'

// ---------------------------------------------------------------------------
// Types for parsed agent output
// ---------------------------------------------------------------------------

interface ParsedVitals {
  bloodPressureSystolic?: number | null
  bloodPressureDiastolic?: number | null
  heartRate?: number | null
  temperature?: number | null
  oxygenSaturation?: number | null
  respiratoryRate?: number | null
  weight?: number | null
}

interface ParsedMedicationLog {
  medicationName: string
  dosage: string
  route: string
  administeredBy: string
}

interface ParsedActivityLog {
  activityType: string
  description: string
  duration?: number | null
  participation?: string
}

interface ParsedMoodLog {
  mood: string
  alertness: string
  appetite: string
  painLevel?: number | null
  notes?: string | null
}

interface ParsedIncidentLog {
  incidentType: string
  severity: string
  description: string
  actionTaken: string
  physicianNotified: boolean
  familyNotified: boolean
}

interface ParsedEntry {
  category: 'vitals' | 'medication' | 'activity' | 'mood' | 'incident'
  title: string
  notes?: string | null
  inferredTime?: string | null
  confidence: 'high' | 'medium' | 'low'
  vitals?: ParsedVitals | null
  medicationLog?: ParsedMedicationLog | null
  activityLog?: ParsedActivityLog | null
  moodLog?: ParsedMoodLog | null
  incidentLog?: ParsedIncidentLog | null
}

interface ParseResult {
  entries: ParsedEntry[]
  summary: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NurseNotesUploadProps {
  currentUserId: string
  currentUserName: string
  currentUserRole: UserRole
  patientName: string
  onAddLogEntry: (entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'>) => void
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const categoryStyle = {
  vitals: { bg: 'bg-red-50', icon: Heart, iconColor: 'text-red-500', label: 'Vitals', badge: 'bg-red-100 text-red-700' },
  medication: { bg: 'bg-blue-50', icon: Pill, iconColor: 'text-blue-500', label: 'Medication', badge: 'bg-blue-100 text-blue-700' },
  activity: { bg: 'bg-green-50', icon: Activity, iconColor: 'text-green-500', label: 'Activity', badge: 'bg-green-100 text-green-700' },
  mood: { bg: 'bg-purple-50', icon: Brain, iconColor: 'text-purple-500', label: 'Mood', badge: 'bg-purple-100 text-purple-700' },
  incident: { bg: 'bg-amber-50', icon: AlertTriangle, iconColor: 'text-amber-500', label: 'Incident', badge: 'bg-amber-100 text-amber-700' },
}

const confidenceStyle = {
  high: { color: 'text-mint-600', bg: 'bg-mint-50', label: 'High confidence' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Medium confidence' },
  low: { color: 'text-red-500', bg: 'bg-red-50', label: 'Low confidence — review carefully' },
}

function inferCreatedAt(inferredTime: string | null | undefined): Date {
  if (!inferredTime) return new Date()
  const [hStr, mStr] = inferredTime.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr || '0', 10)
  if (isNaN(h)) return new Date()
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function buildLogEntry(
  entry: ParsedEntry,
  currentUserId: string,
  currentUserName: string,
  currentUserRole: UserRole,
): Omit<LogEntry, 'id' | 'createdAt' | 'comments'> & { _inferredTime?: string | null } {
  const base: Omit<LogEntry, 'id' | 'createdAt' | 'comments'> = {
    category: entry.category,
    title: entry.title,
    notes: entry.notes || undefined,
    enteredBy: currentUserId,
    enteredByName: currentUserName,
    enteredByRole: currentUserRole,
  }

  if (entry.category === 'vitals' && entry.vitals) {
    const v = entry.vitals
    base.vitals = {
      bloodPressureSystolic: v.bloodPressureSystolic ?? undefined,
      bloodPressureDiastolic: v.bloodPressureDiastolic ?? undefined,
      heartRate: v.heartRate ?? undefined,
      temperature: v.temperature ?? undefined,
      oxygenSaturation: v.oxygenSaturation ?? undefined,
      respiratoryRate: v.respiratoryRate ?? undefined,
      weight: v.weight ?? undefined,
    }
  }

  if (entry.category === 'medication' && entry.medicationLog) {
    base.medicationLog = {
      medicationName: entry.medicationLog.medicationName,
      dosage: entry.medicationLog.dosage,
      route: entry.medicationLog.route || 'Oral',
      administeredBy: entry.medicationLog.administeredBy || currentUserName,
    }
  }

  if (entry.category === 'activity' && entry.activityLog) {
    base.activityLog = {
      activityType: (entry.activityLog.activityType || 'other') as any,
      description: entry.activityLog.description,
      duration: entry.activityLog.duration ?? undefined,
      participation: (entry.activityLog.participation || 'moderate') as any,
    }
  }

  if (entry.category === 'mood' && entry.moodLog) {
    base.moodLog = {
      mood: (entry.moodLog.mood || 'neutral') as any,
      alertness: (entry.moodLog.alertness || 'alert') as any,
      appetite: (entry.moodLog.appetite || 'fair') as any,
      painLevel: entry.moodLog.painLevel ?? undefined,
      notes: entry.moodLog.notes ?? undefined,
    }
  }

  if (entry.category === 'incident' && entry.incidentLog) {
    base.incidentLog = {
      incidentType: (entry.incidentLog.incidentType || 'other') as any,
      severity: (entry.incidentLog.severity || 'low') as any,
      description: entry.incidentLog.description,
      actionTaken: entry.incidentLog.actionTaken,
      physicianNotified: entry.incidentLog.physicianNotified,
      familyNotified: entry.incidentLog.familyNotified,
    }
  }

  return { ...base, _inferredTime: entry.inferredTime }
}

// ---------------------------------------------------------------------------
// EntryCard — one parsed entry with expand/remove
// ---------------------------------------------------------------------------

function EntryCard({
  entry,
  index,
  onRemove,
}: {
  entry: ParsedEntry
  index: number
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(entry.confidence !== 'high')
  const style = categoryStyle[entry.category]
  const Icon = style.icon
  const conf = confidenceStyle[entry.confidence]

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${
      entry.confidence === 'low' ? 'border-amber-300' : 'border-transparent'
    }`}>
      <div className="card-glass">
        <div className={`h-1 bg-gradient-to-r ${
          entry.category === 'vitals' ? 'from-red-400 to-red-500'
          : entry.category === 'medication' ? 'from-blue-400 to-blue-500'
          : entry.category === 'activity' ? 'from-green-400 to-green-500'
          : entry.category === 'mood' ? 'from-purple-400 to-purple-500'
          : 'from-amber-400 to-amber-500'
        }`} />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${style.bg} flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${style.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}>
                  {style.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conf.bg} ${conf.color}`}>
                  {conf.label}
                </span>
                {entry.inferredTime && (
                  <span className="text-xs text-navy-400">{entry.inferredTime}</span>
                )}
              </div>
              <p className="font-semibold text-navy-900 text-sm">{entry.title}</p>
              {entry.notes && <p className="text-xs text-navy-500 mt-0.5">{entry.notes}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setExpanded(v => !v)}
                className="p-1.5 hover:bg-cream-100 rounded-lg transition-colors"
              >
                {expanded ? <ChevronUp className="h-4 w-4 text-navy-400" /> : <ChevronDown className="h-4 w-4 text-navy-400" />}
              </button>
              <button
                onClick={onRemove}
                className="p-1.5 hover:bg-red-50 text-navy-300 hover:text-red-500 rounded-lg transition-colors"
                title="Remove this entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Expanded detail */}
          {expanded && (
            <div className="mt-3 ml-11 space-y-2">
              {/* Vitals */}
              {entry.vitals && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {entry.vitals.bloodPressureSystolic != null && (
                    <div className="bg-cream-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-navy-400">Blood Pressure</p>
                      <p className="text-sm font-semibold text-navy-900">{entry.vitals.bloodPressureSystolic}/{entry.vitals.bloodPressureDiastolic} mmHg</p>
                    </div>
                  )}
                  {entry.vitals.heartRate != null && (
                    <div className="bg-cream-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-navy-400">Heart Rate</p>
                      <p className="text-sm font-semibold text-navy-900">{entry.vitals.heartRate} bpm</p>
                    </div>
                  )}
                  {entry.vitals.temperature != null && (
                    <div className="bg-cream-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-navy-400">Temperature</p>
                      <p className="text-sm font-semibold text-navy-900">{entry.vitals.temperature}°F</p>
                    </div>
                  )}
                  {entry.vitals.oxygenSaturation != null && (
                    <div className="bg-cream-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-navy-400">O2 Sat</p>
                      <p className="text-sm font-semibold text-navy-900">{entry.vitals.oxygenSaturation}%</p>
                    </div>
                  )}
                  {entry.vitals.respiratoryRate != null && (
                    <div className="bg-cream-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-navy-400">Resp Rate</p>
                      <p className="text-sm font-semibold text-navy-900">{entry.vitals.respiratoryRate} /min</p>
                    </div>
                  )}
                  {entry.vitals.weight != null && (
                    <div className="bg-cream-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-navy-400">Weight</p>
                      <p className="text-sm font-semibold text-navy-900">{entry.vitals.weight} lbs</p>
                    </div>
                  )}
                </div>
              )}

              {/* Medication */}
              {entry.medicationLog && (
                <div className="bg-blue-50/50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Medication</span>
                    <span className="font-medium text-navy-900">{entry.medicationLog.medicationName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Dosage</span>
                    <span className="font-medium text-navy-900">{entry.medicationLog.dosage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Route</span>
                    <span className="font-medium text-navy-900">{entry.medicationLog.route}</span>
                  </div>
                </div>
              )}

              {/* Activity */}
              {entry.activityLog && (
                <div className="bg-green-50/50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Type</span>
                    <span className="font-medium text-navy-900 capitalize">{entry.activityLog.activityType.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-navy-500">Description — </span>
                    <span className="text-navy-900">{entry.activityLog.description}</span>
                  </div>
                  {entry.activityLog.duration != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-500">Duration</span>
                      <span className="font-medium text-navy-900">{entry.activityLog.duration} min</span>
                    </div>
                  )}
                  {entry.activityLog.participation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-500">Participation</span>
                      <span className="font-medium text-navy-900 capitalize">{entry.activityLog.participation}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mood */}
              {entry.moodLog && (
                <div className="bg-purple-50/50 rounded-xl p-3 grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <p className="text-navy-500">Mood</p>
                    <p className="font-medium text-navy-900 capitalize">{entry.moodLog.mood}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-navy-500">Alertness</p>
                    <p className="font-medium text-navy-900 capitalize">{entry.moodLog.alertness}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-navy-500">Appetite</p>
                    <p className="font-medium text-navy-900 capitalize">{entry.moodLog.appetite}</p>
                  </div>
                  {entry.moodLog.painLevel != null && (
                    <div className="text-sm">
                      <p className="text-navy-500">Pain Level</p>
                      <p className="font-medium text-navy-900">{entry.moodLog.painLevel}/10</p>
                    </div>
                  )}
                </div>
              )}

              {/* Incident */}
              {entry.incidentLog && (
                <div className="bg-amber-50/50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Type</span>
                    <span className="font-medium text-navy-900 capitalize">{entry.incidentLog.incidentType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Severity</span>
                    <span className={`font-medium capitalize ${
                      entry.incidentLog.severity === 'high' ? 'text-red-600'
                      : entry.incidentLog.severity === 'moderate' ? 'text-amber-600'
                      : 'text-mint-600'
                    }`}>{entry.incidentLog.severity}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-navy-500">Description — </span>
                    <span className="text-navy-900">{entry.incidentLog.description}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-navy-500">Action taken — </span>
                    <span className="text-navy-900">{entry.incidentLog.actionTaken}</span>
                  </div>
                  <div className="flex gap-3 pt-1">
                    {entry.incidentLog.physicianNotified && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Physician notified</span>
                    )}
                    {entry.incidentLog.familyNotified && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Family notified</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function NurseNotesUpload({
  currentUserId,
  currentUserName,
  currentUserRole,
  patientName,
  onAddLogEntry,
  onClose,
}: NurseNotesUploadProps) {
  const [step, setStep] = useState<'input' | 'parsing' | 'preview' | 'done'>('input')
  const [notes, setNotes] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [entries, setEntries] = useState<ParsedEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setNotes(prev => prev ? prev + '\n\n' + text : text)
    }
    reader.readAsText(file)
  }

  const handleParse = async () => {
    if (!notes.trim()) return
    setStep('parsing')
    setError(null)

    try {
      const res = await fetch('/api/parse-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notes.trim(),
          patientName,
          nurseName: currentUserName,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Unknown error')
      }

      setParseResult(data)
      setEntries(data.entries || [])
      setStep('preview')
    } catch (err: any) {
      setError(err.message || 'Failed to parse notes. Please try again.')
      setStep('input')
    }
  }

  const handleRemoveEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = async () => {
    if (entries.length === 0) return
    setSubmitting(true)

    for (const entry of entries) {
      const builtEntry = buildLogEntry(entry, currentUserId, currentUserName, currentUserRole)
      const { _inferredTime, ...logEntry } = builtEntry as any
      onAddLogEntry(logEntry)
      // Small delay so timestamps are distinct
      await new Promise(r => setTimeout(r, 30))
    }

    setSubmitting(false)
    setStep('done')
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-glass-lg animate-scale-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-primary-100/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900">AI Note Parser</h3>
              <p className="text-xs text-navy-500">
                {step === 'input' && 'Paste your shift notes — the agent will extract structured entries'}
                {step === 'parsing' && 'Agent is reading your notes…'}
                {step === 'preview' && `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} extracted — review before saving`}
                {step === 'done' && 'All entries saved to the care log'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-xl transition-colors">
            <X className="h-5 w-5 text-navy-500" />
          </button>
        </div>

        {/* ── INPUT STEP ── */}
        {step === 'input' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Example hint */}
              <div className="p-4 bg-primary-50 rounded-2xl">
                <p className="text-xs font-semibold text-primary-700 mb-1">Example note format</p>
                <p className="text-xs text-primary-600 leading-relaxed italic">
                  "8am — BP 128/82, HR 74, temp 98.4, O2 96%. Patient ate 80% breakfast, good appetite.
                  PT session 30 min, highly engaged. Mood content, pain 2/10.
                  2pm — Lisinopril 10mg oral administered."
                </p>
              </div>

              {/* Text area */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Shift Notes <span className="text-navy-400 font-normal">(paste or type below)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={10}
                  placeholder="Paste your shift notes here…"
                  className="w-full px-4 py-3 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none text-sm font-mono leading-relaxed"
                  autoFocus
                />
                <p className="text-xs text-navy-400 mt-1">{notes.length} characters</p>
              </div>

              {/* File upload */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-primary-300 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors text-sm font-medium"
                >
                  <Upload className="h-4 w-4" />
                  Upload .txt file instead
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-primary-100/50 flex gap-3 flex-shrink-0">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-primary-200 text-navy-700 rounded-xl hover:bg-cream-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleParse}
                disabled={!notes.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                Parse with AI
              </button>
            </div>
          </>
        )}

        {/* ── PARSING STEP ── */}
        {step === 'parsing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary-500" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-navy-900">Agent is reading your notes…</p>
              <p className="text-sm text-navy-500 mt-1">Extracting vitals, medications, activities, mood, and incidents</p>
            </div>
            <div className="flex gap-1">
              {['Vitals', 'Medications', 'Activities', 'Mood', 'Incidents'].map((label, i) => (
                <span
                  key={label}
                  className="px-2.5 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── PREVIEW STEP ── */}
        {step === 'preview' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Agent summary */}
              {parseResult?.summary && (
                <div className="flex items-start gap-2 p-4 bg-primary-50 rounded-2xl">
                  <Sparkles className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-primary-700 leading-relaxed">{parseResult.summary}</p>
                </div>
              )}

              {entries.length === 0 ? (
                <div className="text-center py-10 text-navy-400">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-navy-200" />
                  <p>All entries removed.</p>
                  <button onClick={() => setStep('input')} className="mt-3 text-sm text-primary-600 hover:underline">
                    Go back and re-parse
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, i) => (
                    <EntryCard
                      key={i}
                      entry={entry}
                      index={i}
                      onRemove={() => handleRemoveEntry(i)}
                    />
                  ))}
                </div>
              )}

              {/* Low confidence warning */}
              {entries.some(e => e.confidence === 'low') && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Some entries have low confidence. Please review them carefully before saving.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-primary-100/50 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setStep('input')}
                className="px-4 py-2.5 border border-primary-200 text-navy-700 rounded-xl hover:bg-cream-50 transition-colors text-sm"
              >
                Re-parse
              </button>
              <button
                onClick={handleConfirm}
                disabled={entries.length === 0 || submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <><Check className="h-4 w-4" /> Save {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} to log</>
                )}
              </button>
            </div>
          </>
        )}

        {/* ── DONE STEP ── */}
        {step === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-mint-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-mint-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-navy-900">All done!</p>
              <p className="text-sm text-navy-500 mt-1">
                {entries.length} entr{entries.length === 1 ? 'y has' : 'ies have'} been added to the care log.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
