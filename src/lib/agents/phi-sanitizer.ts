/**
 * PHI Sanitizer — Minimizes Protected Health Information before sending to AI agents.
 *
 * HIPAA §164.502(b) - Minimum Necessary Standard:
 * Only the minimum amount of PHI necessary for the agent's purpose is included.
 *
 * STRIPS:   DOB, SSN, insurance IDs, full addresses, phone numbers, email addresses,
 *           last names (uses first name only), facility-specific identifiers
 *
 * RETAINS:  First name, room number, primary diagnosis, clinical data (vitals, meds,
 *           mood, activities, incidents), timestamps, wellness trends
 */

import type { SanitizedPatientContext, SanitizedLogEntry, SanitizedWellnessDay } from './types'

interface RawPatientData {
  name: string
  roomNumber: string
  primaryDiagnosis?: string
}

interface RawLogEntry {
  category: string
  title: string
  notes?: string
  created_at: string
  entered_by_role?: string
  vitals_data?: Array<{
    blood_pressure_systolic?: number
    blood_pressure_diastolic?: number
    heart_rate?: number
    temperature?: number
    oxygen_saturation?: number
    weight?: number
    respiratory_rate?: number
  }>
  medication_log_data?: Array<{
    medication_name?: string
    dosage?: string
    route?: string
  }>
  activity_log_data?: Array<{
    activity_type?: string
    description?: string
    duration?: number
    participation?: string
  }>
  mood_log_data?: Array<{
    mood?: string
    alertness?: string
    appetite?: string
    pain_level?: number
    notes?: string
  }>
  incident_log_data?: Array<{
    incident_type?: string
    severity?: string
    description?: string
    action_taken?: string
  }>
}

interface RawWellnessDay {
  date: string
  overall_score: number
  mood_am?: string
  mood_pm?: string
  appetite?: string
  pain_level?: number
  social_engagement?: string
  therapy_sessions?: number
  visit_count?: number
}

/**
 * Extract first name only from a full name.
 * "John Smith" -> "John", "Mary Jane Doe" -> "Mary"
 */
function extractFirstName(fullName: string): string {
  return fullName.split(' ')[0] || 'Patient'
}

/**
 * Sanitize a single log entry, retaining only clinically relevant data.
 */
function sanitizeLogEntry(entry: RawLogEntry): SanitizedLogEntry {
  const sanitized: SanitizedLogEntry = {
    category: entry.category,
    title: entry.title,
    notes: entry.notes || undefined,
    createdAt: entry.created_at,
    enteredByRole: entry.entered_by_role || 'unknown',
  }

  // Attach category-specific data (only first record from each sub-table)
  if (entry.vitals_data?.[0]) {
    const v = entry.vitals_data[0]
    sanitized.vitals = {
      bloodPressureSystolic: v.blood_pressure_systolic ?? undefined,
      bloodPressureDiastolic: v.blood_pressure_diastolic ?? undefined,
      heartRate: v.heart_rate ?? undefined,
      temperature: v.temperature ?? undefined,
      oxygenSaturation: v.oxygen_saturation ?? undefined,
      weight: v.weight ?? undefined,
      respiratoryRate: v.respiratory_rate ?? undefined,
    }
  }

  if (entry.medication_log_data?.[0]) {
    const m = entry.medication_log_data[0]
    sanitized.medication = {
      medicationName: m.medication_name || '',
      dosage: m.dosage || '',
      route: m.route ?? undefined,
    }
  }

  if (entry.activity_log_data?.[0]) {
    const a = entry.activity_log_data[0]
    sanitized.activity = {
      activityType: a.activity_type || '',
      description: a.description || '',
      duration: a.duration ?? undefined,
      participation: a.participation ?? undefined,
    }
  }

  if (entry.mood_log_data?.[0]) {
    const md = entry.mood_log_data[0]
    sanitized.mood = {
      mood: md.mood || '',
      alertness: md.alertness || '',
      appetite: md.appetite || '',
      painLevel: md.pain_level ?? undefined,
      notes: md.notes ?? undefined,
    }
  }

  if (entry.incident_log_data?.[0]) {
    const inc = entry.incident_log_data[0]
    sanitized.incident = {
      incidentType: inc.incident_type || '',
      severity: inc.severity || '',
      description: inc.description || '',
      actionTaken: inc.action_taken || '',
    }
  }

  return sanitized
}

/**
 * Sanitize wellness day data.
 */
function sanitizeWellnessDay(day: RawWellnessDay): SanitizedWellnessDay {
  return {
    date: day.date,
    overallScore: day.overall_score,
    moodAM: day.mood_am ?? undefined,
    moodPM: day.mood_pm ?? undefined,
    appetite: day.appetite ?? undefined,
    painLevel: day.pain_level ?? undefined,
    socialEngagement: day.social_engagement ?? undefined,
    therapySessions: day.therapy_sessions ?? undefined,
    visitCount: day.visit_count ?? undefined,
  }
}

/**
 * Build a PHI-minimized patient context for agent consumption.
 *
 * @param patient  Raw patient record from Supabase
 * @param logs     Raw log entries with sub-table joins
 * @param wellness Raw wellness_days records
 * @returns        SanitizedPatientContext safe for agent prompts
 */
export function sanitizePatientContext(
  patient: RawPatientData,
  logs: RawLogEntry[],
  wellness: RawWellnessDay[]
): SanitizedPatientContext {
  return {
    firstName: extractFirstName(patient.name),
    roomNumber: patient.roomNumber,
    primaryDiagnosis: patient.primaryDiagnosis,
    recentLogs: logs.map(sanitizeLogEntry),
    wellnessTrend: wellness.map(sanitizeWellnessDay),
  }
}

/**
 * Validate that a sanitized context contains no obviously leaked PHI.
 * Returns a list of warnings if potential PHI is detected.
 */
export function validateSanitization(context: SanitizedPatientContext): string[] {
  const warnings: string[] = []

  // Check for patterns that look like SSN, phone, email
  const contextStr = JSON.stringify(context)

  if (/\d{3}-\d{2}-\d{4}/.test(contextStr)) {
    warnings.push('Possible SSN pattern detected in sanitized context')
  }
  if (/\(\d{3}\)\s?\d{3}-\d{4}/.test(contextStr) || /\d{3}-\d{3}-\d{4}/.test(contextStr)) {
    warnings.push('Possible phone number detected in sanitized context')
  }
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(contextStr)) {
    warnings.push('Possible email address detected in sanitized context')
  }
  if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(contextStr)) {
    warnings.push('Possible date of birth pattern detected in sanitized context')
  }

  return warnings
}
