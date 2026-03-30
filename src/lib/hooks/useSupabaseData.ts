'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isDemoMode, DEMO_PATIENT_ID } from '@/lib/supabase'
import {
  CareCircleMember,
  CalendarEvent,
  LogEntry,
  FeedPost,
  Visit,
  Notification,
  Vault,
  PatientInfo,
  WellnessDay,
  UserRole,
  LogComment,
  FeedComment,
  VitalsData,
  MedicationLogData,
  ActivityLogData,
  MoodData,
  IncidentLogData,
} from '@/types'
import {
  demoMembers,
  demoEvents,
  demoLogEntries,
  demoPosts,
  demoVisits,
  demoNotifications,
  demoVault,
  demoPatient,
  demoWellnessDays,
} from '@/lib/demo-data'

// TODO: replace with generated Supabase row types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>

// ==========================================
// Patient Hook
// ==========================================

export function usePatient(patientId: string = DEMO_PATIENT_ID) {
  const [patient, setPatient] = useState<PatientInfo>(demoPatient)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setPatient(demoPatient)
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (error || !data) {
        console.error('Error fetching patient:', error)
        setPatient(demoPatient)
      } else {
        setPatient({
          name: data.name,
          dateOfBirth: new Date(data.date_of_birth),
          roomNumber: data.room_number || '',
          facilityName: data.facility_name || '',
          facilityPhone: data.facility_phone || '',
          facilityAddress: data.facility_address || '',
          admissionDate: data.admission_date ? new Date(data.admission_date) : new Date(),
          primaryDiagnosis: data.primary_diagnosis || undefined,
          photoUrl: data.photo_url || undefined,
        })
      }
      setLoading(false)
    }

    fetch()
  }, [patientId])

  return { patient, loading }
}

// ==========================================
// Care Circle Members Hook
// ==========================================

export function useMembers(patientId: string = DEMO_PATIENT_ID) {
  const [members, setMembers] = useState<CareCircleMember[]>(demoMembers)
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('care_circle_members')
      .select('*')
      .eq('patient_id', patientId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
    } else if (data) {
      setMembers(data.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone || undefined,
        role: m.role as UserRole,
        relationship: m.relationship || undefined,
        avatar: m.avatar || undefined,
        joinedAt: new Date(m.joined_at),
      })))
    }
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    fetchMembers()

    if (!isDemoMode) {
      const channel = supabase
        .channel(`members_changes_${patientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'care_circle_members',
          filter: `patient_id=eq.${patientId}`,
        }, () => { fetchMembers() })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [patientId, fetchMembers])

  return { members, loading, setMembers, refetch: fetchMembers }
}

// ==========================================
// Calendar Events Hook
// ==========================================

export function useEvents(patientId: string = DEMO_PATIENT_ID) {
  const [events, setEvents] = useState<CalendarEvent[]>(demoEvents)
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
    } else if (data) {
      setEvents(data.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || undefined,
        type: e.type as CalendarEvent['type'],
        date: new Date(e.date),
        time: e.time || undefined,
        endTime: e.end_time || undefined,
        location: e.location || undefined,
        patientMood: (e.patient_mood as CalendarEvent['patientMood']) || undefined,
        visitWindow: e.visit_window || undefined,
        claimedBy: e.claimed_by || undefined,
        claimedByName: e.claimed_by_name || undefined,
        createdBy: e.created_by,
        createdAt: new Date(e.created_at),
        reminder: e.reminder || undefined,
      })))
    }
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    fetchEvents()

    if (!isDemoMode) {
      const channel = supabase
        .channel(`events_changes_${patientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `patient_id=eq.${patientId}`,
        }, () => { fetchEvents() })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [patientId, fetchEvents])

  return { events, loading, setEvents, refetch: fetchEvents }
}

// ==========================================
// Log Entries Hook
// ==========================================

export function useLogEntries(patientId: string = DEMO_PATIENT_ID) {
  const [logEntries, setLogEntries] = useState<LogEntry[]>(demoLogEntries)
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    // Fetch log entries with all related data
    const { data: logs, error } = await supabase
      .from('log_entries')
      .select(`
        *,
        vitals_data(*),
        medication_log_data(*),
        activity_log_data(*),
        mood_log_data(*),
        incident_log_data(*),
        log_comments(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching log entries:', error)
    } else if (logs) {
      setLogEntries(logs.map((log: DbRow) => { // TODO: type from Supabase schema
        const vitals = log.vitals_data?.[0]
        const medLog = log.medication_log_data?.[0]
        const actLog = log.activity_log_data?.[0]
        const moodLog = log.mood_log_data?.[0]
        const incLog = log.incident_log_data?.[0]

        const entry: LogEntry = {
          id: log.id,
          category: log.category as LogEntry['category'],
          title: log.title,
          notes: log.notes || undefined,
          enteredBy: log.entered_by,
          enteredByName: log.entered_by_name,
          enteredByRole: log.entered_by_role as UserRole,
          createdAt: new Date(log.created_at),
          photos: log.photos?.length > 0 ? log.photos : undefined,
          comments: (log.log_comments || []).map((c: DbRow) => ({ // TODO: type from Supabase schema
            id: c.id,
            authorId: c.author_id,
            authorName: c.author_name,
            content: c.content,
            createdAt: new Date(c.created_at),
          })),
        }

        if (vitals) {
          entry.vitals = {
            bloodPressureSystolic: vitals.blood_pressure_systolic || undefined,
            bloodPressureDiastolic: vitals.blood_pressure_diastolic || undefined,
            heartRate: vitals.heart_rate || undefined,
            temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
            oxygenSaturation: vitals.oxygen_saturation || undefined,
            weight: vitals.weight ? Number(vitals.weight) : undefined,
            respiratoryRate: vitals.respiratory_rate || undefined,
          }
        }

        if (medLog) {
          entry.medicationLog = {
            medicationName: medLog.medication_name,
            dosage: medLog.dosage,
            route: medLog.route || undefined,
            administeredBy: medLog.administered_by,
          }
        }

        if (actLog) {
          entry.activityLog = {
            activityType: actLog.activity_type as ActivityLogData['activityType'],
            description: actLog.description,
            duration: actLog.duration || undefined,
            participation: (actLog.participation as ActivityLogData['participation']) || undefined,
          }
        }

        if (moodLog) {
          entry.moodLog = {
            mood: moodLog.mood as MoodData['mood'],
            alertness: moodLog.alertness as MoodData['alertness'],
            appetite: moodLog.appetite as MoodData['appetite'],
            painLevel: moodLog.pain_level || undefined,
            notes: moodLog.notes || undefined,
          }
        }

        if (incLog) {
          entry.incidentLog = {
            incidentType: incLog.incident_type as IncidentLogData['incidentType'],
            severity: incLog.severity as IncidentLogData['severity'],
            description: incLog.description,
            actionTaken: incLog.action_taken,
            physicianNotified: incLog.physician_notified,
            familyNotified: incLog.family_notified,
          }
        }

        return entry
      }))
    }
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    fetchLogs()

    if (!isDemoMode) {
      const channel = supabase
        .channel(`logs_changes_${patientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'log_entries',
          filter: `patient_id=eq.${patientId}`,
        }, () => { fetchLogs() })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [patientId, fetchLogs])

  return { logEntries, loading, setLogEntries, refetch: fetchLogs }
}

// ==========================================
// Feed Posts Hook
// ==========================================

export function usePosts(patientId: string = DEMO_PATIENT_ID) {
  const [posts, setPosts] = useState<FeedPost[]>(demoPosts)
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('feed_posts')
      .select(`*, feed_comments(*)`)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
    } else if (data) {
      setPosts(data.map((p: DbRow) => ({ // TODO: type from Supabase schema
        id: p.id,
        authorId: p.author_id,
        authorName: p.author_name,
        authorInitials: p.author_initials,
        authorRole: p.author_role as UserRole,
        content: p.content,
        postType: p.post_type as FeedPost['postType'],
        media: (p.media as FeedPost['media']) || undefined, // TODO: type from Supabase schema
        location: p.location || undefined,
        taggedMembers: p.tagged_members || undefined,
        likes: p.likes || [],
        comments: (p.feed_comments || []).map((c: DbRow) => ({ // TODO: type from Supabase schema
          id: c.id,
          authorId: c.author_id,
          authorName: c.author_name,
          content: c.content,
          createdAt: new Date(c.created_at),
        })),
        createdAt: new Date(p.created_at),
        isPinned: p.is_pinned || undefined,
      })))
    }
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    fetchPosts()

    if (!isDemoMode) {
      const channel = supabase
        .channel(`posts_changes_${patientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'feed_posts',
          filter: `patient_id=eq.${patientId}`,
        }, () => { fetchPosts() })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [patientId, fetchPosts])

  return { posts, loading, setPosts, refetch: fetchPosts }
}

// ==========================================
// Visits Hook
// ==========================================

export function useVisits(patientId: string = DEMO_PATIENT_ID) {
  const [visits, setVisits] = useState<Visit[]>(demoVisits)
  const [loading, setLoading] = useState(true)

  const fetchVisits = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', patientId)
      .order('check_in_time', { ascending: false })

    if (error) {
      console.error('Error fetching visits:', error)
    } else if (data) {
      setVisits(data.map(v => ({
        id: v.id,
        visitorId: v.visitor_id,
        visitorName: v.visitor_name,
        visitorRelationship: v.visitor_relationship || undefined,
        checkInTime: new Date(v.check_in_time),
        checkOutTime: v.check_out_time ? new Date(v.check_out_time) : undefined,
        duration: v.duration || undefined,
        mood: (v.mood as Visit['mood']) || undefined,
        note: v.note || undefined,
      })))
    }
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    fetchVisits()

    if (!isDemoMode) {
      const channel = supabase
        .channel(`visits_changes_${patientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'visits',
          filter: `patient_id=eq.${patientId}`,
        }, () => { fetchVisits() })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [patientId, fetchVisits])

  return { visits, loading, setVisits, refetch: fetchVisits }
}

// ==========================================
// Notifications Hook
// ==========================================

export function useNotifications(patientId: string = DEMO_PATIENT_ID) {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
    } else if (data) {
      setNotifications(data.map(n => ({
        id: n.id,
        type: n.type as Notification['type'],
        title: n.title,
        message: n.message,
        sourceId: n.source_id || undefined,
        sourceType: (n.source_type as Notification['sourceType']) || undefined,
        createdAt: new Date(n.created_at),
        readBy: n.read_by || [],
      })))
    }
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    fetchNotifications()

    if (!isDemoMode) {
      const channel = supabase
        .channel(`notifications_changes_${patientId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `patient_id=eq.${patientId}`,
        }, () => { fetchNotifications() })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [patientId, fetchNotifications])

  return { notifications, loading, setNotifications, refetch: fetchNotifications }
}

// ==========================================
// Vault Hook
// ==========================================

export function useVault(patientId: string = DEMO_PATIENT_ID) {
  const [vault, setVault] = useState<Vault>(demoVault)
  const [loading, setLoading] = useState(true)

  const fetchVault = useCallback(async () => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    const [
      { data: cards },
      { data: meds },
      { data: providers },
      { data: facility },
      { data: docs },
    ] = await Promise.all([
      supabase.from('insurance_cards').select('*').eq('patient_id', patientId),
      supabase.from('medications').select('*').eq('patient_id', patientId).eq('active', true),
      supabase.from('provider_contacts').select('*').eq('patient_id', patientId),
      supabase.from('facility_info').select('*').eq('patient_id', patientId).single(),
      supabase.from('vault_documents').select('*').eq('patient_id', patientId).order('uploaded_at', { ascending: false }),
    ])

    setVault({
      insuranceCards: (cards || []).map(c => ({
        id: c.id,
        name: c.name,
        memberId: c.member_id,
        groupNumber: c.group_number || undefined,
        frontImageUrl: c.front_image_url || undefined,
        backImageUrl: c.back_image_url || undefined,
        notes: c.notes || undefined,
      })),
      medications: (meds || []).map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        prescribedBy: m.prescribed_by || undefined,
        startDate: m.start_date ? new Date(m.start_date) : undefined,
        notes: m.notes || undefined,
      })),
      providers: (providers || []).map(p => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        phone: p.phone,
        address: p.address || undefined,
        notes: p.notes || undefined,
      })),
      facilityInfo: facility ? {
        roomNumber: facility.room_number || '',
        floor: facility.floor || '',
        wing: facility.wing || '',
        facilityName: facility.facility_name || '',
        facilityPhone: facility.facility_phone || '',
        facilityAddress: facility.facility_address || '',
        nurseStation: facility.nurse_station || '',
        visitingHours: facility.visiting_hours || '',
        wifiNetwork: facility.wifi_network || undefined,
        wifiPassword: facility.wifi_password || undefined,
        parkingInfo: facility.parking_info || undefined,
      } : demoVault.facilityInfo,
      documents: (docs || []).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category as 'legal' | 'medical' | 'insurance' | 'other', // TODO: type from Supabase schema
        fileUrl: d.file_url || undefined,
        fileType: d.file_type || undefined,
        fileSize: d.file_size || undefined,
        uploadedBy: d.uploaded_by,
        uploadedByName: d.uploaded_by_name,
        uploadedAt: new Date(d.uploaded_at),
        notes: d.notes || undefined,
      })),
    })
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    fetchVault()
  }, [patientId, fetchVault])

  return { vault, loading, setVault, refetch: fetchVault }
}

// ==========================================
// Wellness Days Hook
// ==========================================

export function useWellnessDays(patientId: string = DEMO_PATIENT_ID) {
  const [wellnessDays, setWellnessDays] = useState<WellnessDay[]>(demoWellnessDays)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('wellness_days')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: true })
        .limit(30)

      if (error) {
        console.error('Error fetching wellness days:', error)
      } else if (data) {
        setWellnessDays(data.map(w => ({
          date: new Date(w.date),
          overallScore: Number(w.overall_score) || 0,
          moodAM: (w.mood_am as MoodData['mood']) || undefined,
          moodPM: (w.mood_pm as MoodData['mood']) || undefined,
          appetite: (w.appetite as MoodData['appetite']) || undefined,
          painLevel: w.pain_level || undefined,
          socialEngagement: (w.social_engagement as WellnessDay['socialEngagement']) || undefined,
          therapySessions: w.therapy_sessions || undefined,
          visitCount: w.visit_count || undefined,
        })))
      }
      setLoading(false)
    }

    fetch()
  }, [patientId])

  return { wellnessDays, loading }
}
