'use client'

import { useState, useEffect } from 'react'
import { getMockPCCClient } from '@/lib/pcc/client'
import {
  pccResidentToPatient,
  pccVitalsToLogEntry,
  pccAssessmentToLogEntries,
  pccIncidentToLogEntry,
  pccMedicationAdminToLogEntry,
  pccMedicationOrderToMedication,
  pccProgressNoteToLogEntry,
  pccAppointmentToCalendarEvent,
} from '@/lib/pcc/mappers'
import { deriveWellnessDays } from '@/lib/pcc/aggregators'
import type { PatientInfo, LogEntry, Medication, CalendarEvent, WellnessDay } from '@/types'

// ──────────────────────────────────────────────
// Date utilities
// ──────────────────────────────────────────────

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

const REFETCH_INTERVAL_MS = 120_000

// ──────────────────────────────────────────────
// usePCCResidents
// ──────────────────────────────────────────────

export function usePCCResidents(): {
  residents: PatientInfo[]
  loading: boolean
  error: string | null
} {
  const [residents, setResidents] = useState<PatientInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const client = getMockPCCClient()
        const raw = await client.listResidents()
        if (!cancelled) {
          setResidents(raw.map(pccResidentToPatient))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load residents. Please try again.')
          console.error('[usePCCResidents]', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFETCH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { residents, loading, error }
}

// ──────────────────────────────────────────────
// usePCCPatient
// ──────────────────────────────────────────────

export function usePCCPatient(residentId: string): {
  patient: PatientInfo | null
  loading: boolean
  error: string | null
} {
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!residentId) return

    let cancelled = false

    async function load() {
      try {
        const client = getMockPCCClient()
        const raw = await client.getResident(residentId)
        if (!cancelled) {
          setPatient(pccResidentToPatient(raw))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load resident information. Please try again.')
          console.error('[usePCCPatient]', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFETCH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [residentId])

  return { patient, loading, error }
}

// ──────────────────────────────────────────────
// usePCCLogEntries
// ──────────────────────────────────────────────

export function usePCCLogEntries(residentId: string, days = 30): {
  logEntries: LogEntry[]
  loading: boolean
  error: string | null
} {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!residentId) return

    let cancelled = false

    async function load() {
      try {
        const client = getMockPCCClient()
        const startDate = toISODate(daysAgo(days))
        const endDate = toISODate(new Date())

        const [vitals, assessments, incidents, orders, administrations, progressNotes] =
          await Promise.all([
            client.getVitals(residentId, startDate, endDate),
            client.getAssessments(residentId, startDate, endDate),
            client.getIncidents(residentId, startDate, endDate),
            client.getMedicationOrders(residentId),
            client.getMedicationAdministrations(residentId, startDate, endDate),
            client.getProgressNotes(residentId, startDate, endDate),
          ])

        if (cancelled) return

        // Build an order lookup map for medication admins
        const orderMap = new Map(orders.map((o) => [o.orderId, o]))

        const vitalsEntries = vitals.map(pccVitalsToLogEntry)
        const assessmentEntries = assessments.flatMap(pccAssessmentToLogEntries)
        const incidentEntries = incidents.map(pccIncidentToLogEntry)
        const medEntries = administrations
          .filter((a) => a.status !== 'not_due')
          .map((a) => {
            const order = orderMap.get(a.orderId)
            if (!order) return null
            return pccMedicationAdminToLogEntry(a, order)
          })
          .filter((e): e is LogEntry => e !== null)
        const noteEntries = progressNotes.map(pccProgressNoteToLogEntry)

        const all = [
          ...vitalsEntries,
          ...assessmentEntries,
          ...incidentEntries,
          ...medEntries,
          ...noteEntries,
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        setLogEntries(all)
        setError(null)
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load care log entries. Please try again.')
          console.error('[usePCCLogEntries]', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFETCH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [residentId, days])

  return { logEntries, loading, error }
}

// ──────────────────────────────────────────────
// usePCCMedications
// ──────────────────────────────────────────────

export function usePCCMedications(residentId: string): {
  medications: Medication[]
  loading: boolean
  error: string | null
} {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!residentId) return

    let cancelled = false

    async function load() {
      try {
        const client = getMockPCCClient()
        const orders = await client.getMedicationOrders(residentId)
        if (!cancelled) {
          setMedications(
            orders
              .filter((o) => o.isActive)
              .map(pccMedicationOrderToMedication),
          )
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load medications. Please try again.')
          console.error('[usePCCMedications]', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFETCH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [residentId])

  return { medications, loading, error }
}

// ──────────────────────────────────────────────
// usePCCEvents
// ──────────────────────────────────────────────

export function usePCCEvents(residentId: string): {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
} {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!residentId) return

    let cancelled = false

    async function load() {
      try {
        const client = getMockPCCClient()
        const startDate = toISODate(daysAgo(60))
        const endDate = toISODate(daysFromNow(60))
        const appointments = await client.getAppointments(residentId, startDate, endDate)
        if (!cancelled) {
          setEvents(appointments.map(pccAppointmentToCalendarEvent))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load calendar events. Please try again.')
          console.error('[usePCCEvents]', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFETCH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [residentId])

  return { events, loading, error }
}

// ──────────────────────────────────────────────
// usePCCWellnessDays
// ──────────────────────────────────────────────

export function usePCCWellnessDays(residentId: string, days = 30): {
  wellnessDays: WellnessDay[]
  loading: boolean
  error: string | null
} {
  const [wellnessDays, setWellnessDays] = useState<WellnessDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!residentId) return

    let cancelled = false

    async function load() {
      try {
        const client = getMockPCCClient()
        const startDate = toISODate(daysAgo(days))
        const endDate = toISODate(new Date())

        const [assessments, vitals] = await Promise.all([
          client.getAssessments(residentId, startDate, endDate),
          client.getVitals(residentId, startDate, endDate),
        ])

        if (!cancelled) {
          const derived = deriveWellnessDays(
            assessments,
            vitals,
            daysAgo(days),
            new Date(),
          )
          setWellnessDays(derived)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load wellness data. Please try again.')
          console.error('[usePCCWellnessDays]', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFETCH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [residentId, days])

  return { wellnessDays, loading, error }
}

// ──────────────────────────────────────────────
// usePCCData  (convenience composite hook)
// ──────────────────────────────────────────────

export function usePCCData(residentId: string): {
  patient: PatientInfo | null
  logEntries: LogEntry[]
  medications: Medication[]
  events: CalendarEvent[]
  wellnessDays: WellnessDay[]
  loading: boolean
  error: string | null
} {
  const { patient, loading: l1, error: e1 } = usePCCPatient(residentId)
  const { logEntries, loading: l2, error: e2 } = usePCCLogEntries(residentId)
  const { medications, loading: l3, error: e3 } = usePCCMedications(residentId)
  const { events, loading: l4, error: e4 } = usePCCEvents(residentId)
  const { wellnessDays, loading: l5, error: e5 } = usePCCWellnessDays(residentId)

  const loading = l1 || l2 || l3 || l4 || l5
  const error = e1 ?? e2 ?? e3 ?? e4 ?? e5 ?? null

  return { patient, logEntries, medications, events, wellnessDays, loading, error }
}

// ──────────────────────────────────────────────
// usePCCResidentId
// ──────────────────────────────────────────────

const VALID_PCC_RESIDENT_IDS = new Set([
  'pcc-r-001',
  'pcc-r-002',
  'pcc-r-003',
  'pcc-r-004',
  'pcc-r-005',
])

export function usePCCResidentId(): string {
  const [residentId, setResidentId] = useState('pcc-r-001')

  useEffect(() => {
    const stored = localStorage.getItem('selectedPCCResident')
    if (stored && VALID_PCC_RESIDENT_IDS.has(stored)) setResidentId(stored)
  }, [])

  return residentId
}
