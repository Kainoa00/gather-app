/**
 * Seed script for GatherIn Supabase database
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts
 *
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const PATIENT_ID = '00000000-0000-0000-0000-000000000001'

// Helper for relative dates
const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString()
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString()
const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString()
const dateOnly = (iso: string) => iso.split('T')[0]

// Member UUIDs (deterministic for foreign key references)
const SARAH_ID = '00000000-0000-0000-0000-000000000011'
const MICHAEL_ID = '00000000-0000-0000-0000-000000000012'
const EMILY_ID = '00000000-0000-0000-0000-000000000013'
const RACHEL_ID = '00000000-0000-0000-0000-000000000014'
const DAVID_ID = '00000000-0000-0000-0000-000000000015'

async function seed() {
  console.log('Seeding GatherIn database...\n')

  // 1. Patient
  console.log('1. Inserting patient...')
  const { error: patientError } = await supabase.from('patients').upsert({
    id: PATIENT_ID,
    name: 'Margaret Johnson',
    date_of_birth: '1942-06-15',
    room_number: '214B',
    facility_name: 'Sunrise Skilled Nursing Facility',
    facility_phone: '(555) 800-1234',
    facility_address: '450 Sunrise Blvd, Salt Lake City, UT 84103',
    admission_date: '2025-11-01',
    primary_diagnosis: 'Post hip replacement recovery',
  })
  if (patientError) throw patientError
  console.log('   Patient inserted.')

  // 2. Care Circle Members
  console.log('2. Inserting care circle members...')
  const { error: membersError } = await supabase.from('care_circle_members').upsert([
    { id: SARAH_ID, patient_id: PATIENT_ID, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(555) 123-4567', role: 'admin', relationship: 'Daughter', joined_at: '2025-11-01T00:00:00Z' },
    { id: MICHAEL_ID, patient_id: PATIENT_ID, name: 'Michael Johnson', email: 'michael@example.com', phone: '(555) 234-5678', role: 'family', relationship: 'Son', joined_at: '2025-11-02T00:00:00Z' },
    { id: EMILY_ID, patient_id: PATIENT_ID, name: 'Emily Davis', email: 'emily@example.com', phone: '(555) 345-6789', role: 'family', relationship: 'Granddaughter', joined_at: '2025-11-05T00:00:00Z' },
    { id: RACHEL_ID, patient_id: PATIENT_ID, name: 'Nurse Rachel Kim', email: 'rachel.kim@sunrise-snf.com', phone: '(555) 800-1235', role: 'nurse', relationship: 'Primary Nurse', joined_at: '2025-11-01T00:00:00Z' },
    { id: DAVID_ID, patient_id: PATIENT_ID, name: 'CNA David Torres', email: 'david.torres@sunrise-snf.com', phone: '(555) 800-1236', role: 'nurse', relationship: 'CNA', joined_at: '2025-11-01T00:00:00Z' },
  ])
  if (membersError) throw membersError
  console.log('   5 members inserted.')

  // 3. Calendar Events
  console.log('3. Inserting calendar events...')
  const { error: eventsError } = await supabase.from('calendar_events').upsert([
    { id: '00000000-0000-0000-0001-000000000001', patient_id: PATIENT_ID, title: 'Orthopedic Follow-up', description: 'Post-surgery hip check with Dr. Williams', type: 'doctor_visit', date: dateOnly(daysFromNow(2)), time: '10:00 AM', location: 'On-site clinic, Room 102', patient_mood: 'good', created_by: RACHEL_ID },
    { id: '00000000-0000-0000-0001-000000000002', patient_id: PATIENT_ID, title: 'Physical Therapy Session', description: 'Hip mobility exercises and gait training', type: 'therapy_session', date: dateOnly(now.toISOString()), time: '2:00 PM', end_time: '3:00 PM', location: 'PT Room, 1st Floor', patient_mood: 'fair', created_by: RACHEL_ID },
    { id: '00000000-0000-0000-0001-000000000003', patient_id: PATIENT_ID, title: 'Bingo & Social Hour', description: 'Weekly community activity in the recreation room', type: 'facility_event', date: dateOnly(daysFromNow(4)), time: '1:00 PM', end_time: '2:30 PM', location: 'Recreation Room', created_by: RACHEL_ID },
    { id: '00000000-0000-0000-0001-000000000004', patient_id: PATIENT_ID, title: 'Family Visit - Sarah & Emily', description: 'Best time to visit: after lunch, before afternoon nap', type: 'family_visit', date: dateOnly(daysFromNow(7)), time: '1:00 PM', end_time: '3:00 PM', location: 'Room 214B or Garden Patio', patient_mood: 'great', visit_window: true, claimed_by: SARAH_ID, claimed_by_name: 'Sarah', created_by: SARAH_ID },
    { id: '00000000-0000-0000-0001-000000000005', patient_id: PATIENT_ID, title: 'Music Therapy', description: 'Group sing-along and music appreciation. Margaret loves the oldies!', type: 'facility_event', date: dateOnly(daysFromNow(2)), time: '3:00 PM', end_time: '4:00 PM', location: 'Activity Center', created_by: RACHEL_ID },
    { id: '00000000-0000-0000-0001-000000000006', patient_id: PATIENT_ID, title: 'Open Visit Window', description: 'Grandma is usually in great spirits after PT. Perfect time to drop by!', type: 'family_visit', date: dateOnly(daysFromNow(4)), time: '3:00 PM', end_time: '5:00 PM', location: 'Room 214B', patient_mood: 'good', visit_window: true, created_by: RACHEL_ID },
  ])
  if (eventsError) throw eventsError
  console.log('   6 events inserted.')

  // 4. Vault - Insurance Cards
  console.log('4. Inserting vault data...')
  await supabase.from('insurance_cards').upsert([
    { id: '00000000-0000-0000-0002-000000000001', patient_id: PATIENT_ID, name: 'Medicare Part A & B', member_id: '1EG4-TE5-MK72', group_number: 'N/A', notes: 'Primary insurance' },
    { id: '00000000-0000-0000-0002-000000000002', patient_id: PATIENT_ID, name: 'AARP Supplemental', member_id: 'SUP-789456123', group_number: 'AARP-2024', notes: 'Secondary coverage' },
  ])

  // Vault - Medications
  await supabase.from('medications').upsert([
    { id: '00000000-0000-0000-0003-000000000001', patient_id: PATIENT_ID, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily, morning', prescribed_by: 'Dr. Williams', notes: 'For blood pressure' },
    { id: '00000000-0000-0000-0003-000000000002', patient_id: PATIENT_ID, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', prescribed_by: 'Dr. Chen', notes: 'For diabetes management' },
    { id: '00000000-0000-0000-0003-000000000003', patient_id: PATIENT_ID, name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', notes: 'Supplement for bone health' },
    { id: '00000000-0000-0000-0003-000000000004', patient_id: PATIENT_ID, name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed, max 4x daily', prescribed_by: 'Dr. Williams', notes: 'Post-surgery pain management' },
  ])

  // Vault - Providers
  await supabase.from('provider_contacts').upsert([
    { id: '00000000-0000-0000-0004-000000000001', patient_id: PATIENT_ID, name: 'Dr. James Williams', specialty: 'Orthopedic Surgeon', phone: '(555) 111-2222', address: 'Sunrise Medical Center, 123 Medical Dr' },
    { id: '00000000-0000-0000-0004-000000000002', patient_id: PATIENT_ID, name: 'Dr. Lisa Chen', specialty: 'Primary Care / Internist', phone: '(555) 333-4444', address: 'Family Health Clinic, 789 Oak Ave' },
    { id: '00000000-0000-0000-0004-000000000003', patient_id: PATIENT_ID, name: 'Dr. Michael Brown', specialty: 'Endocrinologist', phone: '(555) 555-6666', address: 'Diabetes Center, 321 Pine St' },
    { id: '00000000-0000-0000-0004-000000000004', patient_id: PATIENT_ID, name: 'PT Sarah Martinez', specialty: 'Physical Therapist', phone: '(555) 800-1240', address: 'Sunrise SNF, PT Department' },
  ])

  // Vault - Facility Info
  await supabase.from('facility_info').upsert({
    patient_id: PATIENT_ID,
    room_number: '214B',
    floor: '2nd Floor',
    wing: 'East Wing',
    facility_name: 'Sunrise Skilled Nursing Facility',
    facility_phone: '(555) 800-1234',
    facility_address: '450 Sunrise Blvd, Salt Lake City, UT 84103',
    nurse_station: 'East Wing 2nd Floor Station - (555) 800-1235',
    visiting_hours: 'Daily 9:00 AM - 8:00 PM',
    wifi_network: 'Sunrise-Guest',
    wifi_password: 'Welcome2025',
    parking_info: 'Free visitor parking in Lot B, enter through East entrance',
  })

  // Vault - Documents
  await supabase.from('vault_documents').upsert([
    { id: '00000000-0000-0000-0005-000000000001', patient_id: PATIENT_ID, name: 'Advance Directive', category: 'legal', file_type: 'pdf', file_size: 245000, uploaded_by: SARAH_ID, uploaded_by_name: 'Sarah Johnson', uploaded_at: '2025-11-15T00:00:00Z', notes: 'Signed and notarized copy' },
    { id: '00000000-0000-0000-0005-000000000002', patient_id: PATIENT_ID, name: 'Power of Attorney', category: 'legal', file_type: 'pdf', file_size: 312000, uploaded_by: SARAH_ID, uploaded_by_name: 'Sarah Johnson', uploaded_at: '2025-11-15T00:00:00Z', notes: 'Sarah Johnson designated as healthcare POA' },
    { id: '00000000-0000-0000-0005-000000000003', patient_id: PATIENT_ID, name: 'DNR Order', category: 'medical', file_type: 'pdf', file_size: 89000, uploaded_by: RACHEL_ID, uploaded_by_name: 'Nurse Rachel Kim', uploaded_at: '2025-11-20T00:00:00Z' },
    { id: '00000000-0000-0000-0005-000000000004', patient_id: PATIENT_ID, name: 'Discharge Plan', category: 'medical', file_type: 'pdf', file_size: 178000, uploaded_by: RACHEL_ID, uploaded_by_name: 'Nurse Rachel Kim', uploaded_at: '2026-01-10T00:00:00Z', notes: 'Preliminary discharge plan - target date TBD' },
    { id: '00000000-0000-0000-0005-000000000005', patient_id: PATIENT_ID, name: 'Insurance EOB - January', category: 'insurance', file_type: 'pdf', file_size: 423000, uploaded_by: SARAH_ID, uploaded_by_name: 'Sarah Johnson', uploaded_at: '2026-01-28T00:00:00Z' },
  ])
  console.log('   Vault data inserted.')

  // 5. Log Entries
  console.log('5. Inserting log entries...')
  const logIds = [
    '00000000-0000-0000-0006-000000000001',
    '00000000-0000-0000-0006-000000000002',
    '00000000-0000-0000-0006-000000000003',
    '00000000-0000-0000-0006-000000000004',
    '00000000-0000-0000-0006-000000000005',
    '00000000-0000-0000-0006-000000000006',
    '00000000-0000-0000-0006-000000000007',
    '00000000-0000-0000-0006-000000000008',
  ]

  await supabase.from('log_entries').upsert([
    { id: logIds[0], patient_id: PATIENT_ID, category: 'vitals', title: 'Morning Vitals Check', notes: 'Vitals within normal range. Patient resting comfortably.', entered_by: RACHEL_ID, entered_by_name: 'Nurse Rachel Kim', entered_by_role: 'nurse', created_at: hoursAgo(2) },
    { id: logIds[1], patient_id: PATIENT_ID, category: 'medication', title: 'Morning Medications Administered', notes: 'All morning meds given on schedule. No adverse reactions.', entered_by: RACHEL_ID, entered_by_name: 'Nurse Rachel Kim', entered_by_role: 'nurse', created_at: hoursAgo(4) },
    { id: logIds[2], patient_id: PATIENT_ID, category: 'activity', title: 'Physical Therapy Session', notes: 'Walked 150 feet with walker. Improved hip range of motion. Patient in good spirits.', entered_by: DAVID_ID, entered_by_name: 'CNA David Torres', entered_by_role: 'nurse', created_at: daysAgo(1) },
    { id: logIds[3], patient_id: PATIENT_ID, category: 'mood', title: 'Daily Mood & Wellness Check', notes: 'Margaret is in great spirits today. Chatting with roommate and watching her shows. Ate most of her lunch.', entered_by: DAVID_ID, entered_by_name: 'CNA David Torres', entered_by_role: 'nurse', created_at: hoursAgo(3) },
    { id: logIds[4], patient_id: PATIENT_ID, category: 'incident', title: 'Minor Balance Issue During Transfer', notes: 'During bed-to-wheelchair transfer, patient lost balance briefly. Staff caught her immediately. No injury. Will monitor closely.', entered_by: RACHEL_ID, entered_by_name: 'Nurse Rachel Kim', entered_by_role: 'nurse', created_at: daysAgo(2) },
    { id: logIds[5], patient_id: PATIENT_ID, category: 'vitals', title: 'Evening Vitals Check', notes: 'Blood pressure slightly elevated this evening. Will continue to monitor.', entered_by: RACHEL_ID, entered_by_name: 'Nurse Rachel Kim', entered_by_role: 'nurse', created_at: daysAgo(1) },
    { id: logIds[6], patient_id: PATIENT_ID, category: 'activity', title: 'Participated in Bingo Social Hour', notes: 'Margaret joined the recreation room for bingo. Won two rounds! Very engaged and social with other residents.', entered_by: DAVID_ID, entered_by_name: 'CNA David Torres', entered_by_role: 'nurse', created_at: daysAgo(3) },
    { id: logIds[7], patient_id: PATIENT_ID, category: 'medication', title: 'Pain Medication Administered', notes: 'Patient requested pain relief after physical therapy. Given Acetaminophen as prescribed.', entered_by: RACHEL_ID, entered_by_name: 'Nurse Rachel Kim', entered_by_role: 'nurse', created_at: daysAgo(1) },
  ])

  // Category-specific data
  await supabase.from('vitals_data').upsert([
    { log_entry_id: logIds[0], blood_pressure_systolic: 128, blood_pressure_diastolic: 78, heart_rate: 72, temperature: 98.4, oxygen_saturation: 97, respiratory_rate: 16 },
    { log_entry_id: logIds[5], blood_pressure_systolic: 142, blood_pressure_diastolic: 88, heart_rate: 76, temperature: 98.6, oxygen_saturation: 96 },
  ])

  await supabase.from('medication_log_data').upsert([
    { log_entry_id: logIds[1], medication_name: 'Lisinopril 10mg, Metformin 500mg, Vitamin D3 2000 IU', dosage: 'As prescribed', route: 'Oral', administered_by: 'Rachel Kim, RN' },
    { log_entry_id: logIds[7], medication_name: 'Acetaminophen', dosage: '500mg', route: 'Oral', administered_by: 'Rachel Kim, RN' },
  ])

  await supabase.from('activity_log_data').upsert([
    { log_entry_id: logIds[2], activity_type: 'physical_therapy', description: 'Hip mobility exercises, gait training with walker, standing balance work', duration: 45, participation: 'active' },
    { log_entry_id: logIds[6], activity_type: 'social', description: 'Community bingo game in recreation room', duration: 90, participation: 'active' },
  ])

  await supabase.from('mood_log_data').upsert([
    { log_entry_id: logIds[3], mood: 'happy', alertness: 'alert', appetite: 'good', pain_level: 3, notes: 'Slight hip discomfort but manageable. Declined pain medication.' },
  ])

  await supabase.from('incident_log_data').upsert([
    { log_entry_id: logIds[4], incident_type: 'fall', severity: 'low', description: 'Patient lost balance during bed-to-wheelchair transfer. Staff present and prevented fall.', action_taken: 'Caught patient immediately, no impact. Assessed for injury - none found. Updated care plan to ensure two-person assist for transfers.', physician_notified: false, family_notified: true },
  ])

  // Log comments
  await supabase.from('log_comments').upsert([
    { log_entry_id: logIds[0], author_id: SARAH_ID, author_name: 'Sarah Johnson', content: 'Thanks for the update Rachel! Her BP looks much better than last week.', created_at: hoursAgo(1) },
    { log_entry_id: logIds[2], author_id: MICHAEL_ID, author_name: 'Michael Johnson', content: 'Great to hear she is making progress! Keep it up Mom!', created_at: daysAgo(1) },
    { log_entry_id: logIds[3], author_id: EMILY_ID, author_name: 'Emily Davis', content: 'So glad to hear Grandma is happy! I will try to visit this weekend.', created_at: hoursAgo(1.5) },
    { log_entry_id: logIds[4], author_id: SARAH_ID, author_name: 'Sarah Johnson', content: 'Thank you for letting us know and for the quick response. Please keep the two-person assist in place.', created_at: daysAgo(2) },
  ])
  console.log('   8 log entries with related data inserted.')

  // 6. Feed Posts
  console.log('6. Inserting feed posts...')
  const postIds = [
    '00000000-0000-0000-0007-000000000001',
    '00000000-0000-0000-0007-000000000002',
    '00000000-0000-0000-0007-000000000003',
    '00000000-0000-0000-0007-000000000004',
  ]

  await supabase.from('feed_posts').upsert([
    { id: postIds[0], patient_id: PATIENT_ID, author_id: DAVID_ID, author_name: 'CNA David Torres', author_initials: 'DT', author_role: 'nurse', content: 'Margaret had a wonderful afternoon in the garden today! She loved the fresh air and spent time looking at the flowers.', post_type: 'facility_moment', media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop' }], location: 'Sunrise Garden Patio', likes: [SARAH_ID, MICHAEL_ID, EMILY_ID], created_at: hoursAgo(2) },
    { id: postIds[1], patient_id: PATIENT_ID, author_id: SARAH_ID, author_name: 'Sarah Johnson', author_initials: 'SJ', author_role: 'family', content: 'Visited Mom today and she was in such great spirits! We looked through old photo albums together.', post_type: 'visit_recap', media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1545450660-3378a7f3a364?w=800&h=800&fit=crop' }], likes: [MICHAEL_ID, EMILY_ID, RACHEL_ID], created_at: daysAgo(1) },
    { id: postIds[2], patient_id: PATIENT_ID, author_id: RACHEL_ID, author_name: 'Nurse Rachel Kim', author_initials: 'RK', author_role: 'nurse', content: 'Margaret hit a milestone today in physical therapy! She walked 150 feet with her walker, her longest distance yet since surgery.', post_type: 'milestone', likes: [SARAH_ID, MICHAEL_ID, EMILY_ID], created_at: daysAgo(2), is_pinned: true },
    { id: postIds[3], patient_id: PATIENT_ID, author_id: EMILY_ID, author_name: 'Emily Davis', author_initials: 'ED', author_role: 'family', content: 'Brought Grandma her favorite cookies from the bakery downtown. She shared them with her roommate and the nurses. Classic Grandma!', post_type: 'visit_recap', media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&h=800&fit=crop' }], location: 'Room 214B', likes: [SARAH_ID, MICHAEL_ID, RACHEL_ID, DAVID_ID], created_at: daysAgo(3) },
  ])

  await supabase.from('feed_comments').upsert([
    { post_id: postIds[0], author_id: SARAH_ID, author_name: 'Sarah Johnson', content: 'This makes my heart so happy! She always loved her garden.', created_at: hoursAgo(1) },
    { post_id: postIds[0], author_id: EMILY_ID, author_name: 'Emily Davis', content: 'Grandma looks so peaceful! I am bringing her favorite flowers when I visit.', created_at: hoursAgo(0.5) },
    { post_id: postIds[1], author_id: MICHAEL_ID, author_name: 'Michael Johnson', content: 'Wish I could have been there! I will visit this weekend for sure.', created_at: daysAgo(1) },
    { post_id: postIds[3], author_id: RACHEL_ID, author_name: 'Nurse Rachel Kim', content: 'Those cookies were delicious! Margaret was beaming when you visited.', created_at: daysAgo(3) },
  ])
  console.log('   4 feed posts with comments inserted.')

  // 7. Visits
  console.log('7. Inserting visits...')
  await supabase.from('visits').upsert([
    { id: '00000000-0000-0000-0008-000000000001', patient_id: PATIENT_ID, visitor_id: SARAH_ID, visitor_name: 'Sarah Johnson', visitor_relationship: 'Daughter', check_in_time: hoursAgo(1) },
    { id: '00000000-0000-0000-0008-000000000002', patient_id: PATIENT_ID, visitor_id: EMILY_ID, visitor_name: 'Emily Davis', visitor_relationship: 'Granddaughter', check_in_time: daysAgo(1), check_out_time: daysAgo(1), duration: 135, mood: 'great', note: 'Did puzzles together, grandma loved it!' },
    { id: '00000000-0000-0000-0008-000000000003', patient_id: PATIENT_ID, visitor_id: MICHAEL_ID, visitor_name: 'Michael Johnson', visitor_relationship: 'Son', check_in_time: daysAgo(2), check_out_time: daysAgo(2), duration: 90, mood: 'good', note: 'Brought her favorite cookies' },
    { id: '00000000-0000-0000-0008-000000000004', patient_id: PATIENT_ID, visitor_id: SARAH_ID, visitor_name: 'Sarah Johnson', visitor_relationship: 'Daughter', check_in_time: daysAgo(3), check_out_time: daysAgo(3), duration: 180, mood: 'great', note: 'Great visit, she was very talkative' },
    { id: '00000000-0000-0000-0008-000000000005', patient_id: PATIENT_ID, visitor_id: EMILY_ID, visitor_name: 'Emily Davis', visitor_relationship: 'Granddaughter', check_in_time: daysAgo(5), check_out_time: daysAgo(5), duration: 105, mood: 'good' },
  ])
  console.log('   5 visits inserted.')

  // 8. Notifications
  console.log('8. Inserting notifications...')
  await supabase.from('notifications').upsert([
    { id: '00000000-0000-0000-0009-000000000001', patient_id: PATIENT_ID, type: 'incident', title: 'Incident Reported', message: 'Minor balance issue during transfer. No injury. Staff responded immediately.', source_id: logIds[4], source_type: 'log_entry', created_at: hoursAgo(1), read_by: [] },
    { id: '00000000-0000-0000-0009-000000000002', patient_id: PATIENT_ID, type: 'vitals', title: 'Vitals Logged', message: 'Morning vitals: BP 128/78, HR 72, O2 97%. All within normal range.', source_id: logIds[0], source_type: 'log_entry', created_at: hoursAgo(2), read_by: [] },
    { id: '00000000-0000-0000-0009-000000000003', patient_id: PATIENT_ID, type: 'mood', title: 'Great Mood Today', message: 'Margaret is happy and alert. Chatting with roommate and watching her shows.', source_id: logIds[3], source_type: 'log_entry', created_at: hoursAgo(3), read_by: [] },
    { id: '00000000-0000-0000-0009-000000000004', patient_id: PATIENT_ID, type: 'visit', title: 'Emily Visited', message: 'Emily Davis visited for 2h 15m. Did puzzles together.', source_type: 'visit', created_at: daysAgo(1), read_by: [SARAH_ID] },
    { id: '00000000-0000-0000-0009-000000000005', patient_id: PATIENT_ID, type: 'medication', title: 'Medications Administered', message: 'All evening meds administered on schedule. No adverse reactions.', source_id: logIds[7], source_type: 'log_entry', created_at: daysAgo(1), read_by: [SARAH_ID] },
    { id: '00000000-0000-0000-0009-000000000006', patient_id: PATIENT_ID, type: 'vitals', title: 'BP Slightly Elevated', message: 'Evening vitals: BP 142/88. Slightly high. Monitoring closely.', source_id: logIds[5], source_type: 'log_entry', created_at: daysAgo(1), read_by: [SARAH_ID] },
    { id: '00000000-0000-0000-0009-000000000007', patient_id: PATIENT_ID, type: 'document', title: 'Document Uploaded', message: 'Discharge Plan uploaded by Nurse Rachel Kim.', source_type: 'document', created_at: '2026-01-10T00:00:00Z', read_by: [SARAH_ID, MICHAEL_ID, EMILY_ID] },
  ])
  console.log('   7 notifications inserted.')

  // 9. Wellness Days
  console.log('9. Inserting wellness days...')
  await supabase.from('wellness_days').upsert([
    { patient_id: PATIENT_ID, date: dateOnly(daysAgo(6)), overall_score: 7, mood_am: 'content', mood_pm: 'happy', appetite: 'good', pain_level: 3, social_engagement: 'active', therapy_sessions: 1, visit_count: 0 },
    { patient_id: PATIENT_ID, date: dateOnly(daysAgo(5)), overall_score: 7.5, mood_am: 'happy', mood_pm: 'content', appetite: 'good', pain_level: 2, social_engagement: 'moderate', therapy_sessions: 0, visit_count: 1 },
    { patient_id: PATIENT_ID, date: dateOnly(daysAgo(4)), overall_score: 6.5, mood_am: 'content', mood_pm: 'happy', appetite: 'fair', pain_level: 4, social_engagement: 'active', therapy_sessions: 1, visit_count: 0 },
    { patient_id: PATIENT_ID, date: dateOnly(daysAgo(3)), overall_score: 8, mood_am: 'happy', mood_pm: 'happy', appetite: 'good', pain_level: 2, social_engagement: 'active', therapy_sessions: 1, visit_count: 1 },
    { patient_id: PATIENT_ID, date: dateOnly(daysAgo(2)), overall_score: 6, mood_am: 'neutral', mood_pm: 'content', appetite: 'fair', pain_level: 3, social_engagement: 'moderate', therapy_sessions: 0, visit_count: 1 },
    { patient_id: PATIENT_ID, date: dateOnly(daysAgo(1)), overall_score: 8.5, mood_am: 'content', mood_pm: 'happy', appetite: 'good', pain_level: 2, social_engagement: 'active', therapy_sessions: 1, visit_count: 1 },
    { patient_id: PATIENT_ID, date: dateOnly(now.toISOString()), overall_score: 8, mood_am: 'happy', appetite: 'good', pain_level: 3, social_engagement: 'moderate', therapy_sessions: 0, visit_count: 1 },
  ])
  console.log('   7 wellness days inserted.')

  console.log('\nSeed completed successfully!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
