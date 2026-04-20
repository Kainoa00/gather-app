/**
 * Agent Data Fetcher — Server-side queries for agent consumption.
 *
 * Uses the service role client (bypasses RLS) since agents operate
 * across patients in batch processing contexts (cron jobs, event triggers).
 *
 * Query patterns mirror src/lib/hooks/useSupabaseData.ts but are
 * server-side and return raw Supabase rows (not camelCase mapped).
 */

import { createServiceRoleClient } from '@/lib/supabase/server'

// -------------------------------------------
// Fetch patient info (PHI fields included — sanitize before sending to agent)
// -------------------------------------------

export async function fetchPatientById(patientId: string) {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('patients')
    .select('id, name, room_number, facility_name, primary_diagnosis')
    .eq('id', patientId)
    .single()

  if (error) {
    console.error(`[data-fetcher] Error fetching patient ${patientId}:`, error.message)
    return null
  }

  return data
}

// -------------------------------------------
// Fetch all active patient IDs
// -------------------------------------------

export async function fetchAllPatientIds(): Promise<string[]> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('patients')
    .select('id')

  if (error) {
    console.error('[data-fetcher] Error fetching patient IDs:', error.message)
    return []
  }

  return (data || []).map((p) => p.id)
}

// -------------------------------------------
// Fetch log entries with all sub-table joins
// -------------------------------------------

export async function fetchLogEntries(
  patientId: string,
  since: Date,
  until?: Date
) {
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('log_entries')
    .select(`
      id,
      category,
      title,
      notes,
      entered_by,
      entered_by_name,
      entered_by_role,
      created_at,
      vitals_data(*),
      medication_log_data(*),
      activity_log_data(*),
      mood_log_data(*),
      incident_log_data(*)
    `)
    .eq('patient_id', patientId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (until) {
    query = query.lte('created_at', until.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error(`[data-fetcher] Error fetching log entries for ${patientId}:`, error.message)
    return []
  }

  return data || []
}

// -------------------------------------------
// Fetch wellness days for trend analysis
// -------------------------------------------

export async function fetchWellnessDays(
  patientId: string,
  days: number = 7
) {
  const supabase = createServiceRoleClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('wellness_days')
    .select('*')
    .eq('patient_id', patientId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error(`[data-fetcher] Error fetching wellness days for ${patientId}:`, error.message)
    return []
  }

  return data || []
}

// -------------------------------------------
// Fetch primary family members for a patient (for email digest)
// -------------------------------------------

export async function fetchPrimaryMembers(patientId?: string) {
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('care_circle_members')
    .select('patient_id, name, email, role')
    .eq('role', 'primary')

  if (patientId) {
    query = query.eq('patient_id', patientId)
  }

  const { data, error } = await query

  if (error) {
    console.error('[data-fetcher] Error fetching primary members:', error.message)
    return []
  }

  return (data || []).filter(
    (m): m is typeof m & { email: string } => Boolean(m.email)
  )
}

// -------------------------------------------
// Fetch all care circle members for a patient
// -------------------------------------------

export async function fetchCareCircleMembers(patientId: string) {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('care_circle_members')
    .select('id, name, email, role, relationship')
    .eq('patient_id', patientId)

  if (error) {
    console.error(`[data-fetcher] Error fetching care circle for ${patientId}:`, error.message)
    return []
  }

  return data || []
}

// -------------------------------------------
// Fetch recent alerts (for debounce checking)
// -------------------------------------------

export async function fetchRecentAlerts(
  patientId: string,
  alertType: string,
  withinHours: number = 4
) {
  const supabase = createServiceRoleClient()
  const since = new Date()
  since.setHours(since.getHours() - withinHours)

  const { data, error } = await supabase
    .from('agent_alerts')
    .select('id, created_at')
    .eq('patient_id', patientId)
    .eq('alert_type', alertType)
    .gte('created_at', since.toISOString())
    .limit(1)

  if (error) {
    console.error(`[data-fetcher] Error checking recent alerts:`, error.message)
    return []
  }

  return data || []
}

// -------------------------------------------
// Build full patient context for agents
// -------------------------------------------

export async function fetchFullPatientContext(patientId: string) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [patient, logs, wellness] = await Promise.all([
    fetchPatientById(patientId),
    fetchLogEntries(patientId, twentyFourHoursAgo),
    fetchWellnessDays(patientId, 7),
  ])

  if (!patient) {
    return null
  }

  return {
    patient: {
      name: patient.name,
      roomNumber: patient.room_number,
      primaryDiagnosis: patient.primary_diagnosis,
    },
    logs,
    wellness,
  }
}
