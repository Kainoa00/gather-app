import { UserRole, LogEntryCategory, EventType, NotificationType, DocumentCategory } from '@/types'

// ── Exact vitals (BP 122/74, HR 68) vs status-only (Normal, Stable) ──
export function canViewExactVitals(role: UserRole): boolean {
  return role === 'primary' || role === 'nurse'
}

// ── Medications (names, doses, prescribers) ──
export function canViewMedications(role: UserRole): boolean {
  return role === 'primary' || role === 'nurse'
}

// ── Insurance cards (member IDs, group numbers) ──
export function canViewInsurance(role: UserRole): boolean {
  return role === 'primary'
}

// ── Incident reports: full detail (description, action taken) ──
export function canViewIncidentDetails(role: UserRole): boolean {
  return role === 'primary' || role === 'nurse'
}

// ── Incident reports: title + severity only ──
export function canViewIncidentSummary(role: UserRole): boolean {
  return role === 'admin'
}

// ── Provider contacts (doctors, therapists) ──
export function canViewProviders(role: UserRole): boolean {
  return role === 'primary' || role === 'nurse'
}

// ── Mood details: pain level, clinical notes ──
export function canViewMoodDetails(role: UserRole): boolean {
  return role === 'primary' || role === 'nurse'
}

// ── Create new log entries (nurse only) ──
export function canCreateLogEntries(role: UserRole): boolean {
  return role === 'nurse'
}

// ── QuickActions panel (nurse only) ──
export function canUseQuickActions(role: UserRole): boolean {
  return role === 'nurse'
}

// ── Add Care Circle members ──
export function canAddCareCircleMembers(role: UserRole): boolean {
  return role === 'primary' || role === 'admin'
}

// ── Upload documents to Vault ──
export function canUploadDocuments(role: UserRole): boolean {
  return role === 'primary'
}

// ── Visible log categories per role ──
export function getVisibleLogCategories(role: UserRole): LogEntryCategory[] {
  switch (role) {
    case 'primary':
    case 'nurse':
      return ['vitals', 'medication', 'activity', 'mood', 'incident']
    case 'admin':
      return ['mood', 'activity']
    case 'family':
      return ['mood', 'activity']
    default:
      return ['mood', 'activity']
  }
}

// ── Visible Vault tabs per role ──
export function getVisibleVaultTabs(role: UserRole): string[] {
  switch (role) {
    case 'primary':
      return ['facility', 'insurance', 'medications', 'providers', 'documents']
    case 'admin':
      return ['facility', 'documents']
    case 'nurse':
      return ['facility', 'medications', 'providers', 'documents']
    case 'family':
      return ['facility']
    default:
      return ['facility']
  }
}

// ── Visible document categories per role ──
export function getVisibleDocumentCategories(role: UserRole): DocumentCategory[] {
  switch (role) {
    case 'primary':
      return ['legal', 'medical', 'insurance', 'other']
    case 'admin':
      return ['legal']
    case 'nurse':
      return ['medical']
    case 'family':
      return []
    default:
      return []
  }
}

// ── Visible calendar event types per role ──
export function getVisibleCalendarEventTypes(role: UserRole): EventType[] {
  switch (role) {
    case 'primary':
    case 'admin':
    case 'nurse':
      return ['doctor_visit', 'therapy_session', 'facility_event', 'family_visit']
    case 'family':
      return ['facility_event', 'family_visit']
    default:
      return ['facility_event', 'family_visit']
  }
}

// ── Visible notification types per role ──
export function getVisibleNotificationTypes(role: UserRole): NotificationType[] {
  switch (role) {
    case 'primary':
    case 'nurse':
      return ['vitals', 'medication', 'mood', 'incident', 'visit', 'document', 'general']
    case 'admin':
      return ['visit', 'document', 'general']
    case 'family':
      return ['mood', 'visit', 'general']
    default:
      return ['general']
  }
}
