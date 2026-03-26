'use client'

import { useState } from 'react'
import {
  Activity,
  Heart,
  Pill,
  Brain,
  AlertTriangle,
  Search,
  Plus,
  Clock,
  User,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Wind,
  Weight,
  X,
  Stethoscope,
  Smile,
  Frown,
  Meh,
  Upload,
  ClipboardList,
} from 'lucide-react'
import { LogEntrySkeleton } from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import NurseNotesUpload from '@/components/NurseNotesUpload'
import { LogEntry, LogEntryCategory, UserRole, LogComment } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'
import {
  canCreateLogEntries,
  canViewExactVitals,
  canViewIncidentDetails,
  canViewIncidentSummary,
  canViewMoodDetails,
  getVisibleLogCategories,
} from '@/lib/permissions'

// ---------------------------------------------------------------------------
// Time block helpers
// ---------------------------------------------------------------------------

function getTimeBlock(date: Date): 'Morning' | 'Afternoon' | 'Evening' {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 18) return 'Afternoon'
  return 'Evening'
}

const timeBlockMeta = {
  Morning: { emoji: '🌅', label: 'Morning', color: 'text-amber-700 bg-amber-50' },
  Afternoon: { emoji: '☀️', label: 'Afternoon', color: 'text-blue-700 bg-blue-50' },
  Evening: { emoji: '🌙', label: 'Evening', color: 'text-indigo-700 bg-indigo-50' },
}

function isFamilyFacingRole(role: UserRole): boolean {
  return role === 'family' || role === 'primary'
}

const participationToPercent: Record<string, number> = {
  active: 90,
  moderate: 60,
  minimal: 25,
  refused: 0,
}

interface CareLogProps {
  logEntries: LogEntry[]
  currentUserRole: UserRole
  currentUserId: string
  currentUserName: string
  patientName?: string
  onAddLogEntry: (entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'>) => void
  onAddComment: (entryId: string, content: string) => void
  loading?: boolean
}

const categoryConfig = {
  vitals: {
    label: 'Vitals',
    icon: Heart,
    color: 'bg-red-50 text-red-700 border-red-200',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
    accentColor: 'from-red-400 to-red-500',
  },
  medication: {
    label: 'Medication',
    icon: Pill,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    accentColor: 'from-blue-400 to-blue-500',
  },
  activity: {
    label: 'Activity',
    icon: Activity,
    color: 'bg-green-50 text-green-700 border-green-200',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
    accentColor: 'from-green-400 to-green-500',
  },
  mood: {
    label: 'Mood',
    icon: Brain,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
    accentColor: 'from-purple-400 to-purple-500',
  },
  incident: {
    label: 'Incident',
    icon: AlertTriangle,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-500',
    accentColor: 'from-amber-400 to-amber-500',
  },
}

const moodEmoji: Record<string, string> = {
  happy: '😊',
  content: '🙂',
  neutral: '😐',
  anxious: '😟',
  sad: '😢',
  agitated: '😤',
}

const alertnessLabels: Record<string, string> = {
  alert: 'Alert & Oriented',
  drowsy: 'Drowsy',
  lethargic: 'Lethargic',
  unresponsive: 'Unresponsive',
}

const participationLabels: Record<string, string> = {
  active: 'Actively Participated',
  moderate: 'Moderate Participation',
  minimal: 'Minimal Participation',
  refused: 'Refused',
}

export default function CareLog({
  logEntries,
  currentUserRole,
  currentUserId,
  currentUserName,
  patientName = 'the patient',
  onAddLogEntry,
  onAddComment,
  loading,
}: CareLogProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showNotesUpload, setShowNotesUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<LogEntryCategory | 'all'>('all')
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState<LogEntryCategory>('medication')

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formNotes, setFormNotes] = useState('')
  // Vitals
  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [temperature, setTemperature] = useState('')
  const [oxygenSat, setOxygenSat] = useState('')
  const [respRate, setRespRate] = useState('')
  const [weight, setWeight] = useState('')
  // Medication
  const [medName, setMedName] = useState('Lisinopril')
  const [medDosage, setMedDosage] = useState('10mg')
  const [medRoute, setMedRoute] = useState('Oral')
  // Activity
  const [activityType, setActivityType] = useState<string>('physical_therapy')
  const [activityDesc, setActivityDesc] = useState('Morning stretching and balance exercises with walker')
  const [activityDuration, setActivityDuration] = useState('30')
  const [activityParticipation, setActivityParticipation] = useState('active')
  // Mood
  const [mood, setMood] = useState('content')
  const [alertness, setAlertness] = useState('alert')
  const [appetite, setAppetite] = useState('good')
  const [painLevel, setPainLevel] = useState('2')
  // Incident
  const [incidentType, setIncidentType] = useState('fall')
  const [incidentSeverity, setIncidentSeverity] = useState('low')
  const [incidentDesc, setIncidentDesc] = useState('Patient attempted to stand without calling for assistance')
  const [incidentAction, setIncidentAction] = useState('Assisted patient safely back to bed; physician and family notified; fall mat placed')
  const [physicianNotified, setPhysicianNotified] = useState(false)
  const [familyNotified, setFamilyNotified] = useState(false)

  const isNurse = canCreateLogEntries(currentUserRole)
  const visibleCategories = getVisibleLogCategories(currentUserRole)
  const showExactVitals = canViewExactVitals(currentUserRole)
  const showIncidentDetails = canViewIncidentDetails(currentUserRole)
  const showIncidentSummary = canViewIncidentSummary(currentUserRole)
  const showMoodDetails = canViewMoodDetails(currentUserRole) && !isFamilyFacingRole(currentUserRole)
  const isFamilyView = isFamilyFacingRole(currentUserRole)

  const filteredEntries = logEntries
    .filter((entry) => {
      const matchesRole = visibleCategories.includes(entry.category)
      const matchesSearch =
        searchQuery === '' ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.enteredByName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || entry.category === filterCategory
      // HIPAA: for family/primary roles, only show therapy, OT, meal activities + mood
      const matchesHipaa = !isFamilyView ||
        entry.category === 'mood' ||
        (entry.category === 'activity' && entry.activityLog &&
          ['physical_therapy', 'occupational_therapy', 'meal'].includes(entry.activityLog.activityType))
      return matchesRole && matchesSearch && matchesCategory && matchesHipaa
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleComment = (entryId: string) => {
    const content = commentInputs[entryId]?.trim()
    if (!content) return
    onAddComment(entryId, content)
    setCommentInputs((prev) => ({ ...prev, [entryId]: '' }))
  }

  const resetForm = () => {
    setFormTitle('')
    setFormNotes('')
    setBpSystolic('')
    setBpDiastolic('')
    setHeartRate('')
    setTemperature('')
    setOxygenSat('')
    setRespRate('')
    setWeight('')
    setMedName('Lisinopril')
    setMedDosage('10mg')
    setMedRoute('Oral')
    setActivityType('physical_therapy')
    setActivityDesc('Morning stretching and balance exercises with walker')
    setActivityDuration('30')
    setActivityParticipation('active')
    setMood('content')
    setAlertness('alert')
    setAppetite('good')
    setPainLevel('2')
    setIncidentType('fall')
    setIncidentSeverity('low')
    setIncidentDesc('Patient attempted to stand without calling for assistance')
    setIncidentAction('Assisted patient safely back to bed; physician and family notified; fall mat placed')
    setPhysicianNotified(false)
    setFamilyNotified(false)
  }

  const handleSubmitEntry = () => {
    if (!formTitle) return

    const entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'> = {
      category: selectedCategory,
      title: formTitle,
      notes: formNotes || undefined,
      enteredBy: currentUserId,
      enteredByName: currentUserName,
      enteredByRole: currentUserRole,
    }

    if (selectedCategory === 'vitals') {
      entry.vitals = {
        bloodPressureSystolic: bpSystolic ? Number(bpSystolic) : undefined,
        bloodPressureDiastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
        heartRate: heartRate ? Number(heartRate) : undefined,
        temperature: temperature ? Number(temperature) : undefined,
        oxygenSaturation: oxygenSat ? Number(oxygenSat) : undefined,
        respiratoryRate: respRate ? Number(respRate) : undefined,
        weight: weight ? Number(weight) : undefined,
      }
    } else if (selectedCategory === 'medication') {
      entry.medicationLog = {
        medicationName: medName,
        dosage: medDosage,
        route: medRoute,
        administeredBy: currentUserName,
      }
    } else if (selectedCategory === 'activity') {
      entry.activityLog = {
        activityType: activityType as any,
        description: activityDesc,
        duration: activityDuration ? Number(activityDuration) : undefined,
        participation: activityParticipation as any,
      }
    } else if (selectedCategory === 'mood') {
      entry.moodLog = {
        mood: mood as any,
        alertness: alertness as any,
        appetite: appetite as any,
        painLevel: painLevel ? Number(painLevel) : undefined,
        notes: formNotes || undefined,
      }
    } else if (selectedCategory === 'incident') {
      entry.incidentLog = {
        incidentType: incidentType as any,
        severity: incidentSeverity as any,
        description: incidentDesc,
        actionTaken: incidentAction,
        physicianNotified,
        familyNotified,
      }
    }

    onAddLogEntry(entry)
    resetForm()
    setShowAddModal(false)
  }

  // Group entries by date, then by time block
  const groupedEntries = filteredEntries.reduce<Record<string, Record<string, LogEntry[]>>>((groups, entry) => {
    const dateKey = format(new Date(entry.createdAt), 'yyyy-MM-dd')
    const block = getTimeBlock(new Date(entry.createdAt))
    if (!groups[dateKey]) groups[dateKey] = { Morning: [], Afternoon: [], Evening: [] }
    groups[dateKey][block].push(entry)
    return groups
  }, {})

  const getDateLabel = (dateKey: string) => {
    const date = new Date(dateKey + 'T12:00:00')
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) return "Today's Log"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday's Log"
    return format(date, 'EEEE, MMMM d')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Daily Care Log</h2>
          <p className="text-navy-600 mt-1">
            {isNurse
              ? 'Document care activities and patient updates'
              : "View your loved one's daily care updates"}
          </p>
        </div>
        {isNurse && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotesUpload(true)}
              className="flex items-center px-4 py-2.5 border border-primary-300 text-primary-700 bg-white/80 rounded-2xl hover:bg-primary-50 transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Notes
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-float hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Entry
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log entries..."
            className="w-full pl-10 pr-4 py-2.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white/80"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filterCategory === 'all'
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'bg-white text-navy-600 hover:bg-cream-100 border border-primary-200'
            }`}
          >
            All
          </button>
          {(Object.keys(categoryConfig) as LogEntryCategory[]).filter(cat => visibleCategories.includes(cat)).map((cat) => {
            const config = categoryConfig[cat]
            const Icon = config.icon
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  filterCategory === cat
                    ? config.color
                    : 'bg-white text-navy-600 hover:bg-cream-100 border border-primary-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Log Entries grouped by date then time block */}
      <div className="space-y-8">
        {loading ? (
          <>
            <LogEntrySkeleton />
            <LogEntrySkeleton />
            <LogEntrySkeleton />
            <LogEntrySkeleton />
          </>
        ) : Object.keys(groupedEntries).length === 0 ? (
          <EmptyState icon={ClipboardList} title="No log entries yet" description="Care staff will log activities, medications, and notes here." />
        ) : (
          Object.entries(groupedEntries).map(([dateKey, blockGroups]) => {
            const totalEntries = Object.values(blockGroups).reduce((sum, arr) => sum + arr.length, 0)
            return (
            <div key={dateKey}>
              <h3 className="text-lg font-semibold text-navy-800 mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary-400 to-accent-400"></div>
                {getDateLabel(dateKey)}
                <span className="text-sm font-normal text-navy-500">
                  ({totalEntries} {totalEntries === 1 ? 'entry' : 'entries'})
                </span>
              </h3>

              <div className="space-y-6">
                {(['Morning', 'Afternoon', 'Evening'] as const).map(block => {
                  const entries = blockGroups[block]
                  if (!entries || entries.length === 0) return null
                  return (
                    <div key={block}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">{timeBlockMeta[block].emoji}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${timeBlockMeta[block].color}`}>
                          {timeBlockMeta[block].label}
                        </span>
                      </div>
                      <div className="space-y-4">
                {entries.map((entry) => {
                  const config = categoryConfig[entry.category]
                  const Icon = config.icon
                  const isExpanded = expandedEntries.has(entry.id)

                  return (
                    <div
                      key={entry.id}
                      className="card-glass overflow-hidden hover:shadow-float transition-all duration-300"
                    >
                      {/* Category accent bar */}
                      <div className={`h-1 bg-gradient-to-r ${config.accentColor}`}></div>

                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${config.bgColor} flex-shrink-0`}>
                            <Icon className={`h-6 w-6 ${config.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                                    {config.label}
                                  </span>
                                  <h3 className="font-semibold text-navy-900">{entry.title}</h3>
                                </div>
                                {entry.notes && (
                                  <p className="text-navy-600 mt-1 text-sm leading-relaxed">{entry.notes}</p>
                                )}
                              </div>
                              <button
                                onClick={() => toggleExpand(entry.id)}
                                className="p-1.5 hover:bg-cream-100 rounded-lg transition-colors flex-shrink-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-navy-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-navy-400" />
                                )}
                              </button>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                              <div className="mt-4 space-y-3">
                                {/* Vitals */}
                                {entry.vitals && showExactVitals && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {entry.vitals.bloodPressureSystolic && (
                                      <div className="bg-cream-50 rounded-xl p-3">
                                        <div className="text-xs text-navy-500 mb-1">Blood Pressure</div>
                                        <div className="font-semibold text-navy-900">
                                          {entry.vitals.bloodPressureSystolic}/{entry.vitals.bloodPressureDiastolic} mmHg
                                        </div>
                                      </div>
                                    )}
                                    {entry.vitals.heartRate && (
                                      <div className="bg-cream-50 rounded-xl p-3">
                                        <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                                          <Heart className="h-3 w-3" /> Heart Rate
                                        </div>
                                        <div className="font-semibold text-navy-900">{entry.vitals.heartRate} bpm</div>
                                      </div>
                                    )}
                                    {entry.vitals.temperature && (
                                      <div className="bg-cream-50 rounded-xl p-3">
                                        <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                                          <Thermometer className="h-3 w-3" /> Temperature
                                        </div>
                                        <div className="font-semibold text-navy-900">{entry.vitals.temperature}°F</div>
                                      </div>
                                    )}
                                    {entry.vitals.oxygenSaturation && (
                                      <div className="bg-cream-50 rounded-xl p-3">
                                        <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                                          <Wind className="h-3 w-3" /> O2 Saturation
                                        </div>
                                        <div className="font-semibold text-navy-900">{entry.vitals.oxygenSaturation}%</div>
                                      </div>
                                    )}
                                    {entry.vitals.respiratoryRate && (
                                      <div className="bg-cream-50 rounded-xl p-3">
                                        <div className="text-xs text-navy-500 mb-1">Respiratory Rate</div>
                                        <div className="font-semibold text-navy-900">{entry.vitals.respiratoryRate} /min</div>
                                      </div>
                                    )}
                                    {entry.vitals.weight && (
                                      <div className="bg-cream-50 rounded-xl p-3">
                                        <div className="text-xs text-navy-500 mb-1 flex items-center gap-1">
                                          <Weight className="h-3 w-3" /> Weight
                                        </div>
                                        <div className="font-semibold text-navy-900">{entry.vitals.weight} lbs</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {entry.vitals && !showExactVitals && (
                                  <div className="bg-cream-50 rounded-xl p-3">
                                    <p className="text-sm text-navy-600">Vitals recorded — within expected range. Contact nursing staff for details.</p>
                                  </div>
                                )}

                                {/* Medication */}
                                {entry.medicationLog && (
                                  <div className="bg-blue-50/50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-navy-500">Medication</span>
                                      <span className="font-medium text-navy-900">{entry.medicationLog.medicationName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-navy-500">Dosage</span>
                                      <span className="font-medium text-navy-900">{entry.medicationLog.dosage}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-navy-500">Route</span>
                                      <span className="font-medium text-navy-900">{entry.medicationLog.route}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-navy-500">Administered By</span>
                                      <span className="font-medium text-navy-900">{entry.medicationLog.administeredBy}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Activity */}
                                {entry.activityLog && (
                                  <div className="bg-green-50/50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-navy-500">Activity</span>
                                      <span className="font-medium text-navy-900 capitalize">
                                        {entry.activityLog.activityType.replace('_', ' ')}
                                      </span>
                                    </div>
                                    {/* Family view: meal — show % eaten */}
                                    {isFamilyView && entry.activityLog.activityType === 'meal' && entry.activityLog.participation ? (
                                      <div className="flex justify-between">
                                        <span className="text-sm text-navy-500">Meal</span>
                                        <span className="font-medium text-navy-900">
                                          {participationToPercent[entry.activityLog.participation] ?? 60}% eaten
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        <div>
                                          <span className="text-sm text-navy-500">Description</span>
                                          <p className="text-navy-900 text-sm mt-0.5">{entry.activityLog.description}</p>
                                        </div>
                                        {entry.activityLog.duration && (
                                          <div className="flex justify-between">
                                            <span className="text-sm text-navy-500">Duration</span>
                                            <span className="font-medium text-navy-900">{entry.activityLog.duration} min</span>
                                          </div>
                                        )}
                                        {entry.activityLog.participation && (
                                          <div className="flex justify-between">
                                            <span className="text-sm text-navy-500">Participation</span>
                                            <span className="font-medium text-navy-900">
                                              {participationLabels[entry.activityLog.participation]}
                                            </span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* Mood */}
                                {entry.moodLog && (
                                  <div className="bg-purple-50/50 rounded-xl p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="text-center p-3 bg-white rounded-xl">
                                        <div className="text-2xl mb-1">{moodEmoji[entry.moodLog.mood]}</div>
                                        <div className="text-sm font-medium text-navy-900 capitalize">{entry.moodLog.mood}</div>
                                        <div className="text-xs text-navy-500">Mood</div>
                                      </div>
                                      {showMoodDetails && (
                                        <div className="text-center p-3 bg-white rounded-xl">
                                          <div className="text-sm font-medium text-navy-900">{alertnessLabels[entry.moodLog.alertness]}</div>
                                          <div className="text-xs text-navy-500">Alertness</div>
                                        </div>
                                      )}
                                      {showMoodDetails && (
                                        <div className="text-center p-3 bg-white rounded-xl">
                                          <div className="text-sm font-medium text-navy-900 capitalize">{entry.moodLog.appetite}</div>
                                          <div className="text-xs text-navy-500">Appetite</div>
                                        </div>
                                      )}
                                      {showMoodDetails && entry.moodLog.painLevel !== undefined && (
                                        <div className="text-center p-3 bg-white rounded-xl">
                                          <div className="text-sm font-medium text-navy-900">{entry.moodLog.painLevel}/10</div>
                                          <div className="text-xs text-navy-500">Pain Level</div>
                                        </div>
                                      )}
                                    </div>
                                    {showMoodDetails && entry.moodLog.notes && (
                                      <p className="text-sm text-navy-600 mt-3">{entry.moodLog.notes}</p>
                                    )}
                                  </div>
                                )}

                                {/* Incident — full detail for primary/nurse */}
                                {entry.incidentLog && showIncidentDetails && (
                                  <div className="bg-amber-50/50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-navy-500">Type</span>
                                      <span className="font-medium text-navy-900 capitalize">
                                        {entry.incidentLog.incidentType.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-navy-500">Severity</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                        entry.incidentLog.severity === 'high'
                                          ? 'bg-red-100 text-red-700'
                                          : entry.incidentLog.severity === 'moderate'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {entry.incidentLog.severity}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-navy-500">Description</span>
                                      <p className="text-navy-900 text-sm mt-0.5">{entry.incidentLog.description}</p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-navy-500">Action Taken</span>
                                      <p className="text-navy-900 text-sm mt-0.5">{entry.incidentLog.actionTaken}</p>
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                      {entry.incidentLog.physicianNotified && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                          Physician Notified
                                        </span>
                                      )}
                                      {entry.incidentLog.familyNotified && (
                                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                          Family Notified
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Incident — title + severity only for admin */}
                                {entry.incidentLog && showIncidentSummary && (
                                  <div className="bg-amber-50/50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-navy-600 font-medium">{entry.title}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                        entry.incidentLog.severity === 'high'
                                          ? 'bg-red-100 text-red-700'
                                          : entry.incidentLog.severity === 'moderate'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {entry.incidentLog.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-navy-500">Full details available to Primary contact and nursing staff.</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Meta + Comments */}
                            <div className="flex items-center gap-4 mt-3 text-sm text-navy-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {entry.enteredByName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {getTimeBlock(new Date(entry.createdAt))}
                              </span>
                              <button
                                onClick={() => toggleExpand(entry.id)}
                                className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                {entry.comments.length}
                              </button>
                            </div>

                            {/* Comments section */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-primary-100/50">
                                {entry.comments.map((comment) => (
                                  <div key={comment.id} className="flex gap-3 mb-3">
                                    <div className="h-7 w-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-primary-700 text-xs font-medium">
                                        {comment.authorName.split(' ').map((n) => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div className="flex-1 bg-cream-50 rounded-xl px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-navy-800 text-sm">{comment.authorName}</span>
                                        <span className="text-xs text-navy-400">
                                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                      </div>
                                      <p className="text-navy-700 text-sm">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Comment input */}
                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={commentInputs[entry.id] || ''}
                                    onChange={(e) =>
                                      setCommentInputs((prev) => ({ ...prev, [entry.id]: e.target.value }))
                                    }
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(entry.id)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-3 py-2 bg-cream-50 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                                  />
                                  <button
                                    onClick={() => handleComment(entry.id)}
                                    disabled={!commentInputs[entry.id]?.trim()}
                                    className="p-2 text-primary-500 disabled:text-navy-300 hover:bg-primary-50 rounded-lg transition-colors"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            )
          })
        )}
      </div>

      {/* Nurse Notes Upload Modal */}
      {showNotesUpload && isNurse && (
        <NurseNotesUpload
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
          patientName={patientName}
          onAddLogEntry={onAddLogEntry}
          onClose={() => setShowNotesUpload(false)}
        />
      )}

      {/* Nurse Entry Modal */}
      {showAddModal && isNurse && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-glass-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-primary-100/50 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-xl font-bold text-navy-900">New Log Entry</h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm() }}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Category Selection (vitals excluded — logged via QuickActions) */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Entry Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(categoryConfig) as LogEntryCategory[]).filter(cat => cat !== 'vitals').map((cat) => {
                    const config = categoryConfig[cat]
                    const CatIcon = config.icon
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200 border-2 ${
                          selectedCategory === cat
                            ? `${config.color} border-current shadow-sm`
                            : 'border-cream-200 text-navy-500 hover:bg-cream-50'
                        }`}
                      >
                        <CatIcon className="h-5 w-5" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="Brief description of the entry"
                />
              </div>

              {/* Category-specific fields */}
              {selectedCategory === 'vitals' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">BP Systolic</label>
                      <input type="number" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="120" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">BP Diastolic</label>
                      <input type="number" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="80" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Heart Rate</label>
                      <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="72" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Temp (°F)</label>
                      <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="98.6" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">O2 Sat (%)</label>
                      <input type="number" value={oxygenSat} onChange={(e) => setOxygenSat(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="97" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Resp Rate</label>
                      <input type="number" value={respRate} onChange={(e) => setRespRate(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="16" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Weight (lbs)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="145" />
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === 'medication' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Medication Name</label>
                    <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="e.g., Lisinopril 10mg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Dosage</label>
                      <input type="text" value={medDosage} onChange={(e) => setMedDosage(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="10mg" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Route</label>
                      <select value={medRoute} onChange={(e) => setMedRoute(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                        <option>Oral</option>
                        <option>IV</option>
                        <option>Injection</option>
                        <option>Topical</option>
                        <option>Inhaled</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === 'activity' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Activity Type</label>
                    <select value={activityType} onChange={(e) => setActivityType(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                      <option value="physical_therapy">Physical Therapy</option>
                      <option value="occupational_therapy">Occupational Therapy</option>
                      <option value="meal">Meal</option>
                      <option value="social">Social Activity</option>
                      <option value="walk">Walk</option>
                      <option value="exercise">Exercise</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Description</label>
                    <textarea value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" rows={2} placeholder="Describe the activity..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Duration (min)</label>
                      <input type="number" value={activityDuration} onChange={(e) => setActivityDuration(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="45" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Participation</label>
                      <select value={activityParticipation} onChange={(e) => setActivityParticipation(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                        <option value="active">Active</option>
                        <option value="moderate">Moderate</option>
                        <option value="minimal">Minimal</option>
                        <option value="refused">Refused</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === 'mood' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-2">Mood</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(moodEmoji).map(([key, emoji]) => (
                        <button key={key} onClick={() => setMood(key)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-sm border-2 transition-all ${
                            mood === key ? 'border-purple-400 bg-purple-50' : 'border-cream-200 hover:bg-cream-50'
                          }`}>
                          <span className="text-lg">{emoji}</span>
                          <span className="capitalize">{key}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Alertness</label>
                      <select value={alertness} onChange={(e) => setAlertness(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                        <option value="alert">Alert & Oriented</option>
                        <option value="drowsy">Drowsy</option>
                        <option value="lethargic">Lethargic</option>
                        <option value="unresponsive">Unresponsive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Appetite</label>
                      <select value={appetite} onChange={(e) => setAppetite(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="refused">Refused</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Pain Level (0-10)</label>
                    <input type="range" min="0" max="10" value={painLevel} onChange={(e) => setPainLevel(e.target.value)}
                      className="w-full accent-purple-500" />
                    <div className="flex justify-between text-xs text-navy-400 mt-1">
                      <span>No pain</span>
                      <span className="font-medium text-navy-700">{painLevel}</span>
                      <span>Worst pain</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === 'incident' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Incident Type</label>
                      <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                        <option value="fall">Fall</option>
                        <option value="behavior_change">Behavior Change</option>
                        <option value="condition_change">Condition Change</option>
                        <option value="complaint">Complaint</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-navy-600 mb-1">Severity</label>
                      <select value={incidentSeverity} onChange={(e) => setIncidentSeverity(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Description</label>
                    <textarea value={incidentDesc} onChange={(e) => setIncidentDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" rows={2} placeholder="Describe what happened..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Action Taken</label>
                    <textarea value={incidentAction} onChange={(e) => setIncidentAction(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" rows={2} placeholder="What actions were taken..." />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={physicianNotified} onChange={(e) => setPhysicianNotified(e.target.checked)}
                        className="rounded border-primary-300 text-primary-600 focus:ring-primary-400" />
                      Physician Notified
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={familyNotified} onChange={(e) => setFamilyNotified(e.target.checked)}
                        className="rounded border-primary-300 text-primary-600 focus:ring-primary-400" />
                      Family Notified
                    </label>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-primary-100/50 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <button
                onClick={() => { setShowAddModal(false); resetForm() }}
                className="flex-1 px-4 py-2.5 border border-primary-200 text-navy-700 rounded-xl hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEntry}
                disabled={!formTitle}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
