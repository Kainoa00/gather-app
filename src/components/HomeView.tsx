'use client'

import { useMemo, useState } from 'react'
import {
  Heart,
  Brain,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  ClipboardList,
  Activity,
  CheckSquare,
  ChevronRight,
  Target,
  Utensils,
} from 'lucide-react'
import { PatientInfo, LogEntry, CalendarEvent, Visit, CareCircleMember, UserRole, FacilityReviewEntry } from '@/types'
import { differenceInDays, format, isToday, isTomorrow, addDays, formatDistanceToNow } from 'date-fns'
import FacilityReview from './FacilityReview'
import { canViewExactVitals, canViewMoodDetails } from '@/lib/permissions'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HomeViewProps {
  patient: PatientInfo
  logEntries: LogEntry[]
  events: CalendarEvent[]
  visits: Visit[]
  members: CareCircleMember[]
  currentUserId: string
  currentUserName: string
  currentUserRole: UserRole
  reviews: FacilityReviewEntry[]
  onClaimVisit: (eventId: string) => void
  onAddReview: (review: FacilityReviewEntry) => void
  onNavigateToCalendar: () => void
}

// ---------------------------------------------------------------------------
// Shared demo goals (also used in CareLog Progress tab via page.tsx)
// ---------------------------------------------------------------------------

export const demoGoals = [
  {
    id: 'g1',
    title: 'Regain Independent Walking',
    category: 'Mobility',
    targetDate: 'Apr 15',
    progressPercent: 65,
    description: 'Walk 50ft unassisted',
    milestones: ['Walk with walker 20ft', 'Walk with minimal assist 30ft', 'Independent 50ft walk'],
  },
  {
    id: 'g2',
    title: 'Improve Nutritional Intake',
    category: 'Nutrition',
    targetDate: 'Mar 30',
    progressPercent: 80,
    description: 'Achieve 80% meal completion consistently',
    milestones: ['50% meal completion', '70% meal completion', '80% meal completion'],
  },
  {
    id: 'g3',
    title: 'Reduce Pain Levels',
    category: 'Comfort',
    targetDate: 'Apr 1',
    progressPercent: 50,
    description: 'Maintain pain score below 3/10',
    milestones: ['Pain management plan in place', 'Average pain 5/10', 'Average pain 3/10'],
  },
  {
    id: 'g4',
    title: 'Restore Upper Body Strength',
    category: 'Therapy',
    targetDate: 'May 1',
    progressPercent: 40,
    description: 'Complete OT strength exercises independently',
    milestones: ['Assisted exercises 3x/week', 'Partial independent exercises', 'Full independent exercises'],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeBlock(date: Date): 'Morning' | 'Afternoon' | 'Evening' {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 18) return 'Afternoon'
  return 'Evening'
}

const timeBlockConfig = {
  Morning: { emoji: '🌅', color: 'bg-amber-50 text-amber-700' },
  Afternoon: { emoji: '☀️', color: 'bg-blue-50 text-blue-700' },
  Evening: { emoji: '🌙', color: 'bg-indigo-50 text-indigo-700' },
}

const participationToPercent: Record<string, number> = {
  active: 90,
  moderate: 60,
  minimal: 25,
  refused: 0,
}

const moodEmoji: Record<string, string> = {
  happy: '😊',
  content: '🙂',
  neutral: '😐',
  anxious: '😟',
  sad: '😢',
  agitated: '😤',
}

const moodLabel: Record<string, string> = {
  happy: 'Happy & Engaged',
  content: 'Content & Calm',
  neutral: 'Neutral',
  anxious: 'Anxious',
  sad: 'Sad',
  agitated: 'Agitated',
}

const eventTypeConfig = {
  doctor_visit: { label: 'Doctor Visit', emoji: '🩺', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  therapy_session: { label: 'Therapy', emoji: '💪', color: 'bg-green-50 text-green-700 border-green-200' },
  facility_event: { label: 'Facility Event', emoji: '🎉', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  family_visit: { label: 'Family Visit', emoji: '👨‍👩‍👧', color: 'bg-accent-50 text-accent-700 border-accent-200' },
}

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

function getVitalStatus(label: string, value: number): { text: string; color: string } {
  switch (label) {
    case 'bp': {
      if (value <= 120) return { text: 'Normal', color: 'text-mint-600' }
      if (value <= 140) return { text: 'Elevated', color: 'text-amber-600' }
      return { text: 'High', color: 'text-red-600' }
    }
    case 'hr': {
      if (value >= 60 && value <= 100) return { text: 'Stable', color: 'text-blue-600' }
      return { text: 'Check', color: 'text-amber-600' }
    }
    case 'o2': {
      if (value >= 95) return { text: 'Excellent', color: 'text-mint-600' }
      if (value >= 90) return { text: 'Normal', color: 'text-blue-600' }
      return { text: 'Low', color: 'text-red-600' }
    }
    case 'temp': {
      if (value >= 97 && value <= 99) return { text: 'Normal', color: 'text-mint-600' }
      return { text: 'Check', color: 'text-amber-600' }
    }
    default:
      return { text: 'Normal', color: 'text-mint-600' }
  }
}

function generateDigestSummary(
  patient: PatientInfo,
  logEntries: LogEntry[],
  visits: Visit[],
  showVitalsNumbers: boolean = true,
): string {
  const todayVisits = visits.filter((v) => isToday(new Date(v.checkInTime)))

  const latestMood = [...logEntries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .find((e) => e.category === 'mood' && e.moodLog)

  const latestVitals = [...logEntries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .find((e) => e.category === 'vitals' && e.vitals)

  const latestActivity = [...logEntries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .find((e) => e.category === 'activity' && e.activityLog)

  const firstName = patient.name.split(' ')[0]
  const parts: string[] = []

  if (latestMood?.moodLog) {
    const moodText = latestMood.moodLog.mood === 'happy'
      ? 'has had a wonderful day so far'
      : latestMood.moodLog.mood === 'content'
        ? 'has been calm and comfortable today'
        : latestMood.moodLog.mood === 'neutral'
          ? 'has had a steady day'
          : 'has had a challenging day'
    parts.push(`${firstName} ${moodText}.`)
  } else {
    parts.push(`${firstName} has had a steady day so far.`)
  }

  if (latestActivity?.activityLog) {
    const activity = latestActivity.activityLog
    if (activity.activityType === 'physical_therapy') {
      parts.push(`She was ${activity.participation === 'active' ? 'highly responsive' : 'engaged'} during her morning mobility exercise, completing all tasks with a smile.`)
    } else if (activity.activityType === 'social') {
      parts.push(`She particularly enjoyed the afternoon social activity, spending time chatting with her neighbor.`)
    } else if (activity.activityType === 'meal') {
      parts.push(`Meal time went ${activity.participation === 'active' ? 'very well' : 'smoothly'} today.`)
    } else {
      parts.push(`She participated in ${activity.description.toLowerCase()} today.`)
    }
  }

  if (latestVitals?.vitals) {
    const bp = latestVitals.vitals.bloodPressureSystolic
    if (showVitalsNumbers && bp) {
      if (bp <= 130) {
        parts.push(`Vitals are stable — BP ${bp}/${latestVitals.vitals.bloodPressureDiastolic}, HR ${latestVitals.vitals.heartRate || '--'}.`)
      } else {
        parts.push(`Vitals are being monitored — BP ${bp}/${latestVitals.vitals.bloodPressureDiastolic}.`)
      }
    } else if (bp && bp <= 130) {
      parts.push('Her vitals have been perfectly stable throughout the last 24 hours.')
    } else if (bp) {
      parts.push('Her vitals are being monitored closely today.')
    }
  }

  if (latestMood?.moodLog?.appetite) {
    parts.push(`Her appetite remains ${latestMood.moodLog.appetite}.`)
  }

  if (todayVisits.length > 0) {
    parts.push(`She had ${todayVisits.length} visit${todayVisits.length > 1 ? 's' : ''} today.`)
  }

  return parts.join(' ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeView({
  patient,
  logEntries,
  events,
  visits,
  currentUserId,
  currentUserName,
  currentUserRole,
  onAddReview,
  onNavigateToCalendar,
}: HomeViewProps) {
  const [homeTab, setHomeTab] = useState<'log' | 'plan' | 'progress'>('log')
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Derived data
  const sortedEntries = useMemo(
    () => [...logEntries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [logEntries],
  )

  const latestVitals = useMemo(
    () => sortedEntries.find((e) => e.category === 'vitals' && e.vitals),
    [sortedEntries],
  )

  const latestMood = useMemo(
    () => sortedEntries.find((e) => e.category === 'mood' && e.moodLog),
    [sortedEntries],
  )

  const stayDuration = useMemo(
    () => differenceInDays(new Date(), new Date(patient.admissionDate)),
    [patient.admissionDate],
  )

  const digestSummary = useMemo(
    () => generateDigestSummary(patient, logEntries, visits, canViewExactVitals(currentUserRole)),
    [patient, logEntries, visits, currentUserRole],
  )

  // Upcoming appointments — next 14 days, doctor/therapy only, max 3
  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    const twoWeeksOut = addDays(now, 14)
    return events
      .filter(e =>
        (e.type === 'doctor_visit' || e.type === 'therapy_session') &&
        new Date(e.date) >= now &&
        new Date(e.date) <= twoWeeksOut
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
  }, [events])

  // Today's HIPAA-safe entries for Log tab (therapy, OT, meals, mood only)
  const todayHipaaEntries = useMemo(() => {
    return logEntries
      .filter(entry => {
        if (!isToday(new Date(entry.createdAt))) return false
        if (entry.category === 'mood') return true
        if (entry.category === 'activity' && entry.activityLog) {
          const t = entry.activityLog.activityType
          return t === 'physical_therapy' || t === 'occupational_therapy' || t === 'meal'
        }
        return false
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [logEntries])

  // Group today's entries by time block
  const entriesByTimeBlock = useMemo(() => {
    const groups: Record<string, LogEntry[]> = { Morning: [], Afternoon: [], Evening: [] }
    todayHipaaEntries.forEach(entry => {
      const block = getTimeBlock(new Date(entry.createdAt))
      groups[block].push(entry)
    })
    return groups
  }, [todayHipaaEntries])

  // This week's events for Plan tab
  const thisWeekEvents = useMemo(() => {
    const now = new Date()
    const weekOut = addDays(now, 7)
    return events
      .filter(e => new Date(e.date) >= now && new Date(e.date) <= weekOut)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  // Weekly stats for Progress tab
  const weeklyStats = useMemo(() => {
    const sevenDaysAgo = addDays(new Date(), -7)
    const recentEntries = logEntries.filter(e => new Date(e.createdAt) >= sevenDaysAgo)
    const therapySessions = recentEntries.filter(e =>
      e.category === 'activity' &&
      (e.activityLog?.activityType === 'physical_therapy' || e.activityLog?.activityType === 'occupational_therapy')
    ).length
    const mealEntries = recentEntries.filter(e =>
      e.category === 'activity' && e.activityLog?.activityType === 'meal'
    )
    const avgMealParticipation = mealEntries.length > 0
      ? Math.round(
          mealEntries.reduce((sum, e) =>
            sum + (participationToPercent[e.activityLog?.participation || 'moderate'] ?? 60), 0
          ) / mealEntries.length
        )
      : 0
    return { therapySessions, avgMealParticipation, mealCount: mealEntries.length }
  }, [logEntries])

  const isSimplifiedVitals = !canViewExactVitals(currentUserRole)
  const showMoodDetails = canViewMoodDetails(currentUserRole)

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ================================================================= */}
      {/* LEFT SIDEBAR                                                      */}
      {/* ================================================================= */}
      <aside className="w-full lg:w-[340px] xl:w-[360px] flex-shrink-0 space-y-5">
        {/* ----- Patient Profile Card ----- */}
        <div className="card-glass p-6 text-center">
          <div className="relative inline-block mb-4">
            {patient.photoUrl ? (
              <img
                src={patient.photoUrl}
                alt={patient.name}
                className="h-24 w-24 rounded-full object-cover shadow-soft border-4 border-white"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center shadow-soft border-4 border-white mx-auto">
                <span className="text-white font-bold text-2xl">{getInitials(patient.name)}</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-mint-500 rounded-full border-3 border-white shadow-sm" style={{ borderWidth: '3px' }}></div>
          </div>

          <h2 className="text-xl font-bold text-navy-900">{patient.name}</h2>
          <p className="text-sm text-navy-500 mt-1">
            Room {patient.roomNumber} · Skilled Nursing
          </p>

          <div className="mt-4 inline-flex flex-col items-center">
            <div className="px-5 py-2.5 bg-gradient-to-r from-primary-100 to-accent-100 rounded-2xl border border-primary-200/50">
              <p className="text-xs font-medium text-navy-500 uppercase tracking-wider">Stay Duration</p>
              <p className="text-2xl font-bold text-navy-900 mt-0.5">
                {stayDuration} <span className="text-base font-medium text-navy-600">Days</span>
              </p>
              <p className="text-[11px] text-navy-400 mt-0.5">
                since admission {format(new Date(patient.admissionDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* ----- Upcoming Appointments Widget ----- */}
        {upcomingAppointments.length > 0 && (
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-bold text-navy-900">Upcoming</h3>
              </div>
              <button
                onClick={onNavigateToCalendar}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5"
              >
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {upcomingAppointments.map(event => {
                const eventDate = new Date(event.date)
                const config = eventTypeConfig[event.type]
                const dateLabel = isToday(eventDate)
                  ? 'Today'
                  : isTomorrow(eventDate)
                    ? 'Tomorrow'
                    : format(eventDate, 'EEE, MMM d')
                return (
                  <div key={event.id} className="flex items-center gap-3 p-2.5 bg-white/60 rounded-xl">
                    <span className="text-base">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-navy-900 truncate">{event.title}</p>
                      <p className="text-xs text-navy-500">{dateLabel}{event.time ? ` · ${event.time}` : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ----- Vitals Snapshot Card ----- */}
        <div className="card-glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-red-50">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-navy-900">Vitals Snapshot</h3>
          </div>

          {latestVitals?.vitals ? (
            <div className="grid grid-cols-2 gap-3">
              {latestVitals.vitals.bloodPressureSystolic != null && latestVitals.vitals.bloodPressureDiastolic != null && (
                <div className="p-3 bg-white/60 rounded-xl">
                  <p className="text-[10px] font-medium text-navy-400 uppercase tracking-wider">Blood Pressure</p>
                  {isSimplifiedVitals ? (
                    <p className={`text-sm font-bold mt-1 ${getVitalStatus('bp', latestVitals.vitals.bloodPressureSystolic).color}`}>
                      {getVitalStatus('bp', latestVitals.vitals.bloodPressureSystolic).text}
                    </p>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-navy-900 mt-1">
                        {latestVitals.vitals.bloodPressureSystolic}/{latestVitals.vitals.bloodPressureDiastolic}
                      </p>
                      <p className={`text-xs font-medium ${getVitalStatus('bp', latestVitals.vitals.bloodPressureSystolic).color}`}>
                        {getVitalStatus('bp', latestVitals.vitals.bloodPressureSystolic).text}
                      </p>
                    </>
                  )}
                </div>
              )}

              {latestVitals.vitals.heartRate != null && (
                <div className="p-3 bg-white/60 rounded-xl">
                  <p className="text-[10px] font-medium text-navy-400 uppercase tracking-wider">Heart Rate</p>
                  {isSimplifiedVitals ? (
                    <p className={`text-sm font-bold mt-1 ${getVitalStatus('hr', latestVitals.vitals.heartRate).color}`}>
                      {getVitalStatus('hr', latestVitals.vitals.heartRate).text}
                    </p>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-navy-900 mt-1">
                        {latestVitals.vitals.heartRate} <span className="text-xs font-normal text-navy-500">bpm</span>
                      </p>
                      <p className={`text-xs font-medium ${getVitalStatus('hr', latestVitals.vitals.heartRate).color}`}>
                        {getVitalStatus('hr', latestVitals.vitals.heartRate).text}
                      </p>
                    </>
                  )}
                </div>
              )}

              {latestVitals.vitals.oxygenSaturation != null && (
                <div className="p-3 bg-white/60 rounded-xl">
                  <p className="text-[10px] font-medium text-navy-400 uppercase tracking-wider">O2 Sat</p>
                  {isSimplifiedVitals ? (
                    <p className={`text-sm font-bold mt-1 ${getVitalStatus('o2', latestVitals.vitals.oxygenSaturation).color}`}>
                      {getVitalStatus('o2', latestVitals.vitals.oxygenSaturation).text}
                    </p>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-navy-900 mt-1">
                        {latestVitals.vitals.oxygenSaturation}<span className="text-xs font-normal text-navy-500">%</span>
                      </p>
                      <p className={`text-xs font-medium ${getVitalStatus('o2', latestVitals.vitals.oxygenSaturation).color}`}>
                        {getVitalStatus('o2', latestVitals.vitals.oxygenSaturation).text}
                      </p>
                    </>
                  )}
                </div>
              )}

              {latestVitals.vitals.temperature != null && (
                <div className="p-3 bg-white/60 rounded-xl">
                  <p className="text-[10px] font-medium text-navy-400 uppercase tracking-wider">Temp</p>
                  {isSimplifiedVitals ? (
                    <p className={`text-sm font-bold mt-1 ${getVitalStatus('temp', latestVitals.vitals.temperature).color}`}>
                      {getVitalStatus('temp', latestVitals.vitals.temperature).text}
                    </p>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-navy-900 mt-1">
                        {latestVitals.vitals.temperature}<span className="text-xs font-normal text-navy-500">°F</span>
                      </p>
                      <p className={`text-xs font-medium ${getVitalStatus('temp', latestVitals.vitals.temperature).color}`}>
                        {getVitalStatus('temp', latestVitals.vitals.temperature).text}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-navy-400 text-center py-4">No vitals recorded yet</p>
          )}
        </div>

        {/* ----- Current Mood Card ----- */}
        <div className="card-glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-purple-50">
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
            <h3 className="text-sm font-bold text-navy-900">Current Mood</h3>
          </div>

          {latestMood?.moodLog ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl leading-none">
                {moodEmoji[latestMood.moodLog.mood] || '😐'}
              </span>
              <div>
                <p className="text-lg font-bold text-navy-900">
                  {moodLabel[latestMood.moodLog.mood] || latestMood.moodLog.mood}
                </p>
                <p className="text-xs text-navy-500 mt-0.5">
                  {showMoodDetails && latestMood.moodLog.notes
                    ? `Observed: ${latestMood.moodLog.notes}`
                    : `Updated ${formatDistanceToNow(new Date(latestMood.createdAt), { addSuffix: true })}`
                  }
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-navy-400 text-center py-4">No mood recorded yet</p>
          )}
        </div>
      </aside>

      {/* ================================================================= */}
      {/* RIGHT MAIN AREA                                                   */}
      {/* ================================================================= */}
      <main className="flex-1 min-w-0 space-y-5">
        {/* ----- Daily Digest Card ----- */}
        <div className="card-glass p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-50">
                <Sparkles className="h-4 w-4 text-primary-500" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">Daily Digest</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-600 text-[10px] font-semibold rounded-full uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              AI Generated · Today
            </span>
          </div>

          <blockquote className="relative pl-4 border-l-3 border-primary-300" style={{ borderLeftWidth: '3px' }}>
            <p className="text-navy-700 text-sm leading-relaxed italic">
              &ldquo;{digestSummary}&rdquo;
            </p>
          </blockquote>
        </div>

        {/* ----- Care Dashboard Tab Bar + Review Button ----- */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 bg-cream-100 rounded-xl p-1">
            {([
              { id: 'log' as const, label: 'Log', icon: ClipboardList },
              { id: 'plan' as const, label: 'Plan', icon: Calendar },
              { id: 'progress' as const, label: 'Progress', icon: TrendingUp },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setHomeTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  homeTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            <Star className="h-3.5 w-3.5" />
            Leave a Review
          </button>
        </div>

        {/* ============================================================= */}
        {/* LOG TAB — Today's HIPAA-safe care entries                     */}
        {/* ============================================================= */}
        {homeTab === 'log' && (
          <div className="space-y-4">
            {todayHipaaEntries.length === 0 ? (
              <div className="card-glass p-10 text-center">
                <Activity className="h-10 w-10 text-primary-200 mx-auto mb-3" />
                <p className="text-navy-500 font-medium">No care updates recorded yet today.</p>
                <p className="text-sm text-navy-400 mt-1">Updates typically arrive throughout the day.</p>
              </div>
            ) : (
              (['Morning', 'Afternoon', 'Evening'] as const).map(block => {
                const entries = entriesByTimeBlock[block]
                if (!entries || entries.length === 0) return null
                return (
                  <div key={block} className="card-glass p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{timeBlockConfig[block].emoji}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${timeBlockConfig[block].color}`}>
                        {block}
                      </span>
                      <span className="text-xs text-navy-400">{entries.length} update{entries.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-3">
                      {entries.map(entry => (
                        <div key={entry.id} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                          {entry.category === 'mood' && entry.moodLog ? (
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-2xl leading-none">{moodEmoji[entry.moodLog.mood] || '😐'}</span>
                              <div>
                                <p className="font-semibold text-navy-900 text-sm">Well-being Check</p>
                                <p className="text-navy-600 text-xs mt-0.5">{moodLabel[entry.moodLog.mood] || entry.moodLog.mood}</p>
                                {entry.moodLog.appetite && (
                                  <p className="text-navy-400 text-xs">Appetite: {entry.moodLog.appetite}</p>
                                )}
                              </div>
                            </div>
                          ) : entry.activityLog?.activityType === 'meal' ? (
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-green-50 rounded-xl flex-shrink-0">
                                <Utensils className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-navy-900 text-sm">{entry.title}</p>
                                <p className="text-navy-600 text-xs mt-0.5">
                                  Meal — {participationToPercent[entry.activityLog.participation || 'moderate'] ?? 60}% eaten
                                </p>
                              </div>
                            </div>
                          ) : entry.activityLog ? (
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-blue-50 rounded-xl flex-shrink-0">
                                <Activity className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-navy-900 text-sm">{entry.title}</p>
                                <p className="text-navy-600 text-xs mt-0.5 capitalize">
                                  {entry.activityLog.activityType.replace('_', ' ')}
                                  {entry.activityLog.duration ? ` · ${entry.activityLog.duration} min` : ''}
                                  {entry.activityLog.participation ? ` · ${entry.activityLog.participation} participation` : ''}
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* PLAN TAB — Recovery Goals + This Week's Schedule              */}
        {/* ============================================================= */}
        {homeTab === 'plan' && (
          <div className="space-y-5">
            {/* Recovery Goals */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-primary-50">
                  <Target className="h-4 w-4 text-primary-500" />
                </div>
                <h3 className="text-sm font-bold text-navy-900">Recovery Goals</h3>
              </div>
              <div className="space-y-5">
                {demoGoals.map(goal => (
                  <div key={goal.id} className="p-4 bg-white/60 rounded-2xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-navy-900 text-sm">{goal.title}</p>
                        <p className="text-xs text-navy-500 mt-0.5">{goal.category} · Target: {goal.targetDate}</p>
                      </div>
                      <span className={`text-sm font-bold ${
                        goal.progressPercent >= 70 ? 'text-mint-600'
                          : goal.progressPercent >= 40 ? 'text-amber-600'
                          : 'text-red-500'
                      }`}>
                        {goal.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          goal.progressPercent >= 70 ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                            : goal.progressPercent >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-navy-400">{goal.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* This Week's Schedule */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent-50">
                    <Calendar className="h-4 w-4 text-accent-500" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">This Week&apos;s Schedule</h3>
                </div>
                <button
                  onClick={onNavigateToCalendar}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5"
                >
                  Full Calendar <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {thisWeekEvents.length === 0 ? (
                <p className="text-sm text-navy-400 text-center py-6">No events scheduled this week.</p>
              ) : (
                <div className="space-y-3">
                  {thisWeekEvents.map(event => {
                    const config = eventTypeConfig[event.type] || eventTypeConfig.facility_event
                    const eventDate = new Date(event.date)
                    const dateLabel = isToday(eventDate)
                      ? 'Today'
                      : isTomorrow(eventDate)
                        ? 'Tomorrow'
                        : format(eventDate, 'EEEE, MMM d')
                    return (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                        <span className="text-lg">{config.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-navy-900 text-sm truncate">{event.title}</p>
                          <p className="text-xs text-navy-500 mt-0.5">
                            {dateLabel}{event.time ? ` · ${event.time}` : ''}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* PROGRESS TAB — Goal progress + weekly activity summary        */}
        {/* ============================================================= */}
        {homeTab === 'progress' && (
          <div className="space-y-5">
            {/* Recovery Progress */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-mint-50">
                  <TrendingUp className="h-4 w-4 text-mint-600" />
                </div>
                <h3 className="text-sm font-bold text-navy-900">Recovery Progress</h3>
              </div>
              <div className="space-y-6">
                {demoGoals.map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="font-semibold text-navy-900 text-sm">{goal.title}</p>
                      <span className={`text-sm font-bold ${
                        goal.progressPercent >= 70 ? 'text-mint-600'
                          : goal.progressPercent >= 40 ? 'text-amber-600'
                          : 'text-red-500'
                      }`}>
                        {goal.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-2.5 mb-2">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          goal.progressPercent >= 70 ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                            : goal.progressPercent >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {goal.milestones.map((milestone, i) => {
                        const completed = (i / goal.milestones.length) * 100 < goal.progressPercent
                        return (
                          <span
                            key={i}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                              completed ? 'bg-mint-50 text-mint-700' : 'bg-cream-100 text-navy-400'
                            }`}
                          >
                            <CheckSquare className={`h-3 w-3 flex-shrink-0 ${completed ? 'text-mint-600' : 'text-navy-300'}`} />
                            {milestone}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Activity Summary */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-primary-50">
                  <Activity className="h-4 w-4 text-primary-500" />
                </div>
                <h3 className="text-sm font-bold text-navy-900">Weekly Activity Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-2xl text-center">
                  <p className="text-3xl font-bold text-blue-700">{weeklyStats.therapySessions}</p>
                  <p className="text-xs font-medium text-blue-600 mt-1">Therapy Sessions</p>
                  <p className="text-xs text-navy-500">this week</p>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl text-center">
                  <p className="text-3xl font-bold text-green-700">
                    {weeklyStats.avgMealParticipation > 0 ? `${weeklyStats.avgMealParticipation}%` : '—'}
                  </p>
                  <p className="text-xs font-medium text-green-600 mt-1">Meal Participation</p>
                  <p className="text-xs text-navy-500">avg this week</p>
                </div>
              </div>
              <div className="p-4 bg-primary-50 rounded-2xl">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-primary-700 leading-relaxed">
                    {weeklyStats.therapySessions >= 3
                      ? `Therapy participation is on track with ${weeklyStats.therapySessions} sessions this week.`
                      : weeklyStats.therapySessions >= 1
                        ? `Completed ${weeklyStats.therapySessions} therapy session${weeklyStats.therapySessions > 1 ? 's' : ''} this week.`
                        : 'Therapy sessions are scheduled for this week.'
                    }
                    {weeklyStats.avgMealParticipation >= 70
                      ? ' Nutritional intake looks good.'
                      : weeklyStats.avgMealParticipation > 0
                        ? ' Meal participation is being monitored.'
                        : ''
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <FacilityReview
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
          onAddReview={onAddReview}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  )
}
