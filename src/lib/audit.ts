import { isDemoMode, DEMO_PATIENT_ID } from '@/lib/supabase'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

export type AuditAction =
  | 'view_patient'
  | 'view_vitals'
  | 'view_medications'
  | 'view_insurance'
  | 'view_providers'
  | 'view_incidents'
  | 'view_log_entry'
  | 'view_vault'
  | 'add_member'
  | 'add_event'
  | 'add_log_entry'
  | 'add_post'
  | 'check_in'
  | 'check_out'
  | 'mark_notification_read'
  | 'export_data'

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
    console.info('[AUDIT]', new Date().toISOString(), event)
    return
  }

  try {
    const { error } = await getSupabaseBrowserClient().from('audit_log').insert({
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
      // Never silently fail on audit logging — surface to monitoring
      console.error('[AUDIT ERROR] Failed to write audit event:', error, event)
    }
  } catch (err) {
    console.error('[AUDIT ERROR] Unexpected error writing audit event:', err, event)
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
