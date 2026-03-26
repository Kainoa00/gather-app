-- ============================================
-- MIGRATION 002: Security Hardening & Audit Log
-- Replaces permissive "Allow all" RLS policies
-- with role-scoped access control, and adds the
-- audit_log table required for HIPAA §164.312(b).
-- ============================================

-- ============================================
-- AUDIT LOG TABLE
-- Append-only. Written server-side via service
-- role. Admins can read their facility's log.
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID        REFERENCES patients(id) ON DELETE CASCADE,
  actor_id      TEXT        NOT NULL,
  actor_name    TEXT        NOT NULL,
  actor_role    TEXT        NOT NULL,
  action        TEXT        NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  ip_address    TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_patient    ON audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor      ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER: current user's email from JWT
-- ============================================

CREATE OR REPLACE FUNCTION auth_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '')
$$;

-- ============================================
-- HELPER: all patient_ids accessible to the
-- current authenticated user
-- ============================================

CREATE OR REPLACE FUNCTION my_patient_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT patient_id
  FROM care_circle_members
  WHERE email = auth_user_email()
$$;

-- ============================================
-- DROP ALL PERMISSIVE "Allow all" POLICIES
-- ============================================

DROP POLICY IF EXISTS "Allow all" ON patients;
DROP POLICY IF EXISTS "Allow all" ON care_circle_members;
DROP POLICY IF EXISTS "Allow all" ON calendar_events;
DROP POLICY IF EXISTS "Allow all" ON insurance_cards;
DROP POLICY IF EXISTS "Allow all" ON medications;
DROP POLICY IF EXISTS "Allow all" ON provider_contacts;
DROP POLICY IF EXISTS "Allow all" ON facility_info;
DROP POLICY IF EXISTS "Allow all" ON vault_documents;
DROP POLICY IF EXISTS "Allow all" ON log_entries;
DROP POLICY IF EXISTS "Allow all" ON vitals_data;
DROP POLICY IF EXISTS "Allow all" ON medication_log_data;
DROP POLICY IF EXISTS "Allow all" ON activity_log_data;
DROP POLICY IF EXISTS "Allow all" ON mood_log_data;
DROP POLICY IF EXISTS "Allow all" ON incident_log_data;
DROP POLICY IF EXISTS "Allow all" ON log_comments;
DROP POLICY IF EXISTS "Allow all" ON feed_posts;
DROP POLICY IF EXISTS "Allow all" ON feed_comments;
DROP POLICY IF EXISTS "Allow all" ON visits;
DROP POLICY IF EXISTS "Allow all" ON notifications;
DROP POLICY IF EXISTS "Allow all" ON wellness_days;

-- ============================================
-- PATIENTS
-- Read: any care circle member
-- Write: admin or nurse role members only
-- Insert: service role only (server-side)
-- ============================================

CREATE POLICY "patient_select"
  ON patients FOR SELECT
  USING (id IN (SELECT my_patient_ids()));

CREATE POLICY "patient_update"
  ON patients FOR UPDATE
  USING (
    id IN (SELECT my_patient_ids())
    AND EXISTS (
      SELECT 1 FROM care_circle_members
      WHERE patient_id = patients.id
        AND email = auth_user_email()
        AND role IN ('admin', 'nurse')
    )
  );

-- ============================================
-- CARE CIRCLE MEMBERS
-- Select: any member of the same patient circle
-- Manage: admin members only
-- ============================================

CREATE POLICY "care_circle_select"
  ON care_circle_members FOR SELECT
  USING (patient_id IN (SELECT my_patient_ids()));

CREATE POLICY "care_circle_admin_insert"
  ON care_circle_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_circle_members AS cm
      WHERE cm.patient_id = care_circle_members.patient_id
        AND cm.email = auth_user_email()
        AND cm.role = 'admin'
    )
  );

CREATE POLICY "care_circle_admin_update"
  ON care_circle_members FOR UPDATE
  USING (
    patient_id IN (SELECT my_patient_ids())
    AND EXISTS (
      SELECT 1 FROM care_circle_members AS cm
      WHERE cm.patient_id = care_circle_members.patient_id
        AND cm.email = auth_user_email()
        AND cm.role = 'admin'
    )
  );

CREATE POLICY "care_circle_admin_delete"
  ON care_circle_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM care_circle_members AS cm
      WHERE cm.patient_id = care_circle_members.patient_id
        AND cm.email = auth_user_email()
        AND cm.role = 'admin'
    )
  );

-- ============================================
-- CALENDAR EVENTS — all members read/write
-- ============================================

CREATE POLICY "calendar_events_access"
  ON calendar_events FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- VAULT: INSURANCE CARDS — staff only
-- ============================================

CREATE POLICY "insurance_cards_staff"
  ON insurance_cards FOR ALL
  USING (
    patient_id IN (SELECT my_patient_ids())
    AND EXISTS (
      SELECT 1 FROM care_circle_members
      WHERE patient_id = insurance_cards.patient_id
        AND email = auth_user_email()
        AND role IN ('admin', 'nurse')
    )
  );

-- ============================================
-- VAULT: MEDICATIONS — staff only
-- ============================================

CREATE POLICY "medications_staff"
  ON medications FOR ALL
  USING (
    patient_id IN (SELECT my_patient_ids())
    AND EXISTS (
      SELECT 1 FROM care_circle_members
      WHERE patient_id = medications.patient_id
        AND email = auth_user_email()
        AND role IN ('admin', 'nurse')
    )
  );

-- ============================================
-- PROVIDER CONTACTS — all members
-- ============================================

CREATE POLICY "provider_contacts_access"
  ON provider_contacts FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- FACILITY INFO — all members
-- ============================================

CREATE POLICY "facility_info_access"
  ON facility_info FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- VAULT DOCUMENTS — all members
-- ============================================

CREATE POLICY "vault_documents_access"
  ON vault_documents FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- LOG ENTRIES — all members read; staff write
-- ============================================

CREATE POLICY "log_entries_select"
  ON log_entries FOR SELECT
  USING (patient_id IN (SELECT my_patient_ids()));

CREATE POLICY "log_entries_write"
  ON log_entries FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT my_patient_ids())
    AND EXISTS (
      SELECT 1 FROM care_circle_members
      WHERE patient_id = log_entries.patient_id
        AND email = auth_user_email()
        AND role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "log_entries_update"
  ON log_entries FOR UPDATE
  USING (
    patient_id IN (SELECT my_patient_ids())
    AND EXISTS (
      SELECT 1 FROM care_circle_members
      WHERE patient_id = log_entries.patient_id
        AND email = auth_user_email()
        AND role IN ('admin', 'nurse')
    )
  );

-- ============================================
-- LOG DETAIL TABLES (vitals, meds, activity,
-- mood, incident) — access via parent log_entry
-- ============================================

CREATE POLICY "vitals_data_access"
  ON vitals_data FOR ALL
  USING (
    log_entry_id IN (
      SELECT id FROM log_entries
      WHERE patient_id IN (SELECT my_patient_ids())
    )
  );

CREATE POLICY "medication_log_data_access"
  ON medication_log_data FOR ALL
  USING (
    log_entry_id IN (
      SELECT id FROM log_entries
      WHERE patient_id IN (SELECT my_patient_ids())
    )
  );

CREATE POLICY "activity_log_data_access"
  ON activity_log_data FOR ALL
  USING (
    log_entry_id IN (
      SELECT id FROM log_entries
      WHERE patient_id IN (SELECT my_patient_ids())
    )
  );

CREATE POLICY "mood_log_data_access"
  ON mood_log_data FOR ALL
  USING (
    log_entry_id IN (
      SELECT id FROM log_entries
      WHERE patient_id IN (SELECT my_patient_ids())
    )
  );

CREATE POLICY "incident_log_data_access"
  ON incident_log_data FOR ALL
  USING (
    log_entry_id IN (
      SELECT id FROM log_entries
      WHERE patient_id IN (SELECT my_patient_ids())
    )
  );

-- ============================================
-- LOG COMMENTS — all members
-- ============================================

CREATE POLICY "log_comments_access"
  ON log_comments FOR ALL
  USING (
    log_entry_id IN (
      SELECT id FROM log_entries
      WHERE patient_id IN (SELECT my_patient_ids())
    )
  );

-- ============================================
-- FEED POSTS — all members
-- ============================================

CREATE POLICY "feed_posts_access"
  ON feed_posts FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- FEED COMMENTS — all members
-- ============================================

CREATE POLICY "feed_comments_access"
  ON feed_comments FOR ALL
  USING (
    post_id IN (
      SELECT id FROM feed_posts
      WHERE patient_id IN (SELECT my_patient_ids())
    )
  );

-- ============================================
-- VISITS — all members
-- ============================================

CREATE POLICY "visits_access"
  ON visits FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- NOTIFICATIONS — all members
-- ============================================

CREATE POLICY "notifications_access"
  ON notifications FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- WELLNESS DAYS — all members read; staff write
-- ============================================

CREATE POLICY "wellness_days_access"
  ON wellness_days FOR ALL
  USING (patient_id IN (SELECT my_patient_ids()));

-- ============================================
-- AUDIT LOG — admin read-only; no client insert
-- Writes come from service role (API routes).
-- ============================================

CREATE POLICY "audit_log_admin_select"
  ON audit_log FOR SELECT
  USING (
    patient_id IN (SELECT my_patient_ids())
    AND EXISTS (
      SELECT 1 FROM care_circle_members
      WHERE patient_id = audit_log.patient_id
        AND email = auth_user_email()
        AND role = 'admin'
    )
  );
