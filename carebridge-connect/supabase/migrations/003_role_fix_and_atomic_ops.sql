-- ============================================
-- MIGRATION 003: Role constraint fix + atomic operations
-- Adds 'primary' to role CHECK constraints,
-- and creates RPC functions for atomic like/read ops.
-- ============================================

-- ── Fix role CHECK constraints ─────────────────────────────────────────────
-- TypeScript types include 'primary' but the DB rejects it.

ALTER TABLE care_circle_members
  DROP CONSTRAINT IF EXISTS care_circle_members_role_check;
ALTER TABLE care_circle_members
  ADD CONSTRAINT care_circle_members_role_check
  CHECK (role IN ('admin', 'nurse', 'family', 'primary'));

ALTER TABLE log_entries
  DROP CONSTRAINT IF EXISTS log_entries_entered_by_role_check;
ALTER TABLE log_entries
  ADD CONSTRAINT log_entries_entered_by_role_check
  CHECK (entered_by_role IN ('admin', 'nurse', 'family', 'primary'));

ALTER TABLE feed_posts
  DROP CONSTRAINT IF EXISTS feed_posts_author_role_check;
ALTER TABLE feed_posts
  ADD CONSTRAINT feed_posts_author_role_check
  CHECK (author_role IN ('admin', 'nurse', 'family', 'primary'));

-- ── Atomic toggle_like RPC ─────────────────────────────────────────────────
-- Prevents race conditions from read-then-write pattern.

CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID, p_user_id TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT[];
BEGIN
  UPDATE feed_posts
  SET likes = CASE
    WHEN p_user_id = ANY(likes) THEN array_remove(likes, p_user_id)
    ELSE array_append(likes, p_user_id)
  END
  WHERE id = p_post_id
  RETURNING likes INTO result;

  RETURN result;
END;
$$;

-- ── Atomic mark_notification_read RPC ──────────────────────────────────────

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id TEXT)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE notifications
  SET read_by = array_append(read_by, p_user_id)
  WHERE id = p_notification_id
    AND NOT (p_user_id = ANY(read_by));
$$;

-- ── Atomic mark_all_notifications_read RPC ─────────────────────────────────

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_patient_id UUID, p_user_id TEXT)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE notifications
  SET read_by = array_append(read_by, p_user_id)
  WHERE patient_id = p_patient_id
    AND NOT (p_user_id = ANY(read_by));
$$;
