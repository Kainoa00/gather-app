import { supabase, isDemoMode, DEMO_PATIENT_ID } from '@/lib/supabase'

export type AuditAction =
  | 'view_patient'
  | 'view_vitals'
  | 'view_medications'
  | 'view_insurance'
  | 'view_providers'
  | 'view_incidents'
  | 'view_log_entry'
  | 'view_vault'
  | 'switch_resident'
  | 'switch_role'
  | 'open_chatbot'
  | 'add_member'
  | 'add_event'
  | 'add_log_entry'
  | 'add_post'
  | 'check_in'
  | 'check_out'
  | 'mark_notification_read'
  | 'export_data'
  // Agent audit actions
  | 'agent_execution'
  | 'agent_output_viewed'
  | 'agent_alert_acknowledged'
  | 'agent_alert_resolved'

export interface AuditEvent {
  patientId: string
  actorId: string
  actorName: string
  actorRole: string
  action: AuditAction
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

/**
 * Log a HIPAA audit event. In demo mode, logs to console only.
 * In production, persists to the audit_log table in Supabase.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  if (isDemoMode) {
    // In demo mode log only non-PHI metadata (IDs + action), never names or content
    console.info('[AUDIT]', new Date().toISOString(), {
      action: event.action,
      actorId: event.actorId,
      actorRole: event.actorRole,
      patientId: event.patientId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
    })
    return
  }

  try {
    const { error } = await supabase.from('audit_log').insert({
      patient_id: event.patientId,
      actor_id: event.actorId,
      actor_name: event.actorName,
      actor_role: event.actorRole,
      action: event.action,
      resource_type: event.resourceType ?? null,
      resource_id: event.resourceId ?? null,
      metadata: event.metadata ?? null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Log only IDs + action, never PHI content, even in error paths
      console.error('[AUDIT ERROR] Failed to write audit event:', error.message, {
        action: event.action,
        actorId: event.actorId,
        patientId: event.patientId,
      })
    }
  } catch (err) {
    console.error('[AUDIT ERROR] Unexpected error writing audit event:', err instanceof Error ? err.message : String(err), {
      action: event.action,
      actorId: event.actorId,
    })
  }
}

export const auditPatient = (
  actorId: string,
  actorName: string,
  actorRole: string,
  patientId: string = DEMO_PATIENT_ID
) =>
  logAuditEvent({
    patientId,
    actorId,
    actorName,
    actorRole,
    action: 'view_patient',
    resourceType: 'patient',
    resourceId: patientId,
  })

export const auditVaultAccess = (
  actorId: string,
  actorName: string,
  actorRole: string,
  section: string,
  patientId: string = DEMO_PATIENT_ID
) =>
  logAuditEvent({
    patientId,
    actorId,
    actorName,
    actorRole,
    action: 'view_vault',
    resourceType: 'vault',
    metadata: { section },
  })

export const auditLogEntryView = (
  actorId: string,
  actorName: string,
  actorRole: string,
  entryId: string,
  category: string,
  patientId: string = DEMO_PATIENT_ID
) =>
  logAuditEvent({
    patientId,
    actorId,
    actorName,
    actorRole,
    action: 'view_log_entry',
    resourceType: 'log_entry',
    resourceId: entryId,
    metadata: { category },
  })

// Generic helper for non-view actions (role switch, export, chatbot open).
// Fire-and-forget — do not block the UI on audit writes. Failures are
// logged inside logAuditEvent and never surfaced to the user.
export function auditAction(
  action: AuditAction,
  actorId: string,
  actorName: string,
  actorRole: string,
  patientId: string = DEMO_PATIENT_ID,
  metadata?: Record<string, unknown>,
): void {
  void logAuditEvent({
    patientId,
    actorId,
    actorName,
    actorRole,
    action,
    metadata,
  })
}
