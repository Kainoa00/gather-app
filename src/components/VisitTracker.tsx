'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MapPin,
  Clock,
  MessageCircle,
  X,
  LogOut,
  Smile,
  Frown,
  Meh,
  Users,
} from 'lucide-react'
import { Visit } from '@/types'
import { formatDistanceToNow, format, startOfWeek, subWeeks, isWithinInterval, endOfWeek, differenceInMinutes } from 'date-fns'

interface VisitTrackerProps {
  visits: Visit[]
  currentUserId: string
  currentUserName: string
  onCheckIn: () => void
  onCheckOut: (mood: string, note: string) => void
}

type MoodOption = 'great' | 'good' | 'ok' | 'tough' | 'hard'

interface MoodConfig {
  emoji: string
  label: string
}

const moodOptions: Record<MoodOption, MoodConfig> = {
  great: { emoji: '\u{1F60A}', label: 'Great' },
  good: { emoji: '\u{1F642}', label: 'Good' },
  ok: { emoji: '\u{1F610}', label: 'OK' },
  tough: { emoji: '\u{1F61F}', label: 'Tough' },
  hard: { emoji: '\u{1F622}', label: 'Hard' },
}

const avatarGradients = [
  'from-lavender-400 to-lavender-600',
  'from-peach-400 to-peach-600',
  'from-mint-400 to-mint-600',
  'from-lavender-500 to-peach-400',
  'from-mint-400 to-lavender-500',
  'from-peach-400 to-lavender-400',
]

function getAvatarGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export default function VisitTracker({
  visits,
  currentUserId,
  currentUserName,
  onCheckIn,
  onCheckOut,
}: VisitTrackerProps) {
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null)
  const [checkOutNote, setCheckOutNote] = useState('')
  const [now, setNow] = useState(() => new Date())

  // Update elapsed time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Find the current user's active visit (no checkOutTime)
  const activeVisit = useMemo(() => {
    return visits.find(
      (visit) => visit.visitorId === currentUserId && !visit.checkOutTime
    ) ?? null
  }, [visits, currentUserId])

  // Compute elapsed minutes for the active visit
  const elapsedMinutes = useMemo(() => {
    if (!activeVisit) return 0
    return differenceInMinutes(now, new Date(activeVisit.checkInTime))
  }, [activeVisit, now])

  // Weekly summary calculations
  const weeklySummary = useMemo(() => {
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 0 })
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 0 })

    const thisWeekVisits = visits.filter((visit) => {
      const checkIn = new Date(visit.checkInTime)
      return isWithinInterval(checkIn, { start: thisWeekStart, end: thisWeekEnd })
    })

    const totalMinutes = thisWeekVisits.reduce((acc, visit) => {
      if (visit.duration) return acc + visit.duration
      if (!visit.checkOutTime) {
        return acc + differenceInMinutes(now, new Date(visit.checkInTime))
      }
      return acc + differenceInMinutes(new Date(visit.checkOutTime), new Date(visit.checkInTime))
    }, 0)

    return {
      count: thisWeekVisits.length,
      totalMinutes,
    }
  }, [visits, now])

  // Group visits into "This Week" and "Last Week"
  const groupedVisits = useMemo(() => {
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 0 })
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 0 })
    const lastWeekStart = subWeeks(thisWeekStart, 1)
    const lastWeekEnd = subWeeks(thisWeekEnd, 1)

    const sortedVisits = [...visits].sort(
      (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    )

    const thisWeek: Visit[] = []
    const lastWeek: Visit[] = []

    for (const visit of sortedVisits) {
      const checkIn = new Date(visit.checkInTime)
      if (isWithinInterval(checkIn, { start: thisWeekStart, end: thisWeekEnd })) {
        thisWeek.push(visit)
      } else if (isWithinInterval(checkIn, { start: lastWeekStart, end: lastWeekEnd })) {
        lastWeek.push(visit)
      }
    }

    return { thisWeek, lastWeek }
  }, [visits, now])

  const handleCheckOut = useCallback(() => {
    if (!selectedMood) return
    onCheckOut(selectedMood, checkOutNote)
    setShowCheckOutModal(false)
    setSelectedMood(null)
    setCheckOutNote('')
  }, [selectedMood, checkOutNote, onCheckOut])

  const handleOpenCheckOut = useCallback(() => {
    setShowCheckOutModal(true)
  }, [])

  const handleCloseCheckOut = useCallback(() => {
    setShowCheckOutModal(false)
    setSelectedMood(null)
    setCheckOutNote('')
  }, [])

  // Render a single visit card
  const renderVisitCard = (visit: Visit) => {
    const checkInDate = new Date(visit.checkInTime)
    const isActive = !visit.checkOutTime
    const visitDuration = visit.duration
      ? visit.duration
      : visit.checkOutTime
        ? differenceInMinutes(new Date(visit.checkOutTime), checkInDate)
        : differenceInMinutes(now, checkInDate)

    const timeRange = visit.checkOutTime
      ? `${format(checkInDate, 'h:mm a')} - ${format(new Date(visit.checkOutTime), 'h:mm a')}`
      : `${format(checkInDate, 'h:mm a')} - now`

    return (
      <div
        key={visit.id}
        className="card-glass p-4 hover:shadow-float transition-all duration-300"
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${getAvatarGradient(visit.visitorName)} flex items-center justify-center flex-shrink-0 shadow-soft`}
          >
            <span className="text-white font-semibold text-sm">
              {getInitials(visit.visitorName)}
            </span>
          </div>

          {/* Visit Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-navy-900 text-sm">
                {visit.visitorName}
              </span>
              {visit.visitorRelationship && (
                <span className="text-xs text-navy-500">
                  {visit.visitorRelationship}
                </span>
              )}
              {isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-mint-100 text-mint-700 text-xs font-medium rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
                  Currently here
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-navy-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(checkInDate, 'EEE, MMM d')}
              </span>
              <span>{timeRange}</span>
              <span className="font-medium text-navy-600">
                {formatDuration(visitDuration)}
              </span>
            </div>

            {/* Mood indicator */}
            {visit.mood && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-sm">{moodOptions[visit.mood]?.emoji}</span>
                <span className="text-xs text-navy-500 capitalize">{visit.mood}</span>
              </div>
            )}

            {/* Note */}
            {visit.note && (
              <div className="flex items-start gap-1.5 mt-2 bg-cream-50 rounded-xl px-3 py-2">
                <MessageCircle className="h-3.5 w-3.5 text-navy-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-navy-600 leading-relaxed">{visit.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Visit Tracker</h2>
        <p className="text-navy-600 mt-1">
          Check in when you arrive and check out when you leave
        </p>
      </div>

      {/* Currently Visiting Banner */}
      {activeVisit && (
        <div className="bg-mint-50 border border-mint-200 rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-mint-500" />
                <div className="absolute inset-0 h-3 w-3 rounded-full bg-mint-500 animate-pulse-soft" />
              </div>
              <div>
                <p className="font-semibold text-navy-900">
                  You&apos;re currently visiting
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-sm text-navy-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Checked in {formatDistanceToNow(new Date(activeVisit.checkInTime), { addSuffix: true })}
                  </span>
                  <span className="font-medium text-mint-700">
                    {formatDuration(elapsedMinutes)} elapsed
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleOpenCheckOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-navy-700 font-medium rounded-xl border border-mint-200 hover:bg-mint-50 hover:border-mint-300 transition-all duration-200 shadow-soft flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Check Out
            </button>
          </div>
        </div>
      )}

      {/* Check-In Button (only when NOT currently visiting) */}
      {!activeVisit && (
        <button
          onClick={onCheckIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white font-semibold rounded-2xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-float hover:-translate-y-0.5 animate-slide-up"
        >
          <MapPin className="h-5 w-5" />
          I&apos;m Here
        </button>
      )}

      {/* Recent Visits List */}
      <div className="space-y-6">
        {/* Section Header with Weekly Summary */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-lavender-500" />
            Recent Visits
          </h3>
          <span className="text-sm text-navy-500">
            {weeklySummary.count} {weeklySummary.count === 1 ? 'visit' : 'visits'} &middot;{' '}
            {formatDuration(weeklySummary.totalMinutes)} total
          </span>
        </div>

        {/* This Week */}
        {groupedVisits.thisWeek.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-lavender-400 to-peach-400" />
              <h4 className="text-sm font-semibold text-navy-700">This Week</h4>
              <span className="text-xs text-navy-400">
                ({groupedVisits.thisWeek.length})
              </span>
            </div>
            <div className="space-y-3">
              {groupedVisits.thisWeek.map((visit) => renderVisitCard(visit))}
            </div>
          </div>
        )}

        {/* Last Week */}
        {groupedVisits.lastWeek.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-navy-300 to-navy-400" />
              <h4 className="text-sm font-semibold text-navy-700">Last Week</h4>
              <span className="text-xs text-navy-400">
                ({groupedVisits.lastWeek.length})
              </span>
            </div>
            <div className="space-y-3">
              {groupedVisits.lastWeek.map((visit) => renderVisitCard(visit))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {groupedVisits.thisWeek.length === 0 && groupedVisits.lastWeek.length === 0 && (
          <div className="text-center py-12 card-glass">
            <Users className="h-12 w-12 text-lavender-300 mx-auto mb-3" />
            <p className="text-navy-500 font-medium">No recent visits</p>
            <p className="text-navy-400 text-sm mt-1">
              Check in when you arrive to start tracking visits
            </p>
          </div>
        )}
      </div>

      {/* Check-Out Modal */}
      {showCheckOutModal && activeVisit && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-glass-lg animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-lavender-100/50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-navy-900">Check Out</h3>
              <button
                onClick={handleCloseCheckOut}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6">
              {/* Visit Duration */}
              <div className="text-center bg-cream-50 rounded-2xl p-4">
                <p className="text-sm text-navy-500 mb-1">Visit Duration</p>
                <p className="text-3xl font-bold text-navy-900">
                  {formatDuration(elapsedMinutes)}
                </p>
                <p className="text-xs text-navy-400 mt-1">
                  Since {format(new Date(activeVisit.checkInTime), 'h:mm a')}
                </p>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">
                  How was the visit?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.entries(moodOptions) as [MoodOption, MoodConfig][]).map(
                    ([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedMood(key)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 border-2 ${
                          selectedMood === key
                            ? 'border-lavender-400 bg-lavender-50 shadow-soft'
                            : 'border-cream-200 hover:bg-cream-50 hover:border-cream-300'
                        }`}
                      >
                        <span className="text-2xl">{config.emoji}</span>
                        <span className="text-xs font-medium text-navy-600">
                          {config.label}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">
                  Add a note{' '}
                  <span className="text-navy-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={checkOutNote}
                  onChange={(e) => setCheckOutNote(e.target.value)}
                  placeholder="How was Mom doing today? Anything to share with the care circle..."
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent resize-none transition-all"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-lavender-100/50 flex gap-3">
              <button
                onClick={handleCloseCheckOut}
                className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 font-medium rounded-xl hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!selectedMood}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white font-medium rounded-xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed disabled:from-cream-200 disabled:to-cream-200 disabled:text-navy-400 disabled:shadow-none"
              >
                <LogOut className="h-4 w-4" />
                Check Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
