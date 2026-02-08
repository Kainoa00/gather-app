'use client'

import { useMemo, useState } from 'react'
import {
  Heart,
  Brain,
  Sparkles,
  Wifi,
  MessageCircle,
  Send,
  Clock,
} from 'lucide-react'
import { PatientInfo, LogEntry, CalendarEvent, Visit, FeedPost, CareCircleMember, UserRole } from '@/types'
import { formatDistanceToNow, differenceInDays, format, isToday } from 'date-fns'
import HomeFeed from './HomeFeed'
import { canViewExactVitals, canViewMoodDetails } from '@/lib/permissions'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HomeViewProps {
  patient: PatientInfo
  logEntries: LogEntry[]
  events: CalendarEvent[]
  visits: Visit[]
  posts: FeedPost[]
  members: CareCircleMember[]
  currentUserId: string
  currentUserName: string
  currentUserRole: UserRole
  onClaimVisit: (eventId: string) => void
  onAddPost: (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => void
  onLikePost: (postId: string) => void
  onAddComment: (postId: string, content: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const moodEmoji: Record<string, string> = {
  happy: '\u{1F60A}',
  content: '\u{1F642}',
  neutral: '\u{1F610}',
  anxious: '\u{1F61F}',
  sad: '\u{1F622}',
  agitated: '\u{1F624}',
}

const moodLabel: Record<string, string> = {
  happy: 'Happy & Engaged',
  content: 'Content & Calm',
  neutral: 'Neutral',
  anxious: 'Anxious',
  sad: 'Sad',
  agitated: 'Agitated',
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

// ---------------------------------------------------------------------------
// Generate daily digest summary
// ---------------------------------------------------------------------------

function generateDigestSummary(
  patient: PatientInfo,
  logEntries: LogEntry[],
  visits: Visit[],
  showVitalsNumbers: boolean = true,
): string {
  const todayEntries = logEntries.filter((e) => isToday(new Date(e.createdAt)))
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
  posts,
  members,
  currentUserId,
  currentUserName,
  currentUserRole,
  onClaimVisit,
  onAddPost,
  onLikePost,
  onAddComment,
}: HomeViewProps) {
  const [feedFilter, setFeedFilter] = useState<'all' | 'activities' | 'medical'>('all')

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

  const filteredPosts = useMemo(() => {
    if (feedFilter === 'all') return posts
    if (feedFilter === 'activities') {
      return posts.filter((p) =>
        ['activity_photo', 'facility_moment', 'visit_recap'].includes(p.postType),
      )
    }
    if (feedFilter === 'medical') {
      return posts.filter((p) =>
        ['general', 'milestone'].includes(p.postType),
      )
    }
    return posts
  }, [posts, feedFilter])

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
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            {patient.photoUrl ? (
              <img
                src={patient.photoUrl}
                alt={patient.name}
                className="h-24 w-24 rounded-full object-cover shadow-soft border-4 border-white"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-lavender-400 to-peach-400 flex items-center justify-center shadow-soft border-4 border-white mx-auto">
                <span className="text-white font-bold text-2xl">{getInitials(patient.name)}</span>
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-mint-500 rounded-full border-3 border-white shadow-sm" style={{ borderWidth: '3px' }}></div>
          </div>

          <h2 className="text-xl font-bold text-navy-900">{patient.name}</h2>
          <p className="text-sm text-navy-500 mt-1">
            Room {patient.roomNumber} · Skilled Nursing
          </p>

          {/* Stay Duration Badge */}
          <div className="mt-4 inline-flex flex-col items-center">
            <div className="px-5 py-2.5 bg-gradient-to-r from-lavender-100 to-peach-100 rounded-2xl border border-lavender-200/50">
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
              {/* Blood Pressure */}
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

              {/* Heart Rate */}
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

              {/* O2 Saturation */}
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

              {/* Temperature */}
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
                {moodEmoji[latestMood.moodLog.mood] || '\u{1F610}'}
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
              <div className="p-2 rounded-xl bg-lavender-50">
                <Sparkles className="h-4 w-4 text-lavender-500" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">Daily Digest</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender-100 text-lavender-600 text-[10px] font-semibold rounded-full uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              AI Generated · Today
            </span>
          </div>

          <blockquote className="relative pl-4 border-l-3 border-lavender-300" style={{ borderLeftWidth: '3px' }}>
            <p className="text-navy-700 text-sm leading-relaxed italic">
              &ldquo;{digestSummary}&rdquo;
            </p>
          </blockquote>
        </div>

        {/* ----- Resident Feed ----- */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-peach-50">
                <Wifi className="h-4 w-4 text-peach-500" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">Resident Feed</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-cream-100 rounded-xl p-1">
              {([
                { id: 'all' as const, label: 'All' },
                { id: 'activities' as const, label: 'Activities' },
                { id: 'medical' as const, label: 'Medical' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFeedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    feedFilter === tab.id
                      ? 'bg-white text-lavender-700 shadow-sm'
                      : 'text-navy-500 hover:text-navy-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reuse HomeFeed with filtered posts */}
          <HomeFeed
            posts={filteredPosts}
            members={members}
            currentUserId={currentUserId}
            onAddPost={onAddPost}
            onLikePost={onLikePost}
            onAddComment={onAddComment}
          />
        </div>
      </main>
    </div>
  )
}
