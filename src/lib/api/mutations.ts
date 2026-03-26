import { DEMO_PATIENT_ID } from '@/lib/supabase'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

// Use the SSR-aware browser client so auth cookies (JWT) are sent,
// allowing RLS policies to work correctly.
function getClient() {
  return getSupabaseBrowserClient()
}
import { notifyFamilyMembers } from '@/lib/notifications'
import {
  CareCircleMember,
  CalendarEvent,
  LogEntry,
  FeedPost,
  Visit,
  Notification,
} from '@/types'

// ==========================================
// Care Circle Members
// ==========================================

export async function addMemberToDb(
  member: Omit<CareCircleMember, 'id' | 'joinedAt'>,
  patientId: string = DEMO_PATIENT_ID
) {
  const { data, error } = await getClient()
    .from('care_circle_members')
    .insert({
      patient_id: patientId,
      name: member.name,
      email: member.email,
      phone: member.phone || null,
      role: member.role,
      relationship: member.relationship || null,
      avatar: member.avatar || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// Calendar Events
// ==========================================

export async function addEventToDb(
  event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>,
  createdBy: string,
  patientId: string = DEMO_PATIENT_ID
) {
  const { data, error } = await getClient()
    .from('calendar_events')
    .insert({
      patient_id: patientId,
      title: event.title,
      description: event.description || null,
      type: event.type,
      date: event.date instanceof Date ? event.date.toISOString().split('T')[0] : String(event.date),
      time: event.time || null,
      end_time: event.endTime || null,
      location: event.location || null,
      patient_mood: event.patientMood || null,
      visit_window: event.visitWindow || false,
      created_by: createdBy,
      reminder: event.reminder || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function claimEventInDb(
  eventId: string,
  claimedBy: string,
  claimedByName: string
) {
  const { data, error } = await getClient()
    .from('calendar_events')
    .update({
      claimed_by: claimedBy,
      claimed_by_name: claimedByName,
    })
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// Log Entries
// ==========================================

export async function addLogEntryToDb(
  entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'>,
  patientId: string = DEMO_PATIENT_ID
): Promise<{ id: string }> {
  // Insert main log entry
  const { data: logData, error: logError } = await getClient()
    .from('log_entries')
    .insert({
      patient_id: patientId,
      category: entry.category,
      title: entry.title,
      notes: entry.notes || null,
      entered_by: entry.enteredBy,
      entered_by_name: entry.enteredByName,
      entered_by_role: entry.enteredByRole,
      photos: entry.photos || [],
    })
    .select('id')
    .single()

  if (logError || !logData) throw logError || new Error('Failed to insert log entry')

  // Notify family members (non-blocking)
  Promise.resolve(
    getClient()
      .from('care_circle_members')
      .select('name, email, role')
      .eq('patient_id', patientId)
      .in('role', ['primary', 'family'])
  )
    .then(({ data: members }) => {
      if (members && members.length > 0) {
        const notificationMessage = `${entry.category}: ${entry.title}${entry.notes ? ` \u2014 ${entry.notes.slice(0, 200)}` : ''}`
        notifyFamilyMembers({
          patientId,
          patientName: 'your loved one',
          notificationType: entry.category,
          message: notificationMessage,
          senderName: entry.enteredByName,
          recipients: members
            .filter((m): m is typeof m & { email: string } => Boolean(m.email))
            .map((m) => ({ email: m.email, name: m.name })),
        }).catch(console.error)
      }
    })
    .catch(console.error)

  // Insert category-specific data
  if (entry.category === 'vitals' && entry.vitals) {
    await getClient().from('vitals_data').insert({
      log_entry_id: logData.id,
      blood_pressure_systolic: entry.vitals.bloodPressureSystolic ?? null,
      blood_pressure_diastolic: entry.vitals.bloodPressureDiastolic ?? null,
      heart_rate: entry.vitals.heartRate ?? null,
      temperature: entry.vitals.temperature ?? null,
      oxygen_saturation: entry.vitals.oxygenSaturation ?? null,
      weight: entry.vitals.weight ?? null,
      respiratory_rate: entry.vitals.respiratoryRate ?? null,
    })
  }

  if (entry.category === 'medication' && entry.medicationLog) {
    await getClient().from('medication_log_data').insert({
      log_entry_id: logData.id,
      medication_name: entry.medicationLog.medicationName,
      dosage: entry.medicationLog.dosage,
      route: entry.medicationLog.route || null,
      administered_by: entry.medicationLog.administeredBy,
    })
  }

  if (entry.category === 'activity' && entry.activityLog) {
    await getClient().from('activity_log_data').insert({
      log_entry_id: logData.id,
      activity_type: entry.activityLog.activityType,
      description: entry.activityLog.description,
      duration: entry.activityLog.duration || null,
      participation: entry.activityLog.participation || null,
    })
  }

  if (entry.category === 'mood' && entry.moodLog) {
    await getClient().from('mood_log_data').insert({
      log_entry_id: logData.id,
      mood: entry.moodLog.mood,
      alertness: entry.moodLog.alertness,
      appetite: entry.moodLog.appetite,
      pain_level: entry.moodLog.painLevel ?? null,
      notes: entry.moodLog.notes || null,
    })
  }

  if (entry.category === 'incident' && entry.incidentLog) {
    await getClient().from('incident_log_data').insert({
      log_entry_id: logData.id,
      incident_type: entry.incidentLog.incidentType,
      severity: entry.incidentLog.severity,
      description: entry.incidentLog.description,
      action_taken: entry.incidentLog.actionTaken,
      physician_notified: entry.incidentLog.physicianNotified || false,
      family_notified: entry.incidentLog.familyNotified || false,
    })
  }

  return logData
}

export async function addLogCommentToDb(
  entryId: string,
  authorId: string,
  authorName: string,
  content: string
) {
  const { data, error } = await getClient()
    .from('log_comments')
    .insert({
      log_entry_id: entryId,
      author_id: authorId,
      author_name: authorName,
      content,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// Feed Posts
// ==========================================

export async function addPostToDb(
  post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments'>,
  patientId: string = DEMO_PATIENT_ID
) {
  const { data, error } = await getClient()
    .from('feed_posts')
    .insert({
      patient_id: patientId,
      author_id: post.authorId,
      author_name: post.authorName,
      author_initials: post.authorInitials,
      author_role: post.authorRole,
      content: post.content,
      post_type: post.postType,
      media: (post.media as any) || [],
      location: post.location || null,
      tagged_members: post.taggedMembers || [],
      is_pinned: post.isPinned || false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function likePostInDb(postId: string, userId: string) {
  // Atomic toggle via RPC — prevents race conditions
  const { error } = await getClient().rpc('toggle_like', {
    p_post_id: postId,
    p_user_id: userId,
  })

  if (error) throw error
}

export async function addPostCommentToDb(
  postId: string,
  authorId: string,
  authorName: string,
  content: string
) {
  const { data, error } = await getClient()
    .from('feed_comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      author_name: authorName,
      content,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// Visits
// ==========================================

export async function checkInToDb(
  visitorId: string,
  visitorName: string,
  visitorRelationship: string | undefined,
  patientId: string = DEMO_PATIENT_ID
) {
  const { data, error } = await getClient()
    .from('visits')
    .insert({
      patient_id: patientId,
      visitor_id: visitorId,
      visitor_name: visitorName,
      visitor_relationship: visitorRelationship || null,
      check_in_time: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function checkOutInDb(
  visitId: string,
  mood: string,
  note: string,
  duration: number
) {
  const { data, error } = await getClient()
    .from('visits')
    .update({
      check_out_time: new Date().toISOString(),
      duration,
      mood,
      note: note || null,
    })
    .eq('id', visitId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// Notifications
// ==========================================

export async function createNotificationInDb(
  notification: Omit<Notification, 'id' | 'createdAt' | 'readBy'>,
  patientId: string = DEMO_PATIENT_ID
) {
  const { data, error } = await getClient()
    .from('notifications')
    .insert({
      patient_id: patientId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      source_id: notification.sourceId || null,
      source_type: notification.sourceType || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markNotificationReadInDb(
  notificationId: string,
  userId: string
) {
  // Atomic mark-read via RPC — prevents race conditions
  const { error } = await getClient().rpc('mark_notification_read', {
    p_notification_id: notificationId,
    p_user_id: userId,
  })

  if (error) throw error
}

export async function markAllNotificationsReadInDb(
  patientId: string,
  userId: string
) {
  // Atomic bulk mark-read via RPC — single query instead of N+1
  const { error } = await getClient().rpc('mark_all_notifications_read', {
    p_patient_id: patientId,
    p_user_id: userId,
  })

  if (error) throw error
}
