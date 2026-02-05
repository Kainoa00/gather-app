'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Heart,
  Pill,
  Activity,
  Smile,
  AlertTriangle,
  Users,
  Calendar,
} from 'lucide-react'
import { LogEntry, LogEntryCategory, Visit } from '@/types'
import { format, isSameDay, subDays, addDays } from 'date-fns'

interface DailyDigestProps {
  logEntries: LogEntry[]
  visits: Visit[]
  selectedDate?: Date
}

const moodScores: Record<string, number> = {
  happy: 9,
  content: 7,
  neutral: 5,
  anxious: 3,
  sad: 2,
  agitated: 1,
}

const moodEmojis: Record<string, string> = {
  happy: '\u{1F60A}',
  content: '\u{1F642}',
  neutral: '\u{1F610}',
  anxious: '\u{1F61F}',
  sad: '\u{1F622}',
  agitated: '\u{1F624}',
}

const categoryEmojis: Record<LogEntryCategory, string> = {
  vitals: '\u2764\uFE0F',
  medication: '\u{1F48A}',
  activity: '\u{1F3C3}',
  mood: '\u{1F60A}',
  incident: '\u26A0\uFE0F',
}

function getActivityEmoji(activityType?: string): string {
  if (activityType === 'meal') return '\u{1F37D}\uFE0F'
  if (activityType === 'social') return '\u{1F3A8}'
  return '\u{1F3C3}'
}

function isVitalsNormal(entry: LogEntry): boolean {
  if (!entry.vitals) return true
  const v = entry.vitals
  const bpOk =
    !v.bloodPressureSystolic ||
    !v.bloodPressureDiastolic ||
    (v.bloodPressureSystolic <= 140 &&
      v.bloodPressureSystolic >= 90 &&
      v.bloodPressureDiastolic <= 90 &&
      v.bloodPressureDiastolic >= 60)
  const hrOk = !v.heartRate || (v.heartRate >= 60 && v.heartRate <= 100)
  const o2Ok = !v.oxygenSaturation || v.oxygenSaturation >= 95
  const tempOk = !v.temperature || (v.temperature >= 97.0 && v.temperature <= 99.5)
  return bpOk && hrOk && o2Ok && tempOk
}

function getEntryHour(entry: LogEntry): number {
  return new Date(entry.createdAt).getHours()
}

function getVisitHour(visit: Visit): number {
  return new Date(visit.checkInTime).getHours()
}

interface TimeSection {
  label: string
  range: string
  startHour: number
  endHour: number
}

const timeSections: TimeSection[] = [
  { label: 'Morning', range: '6 AM - 12 PM', startHour: 6, endHour: 12 },
  { label: 'Afternoon', range: '12 PM - 6 PM', startHour: 12, endHour: 18 },
  { label: 'Evening', range: '6 PM - 10 PM', startHour: 18, endHour: 22 },
]

export default function DailyDigest({
  logEntries,
  visits,
  selectedDate: initialDate,
}: DailyDigestProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate ?? new Date())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Morning', 'Afternoon', 'Evening'])
  )

  const goToPreviousDay = () => setCurrentDate((prev) => subDays(prev, 1))
  const goToNextDay = () => setCurrentDate((prev) => addDays(prev, 1))

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  // Filter entries and visits for the selected date
  const dayEntries = useMemo(
    () =>
      logEntries
        .filter((e) => isSameDay(new Date(e.createdAt), currentDate))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [logEntries, currentDate]
  )

  const dayVisits = useMemo(
    () =>
      visits
        .filter((v) => isSameDay(new Date(v.checkInTime), currentDate))
        .sort(
          (a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
        ),
    [visits, currentDate]
  )

  // Compute overall day rating
  const { rating, ratingLabel, ratingEmoji, summary } = useMemo(() => {
    if (dayEntries.length === 0 && dayVisits.length === 0) {
      return { rating: 0, ratingLabel: '', ratingEmoji: '', summary: '' }
    }

    let score = 5 // baseline

    // Mood contribution
    const moodEntries = dayEntries.filter((e) => e.category === 'mood' && e.moodLog)
    if (moodEntries.length > 0) {
      const avgMood =
        moodEntries.reduce((sum, e) => sum + (moodScores[e.moodLog!.mood] ?? 5), 0) /
        moodEntries.length
      score = avgMood
    }

    // Vitals contribution
    const vitalsEntries = dayEntries.filter((e) => e.category === 'vitals')
    if (vitalsEntries.length > 0) {
      const allNormal = vitalsEntries.every(isVitalsNormal)
      if (allNormal) {
        score = Math.min(10, score + 0.5)
      } else {
        score = Math.max(1, score - 1)
      }
    }

    // Activity contribution
    const activityEntries = dayEntries.filter((e) => e.category === 'activity')
    if (activityEntries.length >= 3) {
      score = Math.min(10, score + 1)
    } else if (activityEntries.length >= 1) {
      score = Math.min(10, score + 0.5)
    }

    // Incident penalty
    const incidentEntries = dayEntries.filter((e) => e.category === 'incident')
    if (incidentEntries.length > 0) {
      const hasHigh = incidentEntries.some((e) => e.incidentLog?.severity === 'high')
      score = Math.max(1, score - (hasHigh ? 2 : 1))
    }

    // Visit bonus
    if (dayVisits.length > 0) {
      score = Math.min(10, score + 0.5)
    }

    const finalRating = Math.round(Math.min(10, Math.max(1, score)))

    let label: string
    let emoji: string
    if (finalRating >= 8) {
      label = 'Great'
      emoji = '\u{1F60A}'
    } else if (finalRating >= 6) {
      label = 'Good'
      emoji = '\u{1F642}'
    } else if (finalRating >= 4) {
      label = 'Fair'
      emoji = '\u{1F610}'
    } else {
      label = 'Needs Attention'
      emoji = '\u{1F61F}'
    }

    // Generate auto-summary
    const summaryParts: string[] = []
    const dominantMood =
      moodEntries.length > 0 ? moodEntries[moodEntries.length - 1].moodLog!.mood : null
    if (dominantMood) {
      summaryParts.push(
        `Mood was ${dominantMood}`
      )
    }
    if (vitalsEntries.length > 0) {
      summaryParts.push(
        vitalsEntries.every(isVitalsNormal) ? 'vitals stable' : 'some vitals elevated'
      )
    }
    if (activityEntries.length > 0) {
      summaryParts.push(
        `${activityEntries.length} ${activityEntries.length === 1 ? 'activity' : 'activities'} logged`
      )
    }
    const medEntries = dayEntries.filter((e) => e.category === 'medication')
    if (medEntries.length > 0) {
      summaryParts.push(`${medEntries.length} meds administered`)
    }
    if (dayVisits.length > 0) {
      summaryParts.push(
        `${dayVisits.length} ${dayVisits.length === 1 ? 'visit' : 'visits'}`
      )
    }
    if (incidentEntries.length > 0) {
      summaryParts.push(
        `${incidentEntries.length} ${incidentEntries.length === 1 ? 'incident' : 'incidents'} reported`
      )
    }

    const generatedSummary =
      summaryParts.length > 0
        ? summaryParts.join(', ') + '.'
        : 'No significant updates recorded.'

    return {
      rating: finalRating,
      ratingLabel: label,
      ratingEmoji: emoji,
      summary: generatedSummary.charAt(0).toUpperCase() + generatedSummary.slice(1),
    }
  }, [dayEntries, dayVisits])

  // Compute stats
  const stats = useMemo(() => {
    const vitalsEntries = dayEntries.filter((e) => e.category === 'vitals')
    const medEntries = dayEntries.filter((e) => e.category === 'medication')
    const mealEntries = dayEntries.filter(
      (e) => e.category === 'activity' && e.activityLog?.activityType === 'meal'
    )
    const allVitalsNormal = vitalsEntries.length === 0 || vitalsEntries.every(isVitalsNormal)

    // Determine meal quality from the most recent mood entry's appetite
    const moodEntries = dayEntries.filter((e) => e.category === 'mood' && e.moodLog)
    const latestAppetite =
      moodEntries.length > 0
        ? moodEntries[moodEntries.length - 1].moodLog!.appetite
        : null

    let mealsQuality: 'good' | 'fair' | 'poor' = 'good'
    if (latestAppetite === 'poor' || latestAppetite === 'refused') {
      mealsQuality = 'poor'
    } else if (latestAppetite === 'fair') {
      mealsQuality = 'fair'
    }

    const visitorNames = Array.from(new Set(dayVisits.map((v) => v.visitorName)))

    return {
      vitalsCount: vitalsEntries.length,
      vitalsNormal: allVitalsNormal,
      medsCount: medEntries.length,
      medsOnTime: medEntries.length > 0,
      mealsCount: mealEntries.length,
      mealsQuality,
      visitsCount: dayVisits.length,
      visitNames: visitorNames,
    }
  }, [dayEntries, dayVisits])

  const hasData = dayEntries.length > 0 || dayVisits.length > 0

  // Render a single timeline entry
  const renderTimelineEntry = (entry: LogEntry) => {
    const time = format(new Date(entry.createdAt), 'h:mm a')
    const emoji =
      entry.category === 'activity'
        ? getActivityEmoji(entry.activityLog?.activityType)
        : categoryEmojis[entry.category]

    let detail: React.ReactNode = null

    switch (entry.category) {
      case 'vitals':
        if (entry.vitals) {
          const parts: string[] = []
          if (entry.vitals.bloodPressureSystolic && entry.vitals.bloodPressureDiastolic) {
            parts.push(
              `BP ${entry.vitals.bloodPressureSystolic}/${entry.vitals.bloodPressureDiastolic}`
            )
          }
          if (entry.vitals.heartRate) {
            parts.push(`HR ${entry.vitals.heartRate}`)
          }
          if (entry.vitals.oxygenSaturation) {
            parts.push(`O2 ${entry.vitals.oxygenSaturation}%`)
          }
          detail = (
            <span className="text-sm text-navy-500">{parts.join(' \u00B7 ')}</span>
          )
        }
        break

      case 'medication':
        if (entry.medicationLog) {
          detail = (
            <span className="text-sm text-navy-500">
              {entry.medicationLog.medicationName} {entry.medicationLog.dosage}
            </span>
          )
        }
        break

      case 'activity':
        if (entry.activityLog) {
          detail = (
            <span className="text-sm text-navy-500">
              {entry.activityLog.description}
              {entry.activityLog.duration ? ` \u00B7 ${entry.activityLog.duration} min` : ''}
            </span>
          )
        }
        break

      case 'mood':
        if (entry.moodLog) {
          const mEmoji = moodEmojis[entry.moodLog.mood] || ''
          detail = (
            <span className="text-sm text-navy-500">
              {mEmoji} {entry.moodLog.mood} \u00B7 {entry.moodLog.alertness} \u00B7 appetite{' '}
              {entry.moodLog.appetite}
            </span>
          )
        }
        break

      case 'incident':
        if (entry.incidentLog) {
          const severityClasses =
            entry.incidentLog.severity === 'high'
              ? 'bg-red-100 text-red-700'
              : entry.incidentLog.severity === 'moderate'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
          detail = (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${severityClasses}`}
              >
                {entry.incidentLog.severity}
              </span>
              <span className="text-sm text-navy-500 truncate max-w-[200px]">
                {entry.incidentLog.description}
              </span>
            </div>
          )
        }
        break
    }

    return (
      <div
        key={entry.id}
        className="flex items-start gap-3 py-3 px-4 rounded-xl hover:bg-cream-50/50 transition-colors"
      >
        <div className="text-sm font-medium text-navy-400 w-16 flex-shrink-0 pt-0.5">
          {time}
        </div>
        <div className="text-lg flex-shrink-0 leading-none pt-0.5">{emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-navy-800 text-sm">{entry.title}</p>
          {detail}
        </div>
      </div>
    )
  }

  // Render a visit timeline item
  const renderTimelineVisit = (visit: Visit) => {
    const time = format(new Date(visit.checkInTime), 'h:mm a')
    const durationText = visit.duration
      ? `${visit.duration} min`
      : visit.checkOutTime
        ? `${Math.round((new Date(visit.checkOutTime).getTime() - new Date(visit.checkInTime).getTime()) / 60000)} min`
        : 'ongoing'

    return (
      <div
        key={`visit-${visit.id}`}
        className="flex items-start gap-3 py-3 px-4 rounded-xl hover:bg-cream-50/50 transition-colors"
      >
        <div className="text-sm font-medium text-navy-400 w-16 flex-shrink-0 pt-0.5">
          {time}
        </div>
        <div className="text-lg flex-shrink-0 leading-none pt-0.5">{'\u{1F465}'}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-navy-800 text-sm">
            Visit from {visit.visitorName}
          </p>
          <span className="text-sm text-navy-500">
            {durationText}
            {visit.note ? ` \u00B7 ${visit.note}` : ''}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-lavender-100">
            <ClipboardList className="h-6 w-6 text-lavender-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Daily Digest</h2>
            <p className="text-navy-500 text-sm">
              {format(currentDate, 'EEEE, MMM d')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousDay}
            className="p-2.5 hover:bg-cream-100 rounded-xl transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5 text-navy-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextDay}
            className="p-2.5 hover:bg-cream-100 rounded-xl transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5 text-navy-600" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="card-glass text-center py-16 px-6">
          <Calendar className="h-14 w-14 text-lavender-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-700 mb-2">No entries for this day</h3>
          <p className="text-navy-500 text-sm max-w-sm mx-auto">
            There are no care log entries or visits recorded for{' '}
            {format(currentDate, 'EEEE, MMMM d')}. Try selecting a different date.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Overall Day Rating */}
          <div className="card-glass p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ratingEmoji}</span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-navy-900">{rating}</span>
                    <span className="text-navy-500 text-sm font-medium">/10</span>
                  </div>
                  <p className="text-sm font-semibold text-navy-700">{ratingLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-navy-500">
                <span className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                </span>
                {dayVisits.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {dayVisits.length} {dayVisits.length === 1 ? 'visit' : 'visits'}
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-cream-200 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lavender-400 to-mint-400 transition-all duration-700 ease-out"
                style={{ width: `${rating * 10}%` }}
              />
            </div>

            {/* Auto-generated summary */}
            <p className="text-sm text-navy-600 leading-relaxed">{summary}</p>
          </div>

          {/* Time-of-Day Sections */}
          <div className="space-y-4">
            {timeSections.map((section) => {
              const sectionEntries = dayEntries.filter((e) => {
                const hour = getEntryHour(e)
                return hour >= section.startHour && hour < section.endHour
              })
              const sectionVisits = dayVisits.filter((v) => {
                const hour = getVisitHour(v)
                return hour >= section.startHour && hour < section.endHour
              })

              const totalItems = sectionEntries.length + sectionVisits.length
              const isExpanded = expandedSections.has(section.label)

              if (totalItems === 0) return null

              return (
                <div key={section.label} className="card-glass overflow-hidden">
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="w-full flex items-center justify-between p-5 hover:bg-cream-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-lavender-400 to-peach-400" />
                      <h3 className="text-lg font-semibold text-navy-800">
                        {section.label}
                      </h3>
                      <span className="text-sm text-navy-400">{section.range}</span>
                      <span className="px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-700 text-xs font-medium">
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-navy-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-navy-400" />
                    )}
                  </button>

                  {/* Section content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-lavender-100/50">
                      <div className="divide-y divide-cream-100">
                        {sectionEntries.map(renderTimelineEntry)}
                        {sectionVisits.map(renderTimelineVisit)}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Entries outside normal time sections (overnight, early morning) */}
            {(() => {
              const outsideEntries = dayEntries.filter((e) => {
                const hour = getEntryHour(e)
                return hour < 6 || hour >= 22
              })
              const outsideVisits = dayVisits.filter((v) => {
                const hour = getVisitHour(v)
                return hour < 6 || hour >= 22
              })
              const totalOutside = outsideEntries.length + outsideVisits.length

              if (totalOutside === 0) return null

              const isExpanded = expandedSections.has('Other')

              return (
                <div className="card-glass overflow-hidden">
                  <button
                    onClick={() => toggleSection('Other')}
                    className="w-full flex items-center justify-between p-5 hover:bg-cream-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-navy-300 to-navy-400" />
                      <h3 className="text-lg font-semibold text-navy-800">
                        Overnight / Early Morning
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-700 text-xs font-medium">
                        {totalOutside} {totalOutside === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-navy-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-navy-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-lavender-100/50">
                      <div className="divide-y divide-cream-100">
                        {outsideEntries.map(renderTimelineEntry)}
                        {outsideVisits.map(renderTimelineVisit)}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Day Summary Stats */}
          <div>
            <h3 className="text-lg font-semibold text-navy-800 mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-mint-400 to-lavender-400" />
              Day Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Vitals Card */}
              <div className="card-glass p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-red-50">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-lg">
                    {stats.vitalsCount > 0
                      ? stats.vitalsNormal
                        ? '\u2705'
                        : '\u26A0\uFE0F'
                      : '\u{1F7E1}'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-navy-900">{stats.vitalsCount}</p>
                <p className="text-sm text-navy-500">Vitals Checks</p>
                <p className="text-xs font-medium mt-1 text-navy-600">
                  {stats.vitalsCount > 0
                    ? stats.vitalsNormal
                      ? 'All normal'
                      : 'Some elevated'
                    : 'None recorded'}
                </p>
              </div>

              {/* Meds Card */}
              <div className="card-glass p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-blue-50">
                    <Pill className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-lg">
                    {stats.medsCount > 0
                      ? stats.medsOnTime
                        ? '\u2705'
                        : '\u26A0\uFE0F'
                      : '\u{1F7E1}'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-navy-900">{stats.medsCount}</p>
                <p className="text-sm text-navy-500">Medications</p>
                <p className="text-xs font-medium mt-1 text-navy-600">
                  {stats.medsCount > 0
                    ? stats.medsOnTime
                      ? 'Administered'
                      : 'Check schedule'
                    : 'None recorded'}
                </p>
              </div>

              {/* Meals Card */}
              <div className="card-glass p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-peach-50">
                    <Smile className="h-5 w-5 text-peach-500" />
                  </div>
                  <span className="text-lg">
                    {stats.mealsCount >= 3
                      ? '\u2705'
                      : stats.mealsCount >= 1
                        ? '\u{1F7E1}'
                        : '\u26A0\uFE0F'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-navy-900">
                  {stats.mealsCount}
                  <span className="text-sm font-normal text-navy-400">/3</span>
                </p>
                <p className="text-sm text-navy-500">Meals</p>
                <p className="text-xs font-medium mt-1 text-navy-600 capitalize">
                  {stats.mealsCount > 0
                    ? `Quality: ${stats.mealsQuality}`
                    : 'None recorded'}
                </p>
              </div>

              {/* Visits Card */}
              <div className="card-glass p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-mint-50">
                    <Users className="h-5 w-5 text-mint-600" />
                  </div>
                  <span className="text-lg">
                    {stats.visitsCount > 0 ? '\u2705' : '\u{1F7E1}'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-navy-900">{stats.visitsCount}</p>
                <p className="text-sm text-navy-500">Visits</p>
                <p className="text-xs font-medium mt-1 text-navy-600 truncate">
                  {stats.visitNames.length > 0
                    ? stats.visitNames.join(', ')
                    : 'No visitors today'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
