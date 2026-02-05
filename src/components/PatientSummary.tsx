'use client'

import { useMemo } from 'react'
import {
  Heart,
  Brain,
  Pill,
  Users,
  Clock,
  MapPin,
  Activity,
} from 'lucide-react'
import { PatientInfo, LogEntry, CalendarEvent, Visit } from '@/types'
import { formatDistanceToNow, isToday, format, isFuture } from 'date-fns'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PatientSummaryProps {
  patient: PatientInfo
  logEntries: LogEntry[]
  events: CalendarEvent[]
  visits: Visit[]
  onClaimVisit?: (eventId: string) => void
}

// ---------------------------------------------------------------------------
// Mood helpers
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
  happy: 'Happy',
  content: 'Content',
  neutral: 'Neutral',
  anxious: 'Anxious',
  sad: 'Sad',
  agitated: 'Agitated',
}

const alertnessLabel: Record<string, string> = {
  alert: 'Alert',
  drowsy: 'Drowsy',
  lethargic: 'Lethargic',
  unresponsive: 'Unresponsive',
}

const appetiteLabel: Record<string, string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  refused: 'Refused',
}

// ---------------------------------------------------------------------------
// Utility: extract initials from a name
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PatientSummary({
  patient,
  logEntries,
  events,
  visits,
  onClaimVisit,
}: PatientSummaryProps) {
  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const sortedEntries = useMemo(
    () =>
      [...logEntries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
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

  const latestMedication = useMemo(
    () => sortedEntries.find((e) => e.category === 'medication' && e.medicationLog),
    [sortedEntries],
  )

  const nextVisit = useMemo(() => {
    const now = new Date()
    const futureEvents = events
      .filter((e) => isFuture(new Date(e.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Prefer family_visit type if one exists in the near future
    const familyVisit = futureEvents.find((e) => e.type === 'family_visit')
    return familyVisit || futureEvents[0] || null
  }, [events])

  const todayEntryCount = useMemo(
    () => logEntries.filter((e) => isToday(new Date(e.createdAt))).length,
    [logEntries],
  )

  const currentlyVisiting = useMemo(
    () => visits.find((v) => !v.checkOutTime),
    [visits],
  )

  const lastUpdated = useMemo(() => {
    if (sortedEntries.length === 0) return null
    return new Date(sortedEntries[0].createdAt)
  }, [sortedEntries])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-5">
      {/* ----------------------------------------------------------------- */}
      {/* Patient Header Row                                                */}
      {/* ----------------------------------------------------------------- */}
      <div className="card-glass p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {patient.photoUrl ? (
            <img
              src={patient.photoUrl}
              alt={patient.name}
              className="h-14 w-14 rounded-2xl object-cover shadow-soft"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-lavender-400 to-peach-400 flex items-center justify-center shadow-soft flex-shrink-0">
              <span className="text-white font-bold text-xl leading-none">
                {getInitials(patient.name)}
              </span>
            </div>
          )}

          {/* Name + Meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-navy-900 truncate">{patient.name}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-navy-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-lavender-400" />
                Room {patient.roomNumber}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="truncate">{patient.facilityName}</span>
            </div>
          </div>

          {/* Diagnosis Badge */}
          {patient.primaryDiagnosis && (
            <span className="hidden sm:inline-flex items-center px-3 py-1.5 bg-lavender-100 text-lavender-700 text-xs font-medium rounded-full whitespace-nowrap">
              {patient.primaryDiagnosis}
            </span>
          )}
        </div>

        {/* Mobile diagnosis badge */}
        {patient.primaryDiagnosis && (
          <div className="mt-3 sm:hidden">
            <span className="inline-flex items-center px-3 py-1.5 bg-lavender-100 text-lavender-700 text-xs font-medium rounded-full">
              {patient.primaryDiagnosis}
            </span>
          </div>
        )}

        {/* Currently visiting banner */}
        {currentlyVisiting && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-mint-50 border border-mint-200 rounded-2xl">
            <div className="h-2 w-2 rounded-full bg-mint-500 animate-pulse" />
            <span className="text-sm font-medium text-mint-700">
              {currentlyVisiting.visitorName}
              {currentlyVisiting.visitorRelationship
                ? ` (${currentlyVisiting.visitorRelationship})`
                : ''}{' '}
              is currently visiting
            </span>
            <span className="ml-auto text-xs text-mint-600">
              since{' '}
              {format(new Date(currentlyVisiting.checkInTime), 'h:mm a')}
            </span>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Quick-Glance Cards Grid                                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ---- Card 1: Latest Vitals ---- */}
        <div className="card-glass p-4 flex flex-col gap-3 hover:shadow-float transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-50">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-navy-900">Vitals</h3>
          </div>

          {latestVitals?.vitals ? (
            <div className="space-y-2 flex-1">
              {latestVitals.vitals.bloodPressureSystolic != null &&
                latestVitals.vitals.bloodPressureDiastolic != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-navy-500">BP</span>
                    <span className="text-sm font-semibold text-navy-900">
                      {latestVitals.vitals.bloodPressureSystolic}/
                      {latestVitals.vitals.bloodPressureDiastolic}
                    </span>
                  </div>
                )}
              {latestVitals.vitals.heartRate != null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy-500">HR</span>
                  <span className="text-sm font-semibold text-navy-900">
                    {latestVitals.vitals.heartRate} bpm
                  </span>
                </div>
              )}
              {latestVitals.vitals.oxygenSaturation != null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy-500">O2</span>
                  <span className="text-sm font-semibold text-navy-900">
                    {latestVitals.vitals.oxygenSaturation}%
                  </span>
                </div>
              )}
              <p className="text-[11px] text-navy-400 pt-1">
                Updated{' '}
                {formatDistanceToNow(new Date(latestVitals.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : (
            <p className="text-xs text-navy-400 flex-1">No vitals recorded yet</p>
          )}
        </div>

        {/* ---- Card 2: Current Mood ---- */}
        <div className="card-glass p-4 flex flex-col gap-3 hover:shadow-float transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50">
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold text-navy-900">Mood</h3>
          </div>

          {latestMood?.moodLog ? (
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">
                  {moodEmoji[latestMood.moodLog.mood] || '\u{1F610}'}
                </span>
                <span className="text-sm font-semibold text-navy-900">
                  {moodLabel[latestMood.moodLog.mood] || latestMood.moodLog.mood}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-navy-500">Alertness</span>
                <span className="text-xs font-medium text-navy-700">
                  {alertnessLabel[latestMood.moodLog.alertness] || latestMood.moodLog.alertness}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-navy-500">Appetite</span>
                <span className="text-xs font-medium text-navy-700">
                  {appetiteLabel[latestMood.moodLog.appetite] || latestMood.moodLog.appetite}
                </span>
              </div>
              <p className="text-[11px] text-navy-400 pt-1">
                Updated{' '}
                {formatDistanceToNow(new Date(latestMood.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : (
            <p className="text-xs text-navy-400 flex-1">No mood recorded yet</p>
          )}
        </div>

        {/* ---- Card 3: Last Medication ---- */}
        <div className="card-glass p-4 flex flex-col gap-3 hover:shadow-float transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50">
              <Pill className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold text-navy-900">Medication</h3>
          </div>

          {latestMedication?.medicationLog ? (
            <div className="space-y-2 flex-1">
              <p className="text-sm font-semibold text-navy-900 leading-snug">
                {latestMedication.medicationLog.medicationName}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-navy-500">Dosage</span>
                <span className="text-xs font-medium text-navy-700">
                  {latestMedication.medicationLog.dosage}
                </span>
              </div>
              {latestMedication.medicationLog.route && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy-500">Route</span>
                  <span className="text-xs font-medium text-navy-700">
                    {latestMedication.medicationLog.route}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-navy-400 pt-1">
                Administered{' '}
                {formatDistanceToNow(new Date(latestMedication.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : (
            <p className="text-xs text-navy-400 flex-1">No medication logged yet</p>
          )}
        </div>

        {/* ---- Card 4: Next Visit ---- */}
        <div className="card-glass p-4 flex flex-col gap-3 hover:shadow-float transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lavender-50">
              <Users className="h-4 w-4 text-lavender-500" />
            </div>
            <h3 className="text-sm font-semibold text-navy-900">Next Visit</h3>
          </div>

          {nextVisit ? (
            <div className="space-y-2 flex-1">
              <p className="text-sm font-semibold text-navy-900 leading-snug">
                {nextVisit.title}
              </p>
              <div className="flex items-center gap-1 text-xs text-navy-500">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(nextVisit.date), 'MMM d')}
                  {nextVisit.time ? ` at ${nextVisit.time}` : ''}
                </span>
              </div>
              {nextVisit.claimedByName ? (
                <p className="text-xs text-mint-600 font-medium">
                  {nextVisit.claimedByName} is coming
                </p>
              ) : onClaimVisit ? (
                <button
                  onClick={() => onClaimVisit(nextVisit.id)}
                  className="mt-auto w-full px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-lavender-500 to-lavender-600 rounded-xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-soft hover:-translate-y-0.5"
                >
                  I'll Visit
                </button>
              ) : (
                <p className="text-xs text-navy-400">Unclaimed</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-navy-400 flex-1">No upcoming visits</p>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom Summary Bar                                                */}
      {/* ----------------------------------------------------------------- */}
      <div className="card-glass px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-sm text-navy-500">
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-lavender-400" />
          <span>
            <span className="font-semibold text-navy-700">{todayEntryCount}</span> log{' '}
            {todayEntryCount === 1 ? 'entry' : 'entries'} today
          </span>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-navy-400" />
            <span>
              Last updated{' '}
              {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
