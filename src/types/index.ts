export type UserRole = 'admin' | 'team' | 'viewer'

export interface CareCircleMember {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatar?: string
  joinedAt: Date
}

export type EventType = 'doctor_visit' | 'medication_refill' | 'social_activity' | 'family_visit'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  date: Date
  time?: string
  location?: string
  claimedBy?: string
  claimedByName?: string
  createdBy: string
  createdAt: Date
}

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

export interface AccessCode {
  id: string
  label: string
  code: string
  type: 'wifi' | 'door' | 'alarm' | 'other'
}

export interface Vault {
  insuranceCards: InsuranceCard[]
  medications: Medication[]
  providers: ProviderContact[]
  accessCodes: AccessCode[]
}

export type IncidentSeverity = 'info' | 'warning' | 'urgent'

export interface Incident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  reportedBy: string
  reportedByName: string
  createdAt: Date
  tags?: string[]
}
