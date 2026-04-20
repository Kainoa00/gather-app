-- =============================================
-- Migration 004: Agent Infrastructure
-- Adds tables for Managed Agents system:
--   agent_sessions  – tracks each agent execution
--   agent_outputs   – stores AI-generated content (digests, reports, recommendations)
--   agent_alerts    – proactive wellness alerts from monitoring agents
-- =============================================

-- -------------------------------------------
-- 1. Agent Sessions
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('managed', 'tool_use')),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  anthropic_session_id TEXT,
  trigger_type TEXT CHECK (trigger_type IN ('cron', 'event', 'manual')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  input_summary TEXT,
  token_usage JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------
-- 2. Agent Outputs
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL
    CHECK (output_type IN ('digest', 'alert', 'report', 'recommendation', 'audit_finding')),
  title TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  content_html TEXT,
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  acknowledged_by TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------
-- 3. Agent Alerts
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS agent_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  output_id UUID REFERENCES agent_outputs(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL
    CHECK (alert_type IN (
      'vitals_anomaly',
      'mood_decline',
      'missed_medication',
      'incident_pattern',
      'compliance_gap'
    )),
  severity TEXT NOT NULL
    CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  data_points JSONB DEFAULT '{}',
  notified_roles TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------
-- 4. Indexes
-- -------------------------------------------
CREATE INDEX idx_agent_sessions_patient_status
  ON agent_sessions(patient_id, status);

CREATE INDEX idx_agent_sessions_name_created
  ON agent_sessions(agent_name, created_at DESC);

CREATE INDEX idx_agent_outputs_patient_created
  ON agent_outputs(patient_id, created_at DESC);

CREATE INDEX idx_agent_outputs_type
  ON agent_outputs(output_type, created_at DESC);

CREATE INDEX idx_agent_alerts_patient_severity
  ON agent_alerts(patient_id, severity, created_at DESC);

CREATE INDEX idx_agent_alerts_unresolved
  ON agent_alerts(patient_id, resolved_at)
  WHERE resolved_at IS NULL;

-- -------------------------------------------
-- 5. Row Level Security
-- -------------------------------------------
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_alerts ENABLE ROW LEVEL SECURITY;

-- Agent sessions: viewable by care circle members
CREATE POLICY "Care circle can view agent sessions"
  ON agent_sessions FOR SELECT
  USING (patient_id IN (SELECT unnest(my_patient_ids())));

-- Agent outputs: viewable by care circle members
CREATE POLICY "Care circle can view agent outputs"
  ON agent_outputs FOR SELECT
  USING (patient_id IN (SELECT unnest(my_patient_ids())));

-- Agent alerts: viewable by care circle members
CREATE POLICY "Care circle can view agent alerts"
  ON agent_alerts FOR SELECT
  USING (patient_id IN (SELECT unnest(my_patient_ids())));

-- Writes are done via service role client (bypasses RLS)
-- No INSERT/UPDATE policies needed for authenticated users

-- -------------------------------------------
-- 6. Updated_at trigger (reuse existing function)
-- -------------------------------------------
-- agent_sessions doesn't need updated_at (status transitions tracked via started_at/completed_at)
-- agent_outputs and agent_alerts are append-only (no updates expected)
