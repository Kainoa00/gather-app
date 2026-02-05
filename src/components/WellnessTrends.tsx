'use client'

import { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Smile,
  Utensils,
  Activity,
  Users,
  Calendar,
} from 'lucide-react'
import { WellnessDay } from '@/types'
import { format } from 'date-fns'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WellnessTrendsProps {
  days: WellnessDay[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type MoodKey = 'happy' | 'content' | 'neutral' | 'anxious' | 'sad' | 'agitated'
type AppetiteKey = 'good' | 'fair' | 'poor' | 'refused'
type EngagementKey = 'active' | 'moderate' | 'minimal'
type TimeRange = '7d' | '30d' | '90d'

const MOOD_EMOJI: Record<MoodKey, string> = {
  happy: '\u{1F60A}',
  content: '\u{1F642}',
  neutral: '\u{1F610}',
  anxious: '\u{1F61F}',
  sad: '\u{1F622}',
  agitated: '\u{1F624}',
}

const MOOD_LABELS: Record<MoodKey, string> = {
  happy: 'Happy',
  content: 'Content',
  neutral: 'Neutral',
  anxious: 'Anxious',
  sad: 'Sad',
  agitated: 'Agitated',
}

const MOOD_SCORE: Record<MoodKey, number> = {
  happy: 6,
  content: 5,
  neutral: 4,
  anxious: 3,
  sad: 2,
  agitated: 1,
}

const APPETITE_LABELS: Record<AppetiteKey, string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  refused: 'Refused',
}

const APPETITE_COLORS: Record<AppetiteKey, string> = {
  good: 'bg-mint-400',
  fair: 'bg-yellow-400',
  poor: 'bg-red-400',
  refused: 'bg-red-600',
}

const ENGAGEMENT_LABELS: Record<EngagementKey, string> = {
  active: 'Active',
  moderate: 'Moderate',
  minimal: 'Minimal',
}

const ENGAGEMENT_COLORS: Record<EngagementKey, string> = {
  active: 'bg-mint-400',
  moderate: 'bg-lavender-400',
  minimal: 'bg-peach-400',
}

const RANGE_OPTIONS: { value: TimeRange; label: string; days: number }[] = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '30d', label: '30 Days', days: 30 },
  { value: '90d', label: '90 Days', days: 90 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDayLabel(date: Date): string {
  return format(new Date(date), 'EEE')
}

function getShortDate(date: Date): string {
  return format(new Date(date), 'M/d')
}

function computeTrendDirection(
  firstHalfValues: number[],
  secondHalfValues: number[],
): 'up' | 'same' | 'down' {
  if (firstHalfValues.length === 0 || secondHalfValues.length === 0) return 'same'
  const firstAvg = firstHalfValues.reduce((s, v) => s + v, 0) / firstHalfValues.length
  const secondAvg = secondHalfValues.reduce((s, v) => s + v, 0) / secondHalfValues.length
  const diff = secondAvg - firstAvg
  if (Math.abs(diff) < 0.3) return 'same'
  return diff > 0 ? 'up' : 'down'
}

function TrendArrow({
  direction,
  invert = false,
}: {
  direction: 'up' | 'same' | 'down'
  invert?: boolean
}) {
  // invert = true means "up is bad" (e.g. pain level going up)
  if (direction === 'up') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
          invert ? 'text-red-500' : 'text-mint-600'
        }`}
      >
        <TrendingUp className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (direction === 'down') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
          invert ? 'text-mint-600' : 'text-red-500'
        }`}
      >
        <TrendingDown className="h-3.5 w-3.5" />
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-navy-400">
      <Minus className="h-3.5 w-3.5" />
    </span>
  )
}

function moodScoreForDay(day: WellnessDay): number | null {
  const moods: MoodKey[] = []
  if (day.moodAM) moods.push(day.moodAM as MoodKey)
  if (day.moodPM) moods.push(day.moodPM as MoodKey)
  if (moods.length === 0) return null
  return moods.reduce((s, m) => s + (MOOD_SCORE[m] ?? 0), 0) / moods.length
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WellnessTrends({ days }: WellnessTrendsProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d')

  // Sort days oldest-first for charting
  const sortedDays = useMemo(
    () =>
      [...days].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [days],
  )

  const rangeConfig = RANGE_OPTIONS.find((r) => r.value === selectedRange)!
  const hasEnoughData = sortedDays.length >= (selectedRange === '7d' ? 2 : rangeConfig.days * 0.3)

  // -------------------------------------------------------------------------
  // Computed metrics
  // -------------------------------------------------------------------------

  const avgScore = useMemo(() => {
    if (sortedDays.length === 0) return 0
    return (
      sortedDays.reduce((sum, d) => sum + d.overallScore, 0) / sortedDays.length
    )
  }, [sortedDays])

  const prevPeriodAvg = useMemo(() => {
    const mid = Math.floor(sortedDays.length / 2)
    const firstHalf = sortedDays.slice(0, mid)
    if (firstHalf.length === 0) return avgScore
    return firstHalf.reduce((s, d) => s + d.overallScore, 0) / firstHalf.length
  }, [sortedDays, avgScore])

  const scoreChange = useMemo(
    () => +(avgScore - prevPeriodAvg).toFixed(1),
    [avgScore, prevPeriodAvg],
  )

  // Mood distribution
  const moodDistribution = useMemo(() => {
    const counts: Record<MoodKey, number> = {
      happy: 0,
      content: 0,
      neutral: 0,
      anxious: 0,
      sad: 0,
      agitated: 0,
    }
    sortedDays.forEach((d) => {
      if (d.moodAM && counts[d.moodAM as MoodKey] !== undefined) counts[d.moodAM as MoodKey]++
      if (d.moodPM && counts[d.moodPM as MoodKey] !== undefined) counts[d.moodPM as MoodKey]++
    })
    return counts
  }, [sortedDays])

  // Best day
  const bestDay = useMemo(() => {
    if (sortedDays.length === 0) return null
    const best = sortedDays.reduce((best, d) =>
      d.overallScore > best.overallScore ? d : best,
    )
    return best
  }, [sortedDays])

  // Appetite distribution
  const appetiteDistribution = useMemo(() => {
    const counts: Record<AppetiteKey, number> = { good: 0, fair: 0, poor: 0, refused: 0 }
    sortedDays.forEach((d) => {
      if (d.appetite && counts[d.appetite as AppetiteKey] !== undefined)
        counts[d.appetite as AppetiteKey]++
    })
    return counts
  }, [sortedDays])

  // Social engagement distribution
  const engagementDistribution = useMemo(() => {
    const counts: Record<EngagementKey, number> = { active: 0, moderate: 0, minimal: 0 }
    sortedDays.forEach((d) => {
      if (d.socialEngagement && counts[d.socialEngagement as EngagementKey] !== undefined)
        counts[d.socialEngagement as EngagementKey]++
    })
    return counts
  }, [sortedDays])

  // Pain stats
  const painStats = useMemo(() => {
    const painDays = sortedDays.filter((d) => d.painLevel !== undefined && d.painLevel !== null)
    if (painDays.length === 0) return null
    const values = painDays.map((d) => d.painLevel!)
    return {
      avg: +(values.reduce((s, v) => s + v, 0) / values.length).toFixed(1),
      min: Math.min(...values),
      max: Math.max(...values),
      days: painDays,
    }
  }, [sortedDays])

  // Category trend directions (first half vs second half)
  const appetiteTrend = useMemo(() => {
    const mid = Math.floor(sortedDays.length / 2)
    const appetiteScore: Record<string, number> = { good: 3, fair: 2, poor: 1, refused: 0 }
    const first = sortedDays
      .slice(0, mid)
      .filter((d) => d.appetite)
      .map((d) => appetiteScore[d.appetite!] ?? 0)
    const second = sortedDays
      .slice(mid)
      .filter((d) => d.appetite)
      .map((d) => appetiteScore[d.appetite!] ?? 0)
    return computeTrendDirection(first, second)
  }, [sortedDays])

  const engagementTrend = useMemo(() => {
    const mid = Math.floor(sortedDays.length / 2)
    const engScore: Record<string, number> = { active: 3, moderate: 2, minimal: 1 }
    const first = sortedDays
      .slice(0, mid)
      .filter((d) => d.socialEngagement)
      .map((d) => engScore[d.socialEngagement!] ?? 0)
    const second = sortedDays
      .slice(mid)
      .filter((d) => d.socialEngagement)
      .map((d) => engScore[d.socialEngagement!] ?? 0)
    return computeTrendDirection(first, second)
  }, [sortedDays])

  const painTrend = useMemo(() => {
    const mid = Math.floor(sortedDays.length / 2)
    const first = sortedDays
      .slice(0, mid)
      .filter((d) => d.painLevel !== undefined)
      .map((d) => d.painLevel!)
    const second = sortedDays
      .slice(mid)
      .filter((d) => d.painLevel !== undefined)
      .map((d) => d.painLevel!)
    return computeTrendDirection(first, second)
  }, [sortedDays])

  // Week-over-week comparison
  const weekComparison = useMemo(() => {
    if (sortedDays.length < 4) return null

    const mid = Math.floor(sortedDays.length / 2)
    const thisWeek = sortedDays.slice(mid)
    const lastWeek = sortedDays.slice(0, mid)

    const avgMoodThis = thisWeek
      .map(moodScoreForDay)
      .filter((v): v is number => v !== null)
    const avgMoodLast = lastWeek
      .map(moodScoreForDay)
      .filter((v): v is number => v !== null)

    const appetiteScore: Record<string, number> = { good: 3, fair: 2, poor: 1, refused: 0 }
    const avgAppThis = thisWeek
      .filter((d) => d.appetite)
      .map((d) => appetiteScore[d.appetite!] ?? 0)
    const avgAppLast = lastWeek
      .filter((d) => d.appetite)
      .map((d) => appetiteScore[d.appetite!] ?? 0)

    const avgPainThis = thisWeek
      .filter((d) => d.painLevel !== undefined)
      .map((d) => d.painLevel!)
    const avgPainLast = lastWeek
      .filter((d) => d.painLevel !== undefined)
      .map((d) => d.painLevel!)

    const engScore: Record<string, number> = { active: 3, moderate: 2, minimal: 1 }
    const avgEngThis = thisWeek
      .filter((d) => d.socialEngagement)
      .map((d) => engScore[d.socialEngagement!] ?? 0)
    const avgEngLast = lastWeek
      .filter((d) => d.socialEngagement)
      .map((d) => engScore[d.socialEngagement!] ?? 0)

    const therapyThis = thisWeek.reduce((s, d) => s + (d.therapySessions ?? 0), 0)
    const therapyLast = lastWeek.reduce((s, d) => s + (d.therapySessions ?? 0), 0)

    const visitsThis = thisWeek.reduce((s, d) => s + (d.visitCount ?? 0), 0)
    const visitsLast = lastWeek.reduce((s, d) => s + (d.visitCount ?? 0), 0)

    const safe = (arr: number[]) => (arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null)

    const moodThisAvg = safe(avgMoodThis)
    const moodLastAvg = safe(avgMoodLast)
    const appThisAvg = safe(avgAppThis)
    const appLastAvg = safe(avgAppLast)
    const painThisAvg = safe(avgPainThis)
    const painLastAvg = safe(avgPainLast)
    const engThisAvg = safe(avgEngThis)
    const engLastAvg = safe(avgEngLast)

    const scoreThisAvg = safe(thisWeek.map((d) => d.overallScore))
    const scoreLastAvg = safe(lastWeek.map((d) => d.overallScore))

    type RowData = {
      label: string
      thisWeek: string
      lastWeek: string
      change: 'up' | 'same' | 'down'
      invert?: boolean
    }

    const rows: RowData[] = [
      {
        label: 'Mood',
        thisWeek: moodThisAvg !== null ? moodThisAvg.toFixed(1) : 'N/A',
        lastWeek: moodLastAvg !== null ? moodLastAvg.toFixed(1) : 'N/A',
        change: computeTrendDirection(
          avgMoodLast.length > 0 ? avgMoodLast : [0],
          avgMoodThis.length > 0 ? avgMoodThis : [0],
        ),
      },
      {
        label: 'Appetite',
        thisWeek: appThisAvg !== null ? appThisAvg.toFixed(1) : 'N/A',
        lastWeek: appLastAvg !== null ? appLastAvg.toFixed(1) : 'N/A',
        change: computeTrendDirection(
          avgAppLast.length > 0 ? avgAppLast : [0],
          avgAppThis.length > 0 ? avgAppThis : [0],
        ),
      },
      {
        label: 'Pain',
        thisWeek: painThisAvg !== null ? painThisAvg.toFixed(1) : 'N/A',
        lastWeek: painLastAvg !== null ? painLastAvg.toFixed(1) : 'N/A',
        change: computeTrendDirection(
          avgPainLast.length > 0 ? avgPainLast : [0],
          avgPainThis.length > 0 ? avgPainThis : [0],
        ),
        invert: true,
      },
      {
        label: 'Social',
        thisWeek: engThisAvg !== null ? engThisAvg.toFixed(1) : 'N/A',
        lastWeek: engLastAvg !== null ? engLastAvg.toFixed(1) : 'N/A',
        change: computeTrendDirection(
          avgEngLast.length > 0 ? avgEngLast : [0],
          avgEngThis.length > 0 ? avgEngThis : [0],
        ),
      },
      {
        label: 'Therapy Sessions',
        thisWeek: String(therapyThis),
        lastWeek: String(therapyLast),
        change:
          therapyThis > therapyLast ? 'up' : therapyThis < therapyLast ? 'down' : 'same',
      },
      {
        label: 'Visits',
        thisWeek: String(visitsThis),
        lastWeek: String(visitsLast),
        change: visitsThis > visitsLast ? 'up' : visitsThis < visitsLast ? 'down' : 'same',
      },
    ]

    // Overall trajectory
    let upCount = 0
    let downCount = 0
    rows.forEach((r) => {
      const effectiveDir = r.invert
        ? r.change === 'up'
          ? 'down'
          : r.change === 'down'
          ? 'up'
          : 'same'
        : r.change
      if (effectiveDir === 'up') upCount++
      if (effectiveDir === 'down') downCount++
    })
    const trajectory: 'improving' | 'stable' | 'declining' =
      upCount > downCount ? 'improving' : downCount > upCount ? 'declining' : 'stable'

    return { rows, trajectory, scoreThisAvg, scoreLastAvg }
  }, [sortedDays])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Header                                                         */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-6 w-6 text-lavender-500" />
            <h2 className="text-2xl font-bold text-navy-900">Wellness Trends</h2>
          </div>
          <p className="text-navy-600 text-sm">
            Margaret&apos;s wellbeing over time
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedRange(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedRange === opt.value
                  ? 'bg-lavender-100 text-lavender-700 shadow-sm'
                  : 'bg-white text-navy-600 hover:bg-cream-100 border border-lavender-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Not enough data message for non-7d ranges */}
      {!hasEnoughData && (
        <div className="card-glass p-8 text-center">
          <Calendar className="h-10 w-10 text-lavender-300 mx-auto mb-3" />
          <p className="text-navy-600 font-medium">Not enough data</p>
          <p className="text-navy-400 text-sm mt-1">
            We need more days of recorded wellness to show {rangeConfig.label.toLowerCase()} trends.
          </p>
        </div>
      )}

      {hasEnoughData && (
        <>
          {/* ----------------------------------------------------------------- */}
          {/* 2. Overall Wellness Score Bar Chart                               */}
          {/* ----------------------------------------------------------------- */}
          <div className="card-glass p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-lavender-100 to-mint-100">
                  <Activity className="h-5 w-5 text-lavender-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">Overall Wellness Score</h3>
                  <p className="text-xs text-navy-500">Daily score from 1 to 10</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-navy-900">{avgScore.toFixed(1)}</div>
                  <div className="text-xs text-navy-500">Average</div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    scoreChange > 0
                      ? 'bg-mint-100 text-mint-700'
                      : scoreChange < 0
                      ? 'bg-red-100 text-red-600'
                      : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  {scoreChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : scoreChange < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {scoreChange > 0 ? '+' : ''}
                  {scoreChange} from last period
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="space-y-2.5">
              {sortedDays.map((day, idx) => {
                const widthPercent = Math.max((day.overallScore / 10) * 100, 4)
                const barColor =
                  day.overallScore >= 7
                    ? 'from-lavender-400 to-mint-400'
                    : day.overallScore >= 5
                    ? 'from-lavender-400 to-lavender-300'
                    : 'from-peach-400 to-peach-300'
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-navy-600 w-10 text-right flex-shrink-0">
                      {getDayLabel(day.date)}
                    </span>
                    <div className="flex-1 bg-cream-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold w-7 text-right flex-shrink-0 ${
                        day.overallScore >= 7
                          ? 'text-mint-600'
                          : day.overallScore >= 5
                          ? 'text-lavender-600'
                          : 'text-peach-600'
                      }`}
                    >
                      {day.overallScore}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 3. Mood Pattern Grid                                              */}
          {/* ----------------------------------------------------------------- */}
          <div className="card-glass p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-lavender-100">
                <Smile className="h-5 w-5 text-lavender-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Mood Patterns</h3>
                <p className="text-xs text-navy-500">Morning and evening mood readings</p>
              </div>
            </div>

            {/* Mood grid table */}
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr>
                    <th className="text-xs font-medium text-navy-500 text-left px-2 pb-2 w-12">
                      &nbsp;
                    </th>
                    {sortedDays.map((day, idx) => (
                      <th
                        key={idx}
                        className="text-xs font-medium text-navy-500 text-center px-1 pb-2"
                      >
                        <div>{getDayLabel(day.date)}</div>
                        <div className="text-[10px] text-navy-400 font-normal">
                          {getShortDate(day.date)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* AM row */}
                  <tr>
                    <td className="text-xs font-medium text-navy-600 px-2 py-2">AM</td>
                    {sortedDays.map((day, idx) => (
                      <td key={idx} className="text-center px-1 py-2">
                        {day.moodAM ? (
                          <span
                            className="text-lg cursor-default"
                            title={MOOD_LABELS[day.moodAM as MoodKey] ?? day.moodAM}
                          >
                            {MOOD_EMOJI[day.moodAM as MoodKey] ?? '--'}
                          </span>
                        ) : (
                          <span className="text-sm text-navy-300">--</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {/* PM row */}
                  <tr>
                    <td className="text-xs font-medium text-navy-600 px-2 py-2">PM</td>
                    {sortedDays.map((day, idx) => (
                      <td key={idx} className="text-center px-1 py-2">
                        {day.moodPM ? (
                          <span
                            className="text-lg cursor-default"
                            title={MOOD_LABELS[day.moodPM as MoodKey] ?? day.moodPM}
                          >
                            {MOOD_EMOJI[day.moodPM as MoodKey] ?? '--'}
                          </span>
                        ) : (
                          <span className="text-sm text-navy-300">--</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mood distribution */}
            <div className="mt-5 pt-4 border-t border-lavender-100/50">
              <p className="text-xs font-medium text-navy-500 mb-3">Mood Distribution</p>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(MOOD_EMOJI) as MoodKey[]).map((mood) => {
                  const count = moodDistribution[mood]
                  if (count === 0) return null
                  return (
                    <div
                      key={mood}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 rounded-xl"
                    >
                      <span className="text-base">{MOOD_EMOJI[mood]}</span>
                      <span className="text-xs font-medium text-navy-700">
                        {MOOD_LABELS[mood]}:
                      </span>
                      <span className="text-xs font-bold text-navy-900">{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* Pattern insight */}
              {bestDay && (
                <div className="mt-3 px-3 py-2 bg-lavender-50 rounded-xl">
                  <p className="text-xs text-lavender-700">
                    <span className="font-semibold">Best day:</span>{' '}
                    {format(new Date(bestDay.date), 'EEEE')} (score {bestDay.overallScore}/10)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 4. Category Breakdown (3 cards)                                   */}
          {/* ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Appetite Card */}
            <div className="card-glass p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-peach-50">
                    <Utensils className="h-4 w-4 text-peach-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-navy-900">Appetite</h4>
                </div>
                <TrendArrow direction={appetiteTrend} />
              </div>
              <div className="space-y-3">
                {(Object.keys(APPETITE_LABELS) as AppetiteKey[]).map((key) => {
                  const count = appetiteDistribution[key]
                  const total = Object.values(appetiteDistribution).reduce((s, v) => s + v, 0)
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-navy-600">{APPETITE_LABELS[key]}</span>
                        <span className="text-xs font-semibold text-navy-800">{count}</span>
                      </div>
                      <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${APPETITE_COLORS[key]} transition-all duration-500 ease-out`}
                          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Social Engagement Card */}
            <div className="card-glass p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-lavender-50">
                    <Users className="h-4 w-4 text-lavender-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-navy-900">Social Engagement</h4>
                </div>
                <TrendArrow direction={engagementTrend} />
              </div>
              <div className="space-y-3">
                {(Object.keys(ENGAGEMENT_LABELS) as EngagementKey[]).map((key) => {
                  const count = engagementDistribution[key]
                  const total = Object.values(engagementDistribution).reduce((s, v) => s + v, 0)
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-navy-600">{ENGAGEMENT_LABELS[key]}</span>
                        <span className="text-xs font-semibold text-navy-800">{count}</span>
                      </div>
                      <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ENGAGEMENT_COLORS[key]} transition-all duration-500 ease-out`}
                          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pain Level Card */}
            <div className="card-glass p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-50">
                    <Activity className="h-4 w-4 text-red-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-navy-900">Pain Level</h4>
                </div>
                <TrendArrow direction={painTrend} invert />
              </div>

              {painStats ? (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-cream-50 rounded-xl">
                      <div className="text-lg font-bold text-navy-900">{painStats.avg}</div>
                      <div className="text-[10px] text-navy-500">Avg</div>
                    </div>
                    <div className="text-center p-2 bg-mint-50 rounded-xl">
                      <div className="text-lg font-bold text-mint-600">{painStats.min}</div>
                      <div className="text-[10px] text-navy-500">Min</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-xl">
                      <div className="text-lg font-bold text-red-500">{painStats.max}</div>
                      <div className="text-[10px] text-navy-500">Max</div>
                    </div>
                  </div>

                  {/* Daily pain dots */}
                  <div className="space-y-1.5">
                    {sortedDays.map((day, idx) => {
                      if (day.painLevel === undefined || day.painLevel === null) return null
                      const pct = (day.painLevel / 10) * 100
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[10px] text-navy-500 w-8 text-right flex-shrink-0">
                            {getDayLabel(day.date)}
                          </span>
                          <div className="flex-1 bg-cream-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${
                                day.painLevel <= 3
                                  ? 'bg-mint-400'
                                  : day.painLevel <= 6
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-navy-700 w-4 flex-shrink-0">
                            {day.painLevel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-navy-400">No pain data recorded</p>
                </div>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 5. Week-over-Week Comparison Table                                */}
          {/* ----------------------------------------------------------------- */}
          {weekComparison && (
            <div className="card-glass p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-lavender-100 to-peach-100">
                  <Calendar className="h-5 w-5 text-lavender-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">Period Comparison</h3>
                  <p className="text-xs text-navy-500">First half vs. second half of selected period</p>
                </div>
              </div>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[380px]">
                  <thead>
                    <tr className="border-b border-lavender-100/50">
                      <th className="text-xs font-medium text-navy-500 text-left px-3 pb-3">
                        Metric
                      </th>
                      <th className="text-xs font-medium text-navy-500 text-center px-3 pb-3">
                        This Period
                      </th>
                      <th className="text-xs font-medium text-navy-500 text-center px-3 pb-3">
                        Last Period
                      </th>
                      <th className="text-xs font-medium text-navy-500 text-center px-3 pb-3">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekComparison.rows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-cream-100 last:border-b-0"
                      >
                        <td className="text-sm font-medium text-navy-800 px-3 py-3">
                          {row.label}
                        </td>
                        <td className="text-sm text-navy-700 text-center px-3 py-3 font-semibold">
                          {row.thisWeek}
                        </td>
                        <td className="text-sm text-navy-500 text-center px-3 py-3">
                          {row.lastWeek}
                        </td>
                        <td className="text-center px-3 py-3">
                          <TrendArrow direction={row.change} invert={row.invert} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Trajectory badge */}
              <div className="mt-4 pt-4 border-t border-lavender-100/50 flex items-center justify-between">
                <span className="text-sm font-medium text-navy-700">Overall trajectory</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    weekComparison.trajectory === 'improving'
                      ? 'bg-mint-100 text-mint-700'
                      : weekComparison.trajectory === 'declining'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  {weekComparison.trajectory === 'improving' && (
                    <TrendingUp className="h-3 w-3 inline mr-1 -mt-0.5" />
                  )}
                  {weekComparison.trajectory === 'declining' && (
                    <TrendingDown className="h-3 w-3 inline mr-1 -mt-0.5" />
                  )}
                  {weekComparison.trajectory === 'stable' && (
                    <Minus className="h-3 w-3 inline mr-1 -mt-0.5" />
                  )}
                  {weekComparison.trajectory.charAt(0).toUpperCase() +
                    weekComparison.trajectory.slice(1)}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
