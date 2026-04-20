/**
 * Agent Output Store — Persist and retrieve agent outputs via service role client.
 *
 * All writes use the service role client (bypasses RLS).
 * Agent outputs are the structured results from AI agent sessions.
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import type {
  AgentSessionRow,
  AgentOutputRow,
  AgentAlertRow,
  AgentSessionRequest,
  AgentStatus,
  OutputType,
  Severity,
  AlertType,
  TokenUsage,
} from './types'

// -------------------------------------------
// Agent Sessions
// -------------------------------------------

export async function createAgentSession(
  request: AgentSessionRequest
): Promise<AgentSessionRow | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('agent_sessions')
    .insert({
      agent_name: request.agentName,
      agent_type: request.agentType,
      patient_id: request.patientId,
      trigger_type: request.triggerType,
      status: 'running' as AgentStatus,
      started_at: new Date().toISOString(),
      input_summary: request.inputSummary || null,
    })
    .select()
    .single()

  if (error) {
    console.error('[output-store] Error creating agent session:', error.message)
    return null
  }

  return data as AgentSessionRow
}

export async function updateAgentSession(
  sessionId: string,
  updates: {
    status?: AgentStatus
    anthropicSessionId?: string
    completedAt?: string
    errorMessage?: string
    tokenUsage?: TokenUsage
  }
) {
  const supabase = createServiceRoleClient()

  const updateData: Record<string, unknown> = {}
  if (updates.status) updateData.status = updates.status
  if (updates.anthropicSessionId) updateData.anthropic_session_id = updates.anthropicSessionId
  if (updates.completedAt) updateData.completed_at = updates.completedAt
  if (updates.errorMessage) updateData.error_message = updates.errorMessage
  if (updates.tokenUsage) updateData.token_usage = updates.tokenUsage

  const { error } = await supabase
    .from('agent_sessions')
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    console.error(`[output-store] Error updating session ${sessionId}:`, error.message)
  }
}

export async function completeAgentSession(
  sessionId: string,
  tokenUsage?: TokenUsage
) {
  await updateAgentSession(sessionId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    tokenUsage,
  })
}

export async function failAgentSession(
  sessionId: string,
  errorMessage: string
) {
  await updateAgentSession(sessionId, {
    status: 'failed',
    completedAt: new Date().toISOString(),
    errorMessage,
  })
}

// -------------------------------------------
// Agent Outputs
// -------------------------------------------

export async function storeAgentOutput(params: {
  sessionId: string | null
  patientId: string
  outputType: OutputType
  title: string
  contentJson: Record<string, unknown>
  contentHtml?: string
  severity?: Severity
  expiresAt?: string
}): Promise<AgentOutputRow | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('agent_outputs')
    .insert({
      session_id: params.sessionId,
      patient_id: params.patientId,
      output_type: params.outputType,
      title: params.title,
      content_json: params.contentJson,
      content_html: params.contentHtml || null,
      severity: params.severity || 'info',
      expires_at: params.expiresAt || null,
    })
    .select()
    .single()

  if (error) {
    console.error('[output-store] Error storing agent output:', error.message)
    return null
  }

  return data as AgentOutputRow
}

export async function fetchLatestOutput(
  patientId: string,
  outputType: OutputType
): Promise<AgentOutputRow | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('agent_outputs')
    .select('*')
    .eq('patient_id', patientId)
    .eq('output_type', outputType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // .single() throws when no rows found — that's okay
    if (error.code === 'PGRST116') return null
    console.error('[output-store] Error fetching latest output:', error.message)
    return null
  }

  return data as AgentOutputRow
}

export async function fetchOutputsByType(
  patientId: string,
  outputType: OutputType,
  limit: number = 10
): Promise<AgentOutputRow[]> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('agent_outputs')
    .select('*')
    .eq('patient_id', patientId)
    .eq('output_type', outputType)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[output-store] Error fetching outputs:', error.message)
    return []
  }

  return (data || []) as AgentOutputRow[]
}

// -------------------------------------------
// Agent Alerts
// -------------------------------------------

export async function storeAgentAlert(params: {
  outputId?: string
  patientId: string
  alertType: AlertType
  severity: Severity
  message: string
  dataPoints?: Record<string, unknown>
  notifiedRoles?: string[]
}): Promise<AgentAlertRow | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('agent_alerts')
    .insert({
      output_id: params.outputId || null,
      patient_id: params.patientId,
      alert_type: params.alertType,
      severity: params.severity,
      message: params.message,
      data_points: params.dataPoints || {},
      notified_roles: params.notifiedRoles || [],
    })
    .select()
    .single()

  if (error) {
    console.error('[output-store] Error storing agent alert:', error.message)
    return null
  }

  return data as AgentAlertRow
}

export async function fetchUnresolvedAlerts(
  patientId: string
): Promise<AgentAlertRow[]> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('agent_alerts')
    .select('*')
    .eq('patient_id', patientId)
    .is('resolved_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[output-store] Error fetching unresolved alerts:', error.message)
    return []
  }

  return (data || []) as AgentAlertRow[]
}

export async function resolveAlert(alertId: string, resolvedBy: string) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('agent_alerts')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq('id', alertId)

  if (error) {
    console.error(`[output-store] Error resolving alert ${alertId}:`, error.message)
  }
}
