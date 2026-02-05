export type UserRole = 'admin' | 'nurse' | 'family'

export interface CareCircleMember {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  relationship?: string // e.g., 'Daughter', 'Son', 'Nurse', 'CNA'
  avatar?: string
  joinedAt: Date
}

// Patient Info
export interface PatientInfo {
  name: string
  dateOfBirth: Date
  roomNumber: string
  facilityName: string
  facilityPhone: string
  facilityAddress: string
  admissionDate: Date
  primaryDiagnosis?: string
  photoUrl?: string
}

// Calendar
export type EventType = 'doctor_visit' | 'therapy_session' | 'facility_event' | 'family_visit'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  date: Date
  time?: string
  endTime?: string
  location?: string
  patientMood?: 'great' | 'good' | 'fair' | 'poor'
  visitWindow?: boolean // is this a suggested visit time?
  claimedBy?: string
  claimedByName?: string
  createdBy: string
  createdAt: Date
  reminder?: number
}

// Vault
export interface InsuranceCard {
  id: string
  name: string
  memberId: string
  groupNumber?: string
  frontImageUrl?: string
  backImageUrl?: string
  notes?: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  prescribedBy?: string
  startDate?: Date
  notes?: string
}

export interface ProviderContact {
  id: string
  name: string
  specialty: string
  phone: string
  address?: string
  notes?: string
}

export interface FacilityInfo {
  roomNumber: string
  floor: string
  wing: string
  facilityName: string
  facilityPhone: string
  facilityAddress: string
  nurseStation: string
  visitingHours: string
  wifiNetwork?: string
  wifiPassword?: string
  parkingInfo?: string
}

export interface Vault {
  insuranceCards: InsuranceCard[]
  medications: Medication[]
  providers: ProviderContact[]
  facilityInfo: FacilityInfo
  documents: VaultDocument[]
}

// Care Log (Star Feature)
export type LogEntryCategory = 'vitals' | 'medication' | 'activity' | 'mood' | 'incident'

export interface VitalsData {
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  temperature?: number
  oxygenSaturation?: number
  weight?: number
  respiratoryRate?: number
}

export interface MedicationLogData {
  medicationName: string
  dosage: string
  route?: string // oral, IV, injection, etc.
  administeredBy: string
}

export interface ActivityLogData {
  activityType: 'physical_therapy' | 'occupational_therapy' | 'meal' | 'social' | 'walk' | 'exercise' | 'other'
  description: string
  duration?: number // minutes
  participation?: 'active' | 'moderate' | 'minimal' | 'refused'
}

export interface MoodData {
  mood: 'happy' | 'content' | 'neutral' | 'anxious' | 'sad' | 'agitated'
  alertness: 'alert' | 'drowsy' | 'lethargic' | 'unresponsive'
  appetite: 'good' | 'fair' | 'poor' | 'refused'
  painLevel?: number // 0-10
  notes?: string
}

export interface IncidentLogData {
  incidentType: 'fall' | 'behavior_change' | 'condition_change' | 'complaint' | 'other'
  severity: 'low' | 'moderate' | 'high'
  description: string
  actionTaken: string
  physicianNotified?: boolean
  familyNotified?: boolean
}

export interface LogEntry {
  id: string
  category: LogEntryCategory
  title: string
  notes?: string
  enteredBy: string
  enteredByName: string
  enteredByRole: UserRole
  createdAt: Date
  photos?: string[]
  // Category-specific data
  vitals?: VitalsData
  medicationLog?: MedicationLogData
  activityLog?: ActivityLogData
  moodLog?: MoodData
  incidentLog?: IncidentLogData
  // Family comments
  comments: LogComment[]
}

export interface LogComment {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: Date
}

// Home Feed
export interface FeedPost {
  id: string
  authorId: string
  authorName: string
  authorInitials: string
  authorRole: UserRole
  content: string
  postType: 'visit_recap' | 'facility_moment' | 'activity_photo' | 'milestone' | 'general'
  media?: {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }[]
  location?: string
  taggedMembers?: string[]
  likes: string[]
  comments: FeedComment[]
  createdAt: Date
  isPinned?: boolean
}

export interface FeedComment {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: Date
}

export interface NotificationPreferences {
  enabled: boolean
  defaultReminder: number
  emailNotifications: boolean
  pushNotifications: boolean
}

// Visit Check-in/Check-out
export interface Visit {
  id: string
  visitorId: string
  visitorName: string
  visitorRelationship?: string
  checkInTime: Date
  checkOutTime?: Date // null = currently visiting
  duration?: number // minutes, computed on check-out
  mood?: 'great' | 'good' | 'ok' | 'tough' | 'hard'
  note?: string
}

// Notification Center
export type NotificationType = 'vitals' | 'medication' | 'mood' | 'incident' | 'visit' | 'document' | 'general'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  sourceId?: string // ID of the log entry, event, or visit that triggered it
  sourceType?: 'log_entry' | 'event' | 'visit' | 'document'
  createdAt: Date
  readAt?: Date // null = unread
  readBy: string[] // user IDs who have read this
}

// Document Uploads (Vault)
export type DocumentCategory = 'legal' | 'medical' | 'insurance' | 'other'

export interface VaultDocument {
  id: string
  name: string
  category: DocumentCategory
  fileUrl?: string
  fileType?: string // 'pdf', 'jpg', 'png'
  fileSize?: number // bytes
  uploadedBy: string
  uploadedByName: string
  uploadedAt: Date
  notes?: string
}

// Quick Actions for Nurses
export type QuickActionType = 'vitals_check' | 'meds_given' | 'meal_update' | 'mood_check' | 'walk_completed' | 'resting' | 'pt_session' | 'bathed_groomed'

export interface QuickAction {
  id: QuickActionType
  label: string
  sublabel: string
  icon: string // emoji
  category: LogEntryCategory
}

// Daily Digest
export interface DailyDigest {
  date: Date
  overallRating: number // 1-10
  summary: string // auto-generated
  morningEntries: LogEntry[]
  afternoonEntries: LogEntry[]
  eveningEntries: LogEntry[]
  stats: {
    vitalsCount: number
    vitalsNormal: boolean
    medsCount: number
    medsOnTime: boolean
    mealsCount: number
    mealsQuality: 'good' | 'fair' | 'poor'
    visitsCount: number
    visitNames: string[]
  }
}

// Wellness/Mood Trends
export interface WellnessDay {
  date: Date
  overallScore: number // 1-10
  moodAM?: MoodData['mood']
  moodPM?: MoodData['mood']
  appetite?: MoodData['appetite']
  painLevel?: number
  socialEngagement?: 'active' | 'moderate' | 'minimal'
  therapySessions?: number
  visitCount?: number
}

export interface WellnessTrend {
  period: '7d' | '30d' | '90d'
  days: WellnessDay[]
  averageScore: number
  previousAverageScore: number
  moodDistribution: Record<string, number>
  dominantMood: string
  trajectory: 'improving' | 'stable' | 'declining'
}
