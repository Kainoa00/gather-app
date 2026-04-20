import type {
  PatientInfo,
  LogEntry,
  Medication,
  CalendarEvent,
  UserRole,
  EventType,
  MoodData,
} from '@/types'

import type {
  PCCResident,
  PCCVitals,
  PCCAssessment,
  PCCMood,
  PCCIncident,
  PCCIncidentType,
  PCCIncidentSeverity,
  PCCMedicationAdministration,
  PCCMedicationOrder,
  PCCProgressNote,
  PCCProgressNoteAuthorRole,
  PCCProgressNoteType,
  PCCAppointment,
  PCCAppointmentType,
} from './types'

// ──────────────────────────────────────────────
// Staff lookup tables (demo / seed data)
// ──────────────────────────────────────────────

const STAFF_NAMES: Record<string, string> = {
  'staff-001': 'Sarah Mitchell',
  'staff-002': 'James Torres',
  'staff-003': 'Linda Park',
}

const STAFF_ROLES: Record<string, UserRole> = {
  'staff-001': 'nurse',
  'staff-002': 'nurse',
  'staff-003': 'nurse',
}

function resolveStaffName(staffId: string): string {
  return STAFF_NAMES[staffId] ?? staffId
}

function resolveStaffRole(staffId: string): UserRole {
  return STAFF_ROLES[staffId] ?? 'nurse'
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const h = d.getHours()
  const m = d.getMinutes()
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  const minute = m.toString().padStart(2, '0')
  return `${hour}:${minute} ${period}`
}

// ──────────────────────────────────────────────
// Resident → PatientInfo
// ──────────────────────────────────────────────

export function pccResidentToPatient(r: PCCResident): PatientInfo {
  return {
    name: `${r.firstName} ${r.lastName}`,
    dateOfBirth: new Date(r.dateOfBirth),
    roomNumber: r.roomNumber ?? 'Unknown',
    admissionDate: new Date(r.admissionDate),
    primaryDiagnosis: r.primaryDiagnosis ?? undefined,
    photoUrl: r.photoUrl ?? undefined,
    // facility fields are not on PCCResident; fetched separately
    facilityName: '',
    facilityPhone: '',
    facilityAddress: '',
  }
}

// ──────────────────────────────────────────────
// Vitals → LogEntry
// ──────────────────────────────────────────────

function vitalsTimeOfDay(isoString: string): string {
  const hour = new Date(isoString).getHours()
  if (hour < 12) return 'Morning Vitals Check'
  if (hour < 17) return 'Afternoon Vitals Check'
  return 'Evening Vitals Check'
}

export function pccVitalsToLogEntry(v: PCCVitals): LogEntry {
  return {
    category: 'vitals',
    id: v.vitalsId,
    title: vitalsTimeOfDay(v.recordedAt),
    enteredBy: v.recordedBy,
    enteredByName: resolveStaffName(v.recordedBy),
    enteredByRole: resolveStaffRole(v.recordedBy),
    createdAt: new Date(v.recordedAt),
    vitals: {
      bloodPressureSystolic: v.bloodPressureSystolic ?? undefined,
      bloodPressureDiastolic: v.bloodPressureDiastolic ?? undefined,
      heartRate: v.heartRate ?? undefined,
      temperature: v.temperatureFahrenheit ?? undefined,
      oxygenSaturation: v.oxygenSaturation ?? undefined,
      weight: v.weight ?? undefined,
      respiratoryRate: v.respiratoryRate ?? undefined,
    },
    notes: v.notes ?? undefined,
    comments: [],
  }
}

// ──────────────────────────────────────────────
// Assessment → LogEntry (mood)
// ──────────────────────────────────────────────

function mapPCCMoodToCareBridge(mood: PCCMood | null): MoodData['mood'] {
  switch (mood) {
    case 'content':   return 'content'
    case 'euphoric':  return 'happy'
    case 'sad':       return 'sad'
    case 'anxious':   return 'anxious'
    case 'agitated':  return 'agitated'
    case 'withdrawn': return 'neutral'
    default:          return 'neutral'
  }
}

export function pccAssessmentToLogEntries(a: PCCAssessment): LogEntry[] {
  const entry: LogEntry = {
    category: 'mood',
    id: a.assessmentId,
    title: 'Wellness Assessment',
    enteredBy: a.assessedBy,
    enteredByName: resolveStaffName(a.assessedBy),
    enteredByRole: resolveStaffRole(a.assessedBy),
    createdAt: new Date(a.assessedAt),
    moodLog: {
      mood: mapPCCMoodToCareBridge(a.mood),
      alertness: a.alertness ?? 'alert',
      appetite: a.appetite ?? 'fair',
      // PCC assessments track pain in vitals, not assessments
      painLevel: undefined,
      notes: a.notes ?? undefined,
    },
    comments: [],
  }
  return [entry]
}

// ──────────────────────────────────────────────
// Incident → LogEntry
// ──────────────────────────────────────────────

function mapPCCIncidentType(t: PCCIncidentType): 'fall' | 'behavior_change' | 'condition_change' | 'complaint' | 'other' {
  switch (t) {
    case 'fall':             return 'fall'
    case 'behavior':         return 'behavior_change'
    case 'medication_error': return 'other'
    case 'injury':           return 'other'
    case 'elopement':        return 'other'
    default:                 return 'other'
  }
}

function mapPCCSeverity(s: PCCIncidentSeverity): 'low' | 'moderate' | 'high' {
  switch (s) {
    case 'minor':    return 'low'
    case 'moderate': return 'moderate'
    case 'major':    return 'high'
    case 'critical': return 'high'
  }
}

function formatIncidentTitle(t: PCCIncidentType): string {
  switch (t) {
    case 'fall':             return 'Fall Incident'
    case 'medication_error': return 'Medication Error'
    case 'behavior':         return 'Behavioral Incident'
    case 'injury':           return 'Injury Reported'
    case 'elopement':        return 'Elopement Attempt'
    default:                 return 'Incident Report'
  }
}

export function pccIncidentToLogEntry(i: PCCIncident): LogEntry {
  return {
    category: 'incident',
    id: i.incidentId,
    title: formatIncidentTitle(i.incidentType),
    enteredBy: i.reportedBy,
    enteredByName: resolveStaffName(i.reportedBy),
    enteredByRole: resolveStaffRole(i.reportedBy),
    createdAt: new Date(i.occurredAt),
    incidentLog: {
      incidentType: mapPCCIncidentType(i.incidentType),
      severity: mapPCCSeverity(i.severity),
      description: i.description,
      actionTaken: i.interventionsTaken ?? 'See full incident report.',
      physicianNotified: false,
      familyNotified: i.familyNotified,
    },
    notes: undefined,
    comments: [],
  }
}

// ──────────────────────────────────────────────
// Medication administration → LogEntry
// ──────────────────────────────────────────────

function formatMedStatus(status: PCCMedicationAdministration['status']): string {
  switch (status) {
    case 'refused':  return 'Refused'
    case 'held':     return 'Held'
    case 'missed':   return 'Missed'
    case 'not_due':  return 'Not Due'
    case 'given':    return 'Given'
  }
}

function formatMedRoute(route: PCCMedicationOrder['route']): string {
  switch (route) {
    case 'oral':       return 'Oral'
    case 'iv':         return 'IV'
    case 'im':         return 'IM'
    case 'topical':    return 'Topical'
    case 'sublingual': return 'Sublingual'
    case 'inhaled':    return 'Inhaled'
    default:           return 'Other'
  }
}

export function pccMedicationAdminToLogEntry(
  a: PCCMedicationAdministration,
  order: PCCMedicationOrder,
): LogEntry {
  const staffId = a.administeredBy ?? 'staff-001'
  return {
    category: 'medication',
    id: a.administrationId,
    title: a.status === 'given'
      ? 'Medication Administered'
      : `Medication ${formatMedStatus(a.status)}`,
    enteredBy: staffId,
    enteredByName: resolveStaffName(staffId),
    enteredByRole: resolveStaffRole(staffId),
    createdAt: new Date(a.administeredTime ?? a.scheduledTime),
    medicationLog: {
      medicationName: `${order.medicationName} ${order.dosage}`,
      dosage: order.dosage,
      route: a.status === 'given' ? formatMedRoute(order.route) : undefined,
      administeredBy: resolveStaffName(staffId),
    },
    notes: a.notes ?? undefined,
    comments: [],
  }
}

// ──────────────────────────────────────────────
// Progress note → LogEntry
// ──────────────────────────────────────────────

function formatNoteTitle(t: PCCProgressNoteType): string {
  switch (t) {
    case 'shift_note':           return 'Shift Note'
    case 'assessment':           return 'Clinical Assessment'
    case 'incident':             return 'Incident Note'
    case 'behavior':             return 'Behavioral Note'
    case 'family_communication': return 'Family Communication'
    default:                     return 'Progress Note'
  }
}

function mapAuthorRole(role: PCCProgressNoteAuthorRole): UserRole {
  switch (role) {
    case 'rn':
    case 'lpn':
    case 'cna':
    case 'social_worker':
    case 'activities':
    case 'other':
      return 'nurse'
    case 'physician':
      // physicians map to admin — closest available role without a dedicated doctor role
      return 'admin'
  }
}

export function pccProgressNoteToLogEntry(n: PCCProgressNote): LogEntry {
  return {
    category: 'activity',
    id: n.noteId,
    title: formatNoteTitle(n.noteType),
    enteredBy: n.authoredBy,
    enteredByName: resolveStaffName(n.authoredBy),
    enteredByRole: mapAuthorRole(n.authorRole),
    createdAt: new Date(n.authoredAt),
    notes: n.content,
    activityLog: {
      activityType: 'other',
      description: n.content.slice(0, 200),
      duration: undefined,
      participation: undefined,
    },
    comments: [],
  }
}

// ──────────────────────────────────────────────
// Medication order → Medication
// ──────────────────────────────────────────────

export function pccMedicationOrderToMedication(m: PCCMedicationOrder): Medication {
  const noteParts = [
    m.indication,
    m.isPRN ? 'PRN (as needed)' : null,
    !m.isActive ? 'Discontinued' : null,
  ].filter(Boolean) as string[]

  return {
    id: m.orderId,
    name: m.medicationName,
    dosage: m.dosage,
    frequency: m.frequency,
    prescribedBy: m.prescriber,
    startDate: new Date(m.startDate),
    notes: noteParts.length > 0 ? noteParts.join('. ') : undefined,
  }
}

// ──────────────────────────────────────────────
// Appointment → CalendarEvent
// ──────────────────────────────────────────────

function mapAppointmentType(t: PCCAppointmentType): EventType {
  switch (t) {
    case 'physician':       return 'doctor_visit'
    case 'therapy':         return 'therapy_session'
    case 'specialist':      return 'doctor_visit'
    case 'facility_event':  return 'facility_event'
    case 'family_visit':    return 'family_visit'
    default:                return 'doctor_visit'
  }
}

export function pccAppointmentToCalendarEvent(a: PCCAppointment): CalendarEvent {
  return {
    id: a.appointmentId,
    title: a.title,
    description: a.notes ?? undefined,
    type: mapAppointmentType(a.appointmentType),
    date: new Date(a.scheduledStart),
    time: formatTime(a.scheduledStart),
    endTime: formatTime(a.scheduledEnd),
    location: a.location ?? undefined,
    createdBy: 'pcc-import',
    createdAt: new Date(a.scheduledStart),
  }
}
