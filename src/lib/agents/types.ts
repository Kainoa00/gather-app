// =============================================
// Agent System Types
// =============================================

export type AgentName =
  | 'care_insights'
  | 'wellness_monitor'
  | 'family_update'
  | 'care_plan'
  | 'compliance_audit'

export type AgentType = 'managed' | 'tool_use'
export type AgentTrigger = 'cron' | 'event' | 'manual'
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type OutputType = 'digest' | 'alert' | 'report' | 'recommendation' | 'audit_finding'
export type AlertType = 'vitals_anomaly' | 'mood_decline' | 'missed_medication' | 'incident_pattern' | 'compliance_gap'
export type Severity = 'info' | 'warning' | 'critical'

// -------------------------------------------
// Database Row Types
// -------------------------------------------

export interface AgentSessionRow {
  id: string
  agent_name: AgentName
  agent_type: AgentType
  patient_id: string | null
  anthropic_session_id: string | null
  trigger_type: AgentTrigger
  status: AgentStatus
  started_at: string
  completed_at: string | null
  error_message: string | null
  input_summary: string | null
  token_usage: TokenUsage
  created_at: string
}

export interface AgentOutputRow {
  id: string
  session_id: string | null
  patient_id: string
  output_type: OutputType
  title: string
  content_json: Record<string, unknown>
  content_html: string | null
  severity: Severity
  acknowledged_by: string[]
  expires_at: string | null
  created_at: string
}

export interface AgentAlertRow {
  id: string
  output_id: string | null
  patient_id: string
  alert_type: AlertType
  severity: Severity
  message: string
  data_points: Record<string, unknown>
  notified_roles: string[]
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

// -------------------------------------------
// Token Usage
// -------------------------------------------

export interface TokenUsage {
  input_tokens?: number
  output_tokens?: number
  cost_estimate_usd?: number
}

// -------------------------------------------
// Managed Agent Configuration
// -------------------------------------------

export interface ManagedAgentConfig {
  agentId: string
  environmentId: string
  model?: string
  systemPrompt?: string
}

export interface AgentSessionRequest {
  agentName: AgentName
  agentType: AgentType
  patientId: string
  triggerType: AgentTrigger
  inputSummary?: string
}

// -------------------------------------------
// Care Insights Output
// -------------------------------------------

export interface CareInsightsOutput {
  overallAssessment: string
  highlights: Array<{
    title: string
    detail: string
  }>
  concerns: Array<{
    title: string
    detail: string
    severity: Severity
  }>
  trends: {
    trajectory: 'improving' | 'stable' | 'declining'
    vitalsSummary: string
    moodSummary: string
    activitySummary: string
  }
  familyTalkingPoints: string[]
  nurseNotes: string
}

// -------------------------------------------
// Sanitized Patient Context (PHI-minimized)
// -------------------------------------------

export interface SanitizedPatientContext {
  firstName: string
  roomNumber: string
  primaryDiagnosis?: string
  recentLogs: SanitizedLogEntry[]
  wellnessTrend: SanitizedWellnessDay[]
}

export interface SanitizedLogEntry {
  category: string
  title: string
  notes?: string
  createdAt: string
  enteredByRole: string
  vitals?: {
    bloodPressureSystolic?: number
    bloodPressureDiastolic?: number
    heartRate?: number
    temperature?: number
    oxygenSaturation?: number
    weight?: number
    respiratoryRate?: number
  }
  medication?: {
    medicationName: string
    dosage: string
    route?: string
  }
  activity?: {
    activityType: string
    description: string
    duration?: number
    participation?: string
  }
  mood?: {
    mood: string
    alertness: string
    appetite: string
    painLevel?: number
    notes?: string
  }
  incident?: {
    incidentType: string
    severity: string
    description: string
    actionTaken: string
  }
}

export interface SanitizedWellnessDay {
  date: string
  overallScore: number
  moodAM?: string
  moodPM?: string
  appetite?: string
  painLevel?: number
  socialEngagement?: string
  therapySessions?: number
  visitCount?: number
}

// -------------------------------------------
// Agent Event Types (from Managed Agents API)
// -------------------------------------------

export interface AgentMessageEvent {
  type: 'agent.message'
  content: Array<{ type: 'text'; text: string }>
}

export interface AgentToolUseEvent {
  type: 'agent.tool_use'
  name: string
  input: Record<string, unknown>
}

export interface SessionStatusIdleEvent {
  type: 'session.status_idle'
}

export type AgentStreamEvent =
  | AgentMessageEvent
  | AgentToolUseEvent
  | SessionStatusIdleEvent
