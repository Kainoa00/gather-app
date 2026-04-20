/**
 * POST /api/agents/shift-report
 *
 * Managed Agent: Generates SBAR-format shift handoff reports.
 *
 * Trigger: Vercel Cron at shift boundaries (7:00, 15:00, 23:00) or manual
 * Auth: Bearer CRON_SECRET (cron) or patient context (manual)
 */

import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/supabase'
import {
  fetchAllPatientIds,
  fetchPatientById,
  fetchLogEntries,
} from '@/lib/agents/data-fetcher'
import { sanitizePatientContext } from '@/lib/agents/phi-sanitizer'
import {
  createAgentSession,
  completeAgentSession,
  failAgentSession,
  storeAgentOutput,
} from '@/lib/agents/output-store'
import { runAgentWithJsonOutput } from '@/lib/agents/managed-runner'
import {
  buildShiftReportMessage,
  getCurrentShiftWindow,
} from '@/lib/agents/prompts/shift-report'
import type { ShiftReportOutput } from '@/lib/agents/types'

export const maxDuration = 120

export async function POST(request: Request) {
  // --- Auth ---
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // --- Demo mode ---
  if (isDemoMode) {
    return NextResponse.json({
      reports: 0,
      message: 'Demo mode — shift report agent not run',
    })
  }

  // --- Validate env ---
  const agentId = process.env.ANTHROPIC_AGENT_SHIFT_REPORT_ID
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID

  if (!agentId || !environmentId) {
    console.error('[shift-report] Missing agent configuration')
    return NextResponse.json(
      { error: 'Agent not configured. Run scripts/setup-agents.ts first.' },
      { status: 500 }
    )
  }

  // --- Determine shift window ---
  let shiftStart: Date
  let shiftEnd: Date
  let shiftName: string
  let triggerType: 'cron' | 'manual' = 'cron'
  let targetPatientId: string | null = null

  // Check for manual trigger with specific patient + time range
  try {
    const body = await request.json().catch(() => null)
    if (body?.patientId) {
      targetPatientId = body.patientId
      triggerType = 'manual'
    }
    if (body?.shiftStart && body?.shiftEnd) {
      shiftStart = new Date(body.shiftStart)
      shiftEnd = new Date(body.shiftEnd)
      shiftName = body.shiftName || 'Custom'
    } else {
      const currentShift = getCurrentShiftWindow()
      shiftStart = currentShift.start
      shiftEnd = currentShift.end
      shiftName = currentShift.shiftName
    }
  } catch {
    const currentShift = getCurrentShiftWindow()
    shiftStart = currentShift.start
    shiftEnd = currentShift.end
    shiftName = currentShift.shiftName
  }

  // --- Determine patients to process ---
  const patientIds = targetPatientId
    ? [targetPatientId]
    : await fetchAllPatientIds()

  let reportsGenerated = 0
  let skipped = 0
  const errors: string[] = []

  for (const patientId of patientIds) {
    try {
      // 1. Fetch patient info
      const patient = await fetchPatientById(patientId)
      if (!patient) {
        skipped++
        continue
      }

      // 2. Fetch log entries for the shift window
      const logs = await fetchLogEntries(patientId, shiftStart, shiftEnd)

      if (logs.length === 0) {
        skipped++
        continue
      }

      // 3. Sanitize data
      const sanitized = sanitizePatientContext(
        {
          name: patient.name,
          roomNumber: patient.room_number,
          primaryDiagnosis: patient.primary_diagnosis,
        },
        logs,
        [] // No wellness trend needed for shift reports
      )

      // 4. Create tracking session
      const session = await createAgentSession({
        agentName: 'shift_report',
        agentType: 'managed',
        patientId,
        triggerType,
        inputSummary: `${shiftName} shift (${shiftStart.toISOString()} - ${shiftEnd.toISOString()}), ${logs.length} entries`,
      })

      if (!session) {
        errors.push(`Failed to create session for patient ${patientId}`)
        skipped++
        continue
      }

      // 5. Run Managed Agent
      const message = buildShiftReportMessage(
        sanitized.firstName,
        sanitized.roomNumber,
        shiftStart.toISOString(),
        shiftEnd.toISOString(),
        sanitized.recentLogs
      )

      const { result, tokenUsage } = await runAgentWithJsonOutput<ShiftReportOutput>({
        agentId,
        environmentId,
        title: `${shiftName} Shift Report — ${sanitized.firstName} — ${new Date().toISOString().split('T')[0]}`,
        message,
      })

      if (!result) {
        await failAgentSession(session.id, 'Failed to parse agent output as JSON')
        errors.push(`Failed to parse output for patient ${patientId}`)
        skipped++
        continue
      }

      // 6. Determine severity based on incidents
      const hasHighIncident = result.incidents?.some((i) => i.severity === 'high')
      const hasAnyIncident = result.incidents?.length > 0
      const severity = hasHighIncident ? 'critical' : hasAnyIncident ? 'warning' : 'info'

      // 7. Store output
      await storeAgentOutput({
        sessionId: session.id,
        patientId,
        outputType: 'report',
        title: `${shiftName} Shift Report — ${sanitized.firstName}`,
        contentJson: result as unknown as Record<string, unknown>,
        severity: severity as 'info' | 'warning' | 'critical',
      })

      // 8. Complete session
      await completeAgentSession(session.id, tokenUsage)
      reportsGenerated++
    } catch (err) {
      console.error(`[shift-report] Error processing patient ${patientId}:`, err)
      errors.push(`Error for ${patientId}: ${err instanceof Error ? err.message : String(err)}`)
      skipped++
    }
  }

  return NextResponse.json({
    reports: reportsGenerated,
    skipped,
    shift: shiftName,
    window: { start: shiftStart!.toISOString(), end: shiftEnd!.toISOString() },
    errors: errors.length > 0 ? errors : undefined,
  })
}
