-- ============================================
-- GATHERIN SUPABASE DATABASE SCHEMA
-- Version 1.0 - Initial Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  room_number TEXT,
  facility_name TEXT,
  facility_phone TEXT,
  facility_address TEXT,
  admission_date DATE,
  primary_diagnosis TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE care_circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'nurse', 'family')),
  relationship TEXT,
  avatar TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, email)
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('doctor_visit', 'therapy_session', 'facility_event', 'family_visit')),
  date DATE NOT NULL,
  time TEXT,
  end_time TEXT,
  location TEXT,
  patient_mood TEXT CHECK (patient_mood IN ('great', 'good', 'fair', 'poor')),
  visit_window BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES care_circle_members(id) ON DELETE SET NULL,
  claimed_by_name TEXT,
  created_by UUID NOT NULL REFERENCES care_circle_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reminder INTEGER
);

-- ============================================
-- VAULT TABLES
-- ============================================

CREATE TABLE insurance_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  member_id TEXT NOT NULL,
  group_number TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  prescribed_by TEXT,
  start_date DATE,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE provider_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE facility_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  room_number TEXT,
  floor TEXT,
  wing TEXT,
  facility_name TEXT,
  facility_phone TEXT,
  facility_address TEXT,
  nurse_station TEXT,
  visiting_hours TEXT,
  wifi_network TEXT,
  wifi_password TEXT,
  parking_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id)
);

CREATE TABLE vault_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('legal', 'medical', 'insurance', 'other')),
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_by_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ============================================
-- CARE LOG TABLES
-- ============================================

CREATE TABLE log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vitals', 'medication', 'activity', 'mood', 'incident')),
  title TEXT NOT NULL,
  notes TEXT,
  entered_by UUID NOT NULL,
  entered_by_name TEXT NOT NULL,
  entered_by_role TEXT NOT NULL CHECK (entered_by_role IN ('admin', 'nurse', 'family')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  photos TEXT[] DEFAULT ARRAY[]::TEXT[]
);

CREATE TABLE vitals_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_entry_id UUID NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature NUMERIC(5,1),
  oxygen_saturation INTEGER,
  weight NUMERIC(5,1),
  respiratory_rate INTEGER,
  UNIQUE(log_entry_id)
);

CREATE TABLE medication_log_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_entry_id UUID NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  route TEXT,
  administered_by TEXT NOT NULL,
  UNIQUE(log_entry_id)
);

CREATE TABLE activity_log_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_entry_id UUID NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('physical_therapy', 'occupational_therapy', 'meal', 'social', 'walk', 'exercise', 'other')),
  description TEXT NOT NULL,
  duration INTEGER,
  participation TEXT CHECK (participation IN ('active', 'moderate', 'minimal', 'refused')),
  UNIQUE(log_entry_id)
);

CREATE TABLE mood_log_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_entry_id UUID NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'content', 'neutral', 'anxious', 'sad', 'agitated')),
  alertness TEXT NOT NULL CHECK (alertness IN ('alert', 'drowsy', 'lethargic', 'unresponsive')),
  appetite TEXT NOT NULL CHECK (appetite IN ('good', 'fair', 'poor', 'refused')),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  notes TEXT,
  UNIQUE(log_entry_id)
);

CREATE TABLE incident_log_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_entry_id UUID NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('fall', 'behavior_change', 'condition_change', 'complaint', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high')),
  description TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  physician_notified BOOLEAN DEFAULT false,
  family_notified BOOLEAN DEFAULT false,
  UNIQUE(log_entry_id)
);

CREATE TABLE log_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_entry_id UUID NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEED & SOCIAL TABLES
-- ============================================

CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('admin', 'nurse', 'family')),
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('visit_recap', 'facility_moment', 'activity_photo', 'milestone', 'general')),
  media JSONB DEFAULT '[]'::JSONB,
  location TEXT,
  tagged_members TEXT[] DEFAULT ARRAY[]::TEXT[],
  likes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT false
);

CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VISIT TRACKING
-- ============================================

CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_relationship TEXT,
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  duration INTEGER,
  mood TEXT CHECK (mood IN ('great', 'good', 'ok', 'tough', 'hard')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vitals', 'medication', 'mood', 'incident', 'visit', 'document', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_id TEXT,
  source_type TEXT CHECK (source_type IN ('log_entry', 'event', 'visit', 'document')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_by TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- ============================================
-- WELLNESS TRACKING
-- ============================================

CREATE TABLE wellness_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  overall_score NUMERIC(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  mood_am TEXT CHECK (mood_am IN ('happy', 'content', 'neutral', 'anxious', 'sad', 'agitated')),
  mood_pm TEXT CHECK (mood_pm IN ('happy', 'content', 'neutral', 'anxious', 'sad', 'agitated')),
  appetite TEXT CHECK (appetite IN ('good', 'fair', 'poor', 'refused')),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  social_engagement TEXT CHECK (social_engagement IN ('active', 'moderate', 'minimal')),
  therapy_sessions INTEGER DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_care_circle_patient ON care_circle_members(patient_id);
CREATE INDEX idx_care_circle_role ON care_circle_members(role);

CREATE INDEX idx_events_patient ON calendar_events(patient_id);
CREATE INDEX idx_events_date ON calendar_events(date);

CREATE INDEX idx_log_entries_patient ON log_entries(patient_id);
CREATE INDEX idx_log_entries_category ON log_entries(category);
CREATE INDEX idx_log_entries_created_at ON log_entries(created_at DESC);

CREATE INDEX idx_log_comments_entry ON log_comments(log_entry_id);

CREATE INDEX idx_feed_posts_patient ON feed_posts(patient_id);
CREATE INDEX idx_feed_posts_created_at ON feed_posts(created_at DESC);

CREATE INDEX idx_feed_comments_post ON feed_comments(post_id);

CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_check_in ON visits(check_in_time DESC);

CREATE INDEX idx_notifications_patient ON notifications(patient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_wellness_patient_date ON wellness_days(patient_id, date DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_info_updated_at
  BEFORE UPDATE ON facility_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- Permissive for now (no auth yet)
-- Structured for future auth integration
-- ============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_log_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_log_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_log_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_days ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo mode (allow all via anon key)
CREATE POLICY "Allow all" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON care_circle_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON insurance_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON provider_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON facility_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vault_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON log_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vitals_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON medication_log_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON activity_log_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON mood_log_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON incident_log_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON log_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON feed_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON feed_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON wellness_days FOR ALL USING (true) WITH CHECK (true);
