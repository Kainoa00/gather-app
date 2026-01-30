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
  reminder?: number // minutes before event (15, 30, 60, 1440)
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
  photos?: string[]
}

export interface NotificationPreferences {
  enabled: boolean
  defaultReminder: number // minutes before event
  emailNotifications: boolean
  pushNotifications: boolean
}

// Home Feed Types
export interface FeedPost {
  id: string
  authorId: string
  authorName: string
  authorInitials: string
  content: string
  media?: {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }[]
  location?: string
  taggedMembers?: string[]
  likes: string[] // array of user IDs who liked
  comments: FeedComment[]
  createdAt: Date
  isPinned?: boolean
  linkedGiftId?: string // if this post is about a gift
}

export interface FeedComment {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: Date
}

// Family Fun Types
export type GiftType = 'sports' | 'event' | 'dining' | 'giftcard' | 'other'

export interface FamilyGift {
  id: string
  type: GiftType
  title: string
  description?: string
  date?: Date
  time?: string
  location?: string
  details?: string // seat numbers, confirmation codes, etc.
  imageUrl?: string
  value?: number // for gift cards
  code?: string // gift card code
  sharedBy: string
  sharedByName: string
  forMembers: string[] // 'all' or specific member IDs
  rsvps: string[] // member IDs who are attending
  comments: FeedComment[]
  createdAt: Date
  isFeatured?: boolean
}
