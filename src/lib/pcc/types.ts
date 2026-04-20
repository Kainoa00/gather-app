// ──────────────────────────────────────────────
// Resident
// ──────────────────────────────────────────────

export interface PCCResident {
  residentId: string;
  facilityId: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  roomNumber: string | null;
  unit: string | null;
  admissionDate: string;
  status: 'current' | 'discharged' | 'deceased' | 'on_leave';
  primaryDiagnosis: string | null;
  photoUrl: string | null;
}

// ──────────────────────────────────────────────
// Vitals
// ──────────────────────────────────────────────

export interface PCCVitals {
  vitalsId: string;
  residentId: string;
  recordedAt: string;
  recordedBy: string;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperatureFahrenheit: number | null;
  oxygenSaturation: number | null;
  bloodGlucose: number | null;
  weight: number | null;
  painScore: number | null;
  notes: string | null;
}

// ──────────────────────────────────────────────
// Medications
// ──────────────────────────────────────────────

export type PCCMedicationRoute =
  | 'oral'
  | 'iv'
  | 'im'
  | 'topical'
  | 'sublingual'
  | 'inhaled'
  | 'other';

export interface PCCMedicationOrder {
  orderId: string;
  residentId: string;
  medicationName: string;
  genericName: string | null;
  dosage: string;
  route: PCCMedicationRoute;
  frequency: string;
  startDate: string;
  endDate: string | null;
  prescriber: string;
  indication: string | null;
  isPRN: boolean;
  isActive: boolean;
}

export type PCCMedicationAdministrationStatus =
  | 'given'
  | 'refused'
  | 'held'
  | 'missed'
  | 'not_due';

export interface PCCMedicationAdministration {
  administrationId: string;
  orderId: string;
  residentId: string;
  scheduledTime: string;
  administeredTime: string | null;
  administeredBy: string | null;
  status: PCCMedicationAdministrationStatus;
  notes: string | null;
}

// ──────────────────────────────────────────────
// Clinical Documentation
// ──────────────────────────────────────────────

export type PCCProgressNoteAuthorRole =
  | 'rn'
  | 'lpn'
  | 'cna'
  | 'physician'
  | 'social_worker'
  | 'activities'
  | 'other';

export type PCCProgressNoteType =
  | 'shift_note'
  | 'assessment'
  | 'incident'
  | 'behavior'
  | 'family_communication'
  | 'general';

export interface PCCProgressNote {
  noteId: string;
  residentId: string;
  authoredAt: string;
  authoredBy: string;
  authorRole: PCCProgressNoteAuthorRole;
  noteType: PCCProgressNoteType;
  content: string;
  tags: string[];
}

export type PCCIncidentType =
  | 'fall'
  | 'medication_error'
  | 'behavior'
  | 'injury'
  | 'elopement'
  | 'other';

export type PCCIncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export interface PCCIncident {
  incidentId: string;
  residentId: string;
  occurredAt: string;
  reportedBy: string;
  incidentType: PCCIncidentType;
  severity: PCCIncidentSeverity;
  description: string;
  interventionsTaken: string | null;
  familyNotified: boolean;
  familyNotifiedAt: string | null;
}

// ──────────────────────────────────────────────
// Assessments
// ──────────────────────────────────────────────

export type PCCMood =
  | 'content'
  | 'sad'
  | 'anxious'
  | 'agitated'
  | 'withdrawn'
  | 'euphoric';

export type PCCAlertness = 'alert' | 'drowsy' | 'lethargic' | 'unresponsive';

export type PCCAppetite = 'good' | 'fair' | 'poor' | 'refused';

export type PCCSleepQuality = 'good' | 'fair' | 'poor';

export interface PCCAssessment {
  assessmentId: string;
  residentId: string;
  assessedAt: string;
  assessedBy: string;
  mood: PCCMood | null;
  alertness: PCCAlertness | null;
  appetite: PCCAppetite | null;
  intakePercentage: number | null;
  sleepQuality: PCCSleepQuality | null;
  notes: string | null;
}

// ──────────────────────────────────────────────
// Scheduling
// ──────────────────────────────────────────────

export type PCCAppointmentType =
  | 'physician'
  | 'therapy'
  | 'specialist'
  | 'facility_event'
  | 'family_visit'
  | 'other';

export type PCCAppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface PCCAppointment {
  appointmentId: string;
  residentId: string;
  scheduledStart: string;
  scheduledEnd: string;
  appointmentType: PCCAppointmentType;
  title: string;
  location: string | null;
  provider: string | null;
  notes: string | null;
  status: PCCAppointmentStatus;
}

// ──────────────────────────────────────────────
// API Envelope
// ──────────────────────────────────────────────

export interface PCCPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

export interface PCCListResponse<T> {
  data: T[];
  pagination: PCCPagination;
  syncedAt: string;
}

export interface PCCAuthConfig {
  facilityId: string;
  clientId: string;
  clientSecret: string;
  accessToken: string | null;
  tokenExpiresAt: string | null;
}
