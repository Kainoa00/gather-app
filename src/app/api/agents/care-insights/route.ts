/**
 * POST /api/agents/care-insights
 *
 * Managed Agent: Generates AI-powered daily care digests for each patient.
 * Replaces the basic HTML table digest with rich, analyzed insights.
 *
 * Trigger: Vercel Cron (daily at 6:00 AM) or manual
 * Auth: Bearer CRON_SECRET
 */

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isDemoMode } from '@/lib/supabase'
import { fetchAllPatientIds, fetchFullPatientContext, fetchPrimaryMembers } from '@/lib/agents/data-fetcher'
import { sanitizePatientContext, validateSanitization } from '@/lib/agents/phi-sanitizer'
import { createAgentSession, completeAgentSession, failAgentSession, storeAgentOutput } from '@/lib/agents/output-store'
import { runAgentWithJsonOutput } from '@/lib/agents/managed-runner'
import { CARE_INSIGHTS_SYSTEM_PROMPT, buildCareInsightsMessage } from '@/lib/agents/prompts/care-insights'
import type { CareInsightsOutput } from '@/lib/agents/types'

export const maxDuration = 120 // Allow up to 2 minutes for multi-patient processing

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
      sent: 0,
      skipped: 0,
      message: 'Demo mode — care insights agent not run',
    })
  }

  // --- Validate env ---
  const agentId = process.env.ANTHROPIC_AGENT_INSIGHTS_ID
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID

  if (!agentId || !environmentId) {
    console.error('[care-insights] Missing ANTHROPIC_AGENT_INSIGHTS_ID or ANTHROPIC_ENVIRONMENT_ID')
    return NextResponse.json(
      { error: 'Agent not configured. Run scripts/setup-agents.ts first.' },
      { status: 500 }
    )
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const resend = resendApiKey ? new Resend(resendApiKey) : null

  // --- Process each patient ---
  const patientIds = await fetchAllPatientIds()
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const patientId of patientIds) {
    try {
      // 1. Fetch patient context
      const rawContext = await fetchFullPatientContext(patientId)
      if (!rawContext) {
        skipped++
        continue
      }

      // 2. Check for log entries (skip if no activity)
      if (rawContext.logs.length === 0) {
        skipped++
        continue
      }

      // 3. Sanitize PHI
      const sanitized = sanitizePatientContext(
        rawContext.patient,
        rawContext.logs,
        rawContext.wellness
      )

      const warnings = validateSanitization(sanitized)
      if (warnings.length > 0) {
        console.warn(`[care-insights] PHI warnings for patient ${patientId}:`, warnings)
      }

      // 4. Create tracking session
      const session = await createAgentSession({
        agentName: 'care_insights',
        agentType: 'managed',
        patientId,
        triggerType: 'cron',
        inputSummary: `${rawContext.logs.length} log entries, ${rawContext.wellness.length} wellness days`,
      })

      if (!session) {
        errors.push(`Failed to create session for patient ${patientId}`)
        skipped++
        continue
      }

      // 5. Run Managed Agent
      const message = buildCareInsightsMessage(sanitized)

      const { result, sessionId: anthropicSessionId, tokenUsage } = await runAgentWithJsonOutput<CareInsightsOutput>({
        agentId,
        environmentId,
        title: `Care Insights — ${sanitized.firstName} — ${new Date().toISOString().split('T')[0]}`,
        message,
      })

      if (!result) {
        await failAgentSession(session.id, 'Failed to parse agent output as JSON')
        errors.push(`Failed to parse output for patient ${patientId}`)
        skipped++
        continue
      }

      // 6. Determine overall severity
      const hasCritical = result.concerns.some((c) => c.severity === 'critical')
      const hasWarning = result.concerns.some((c) => c.severity === 'warning')
      const severity = hasCritical ? 'critical' : hasWarning ? 'warning' : 'info'

      // 7. Build email HTML
      const emailHtml = buildDigestEmail(sanitized.firstName, result, severity as 'info' | 'warning' | 'critical')

      // 8. Store output
      await storeAgentOutput({
        sessionId: session.id,
        patientId,
        outputType: 'digest',
        title: `Daily Care Digest — ${sanitized.firstName}`,
        contentJson: result as unknown as Record<string, unknown>,
        contentHtml: emailHtml,
        severity: severity as 'info' | 'warning' | 'critical',
      })

      // 9. Complete tracking session
      await completeAgentSession(session.id, tokenUsage)

      // 10. Send emails to primary family members
      if (resend) {
        const members = await fetchPrimaryMembers(patientId)
        for (const member of members) {
          try {
            const subjectSuffix = hasCritical ? ' — Action Needed' : hasWarning ? ' — Attention' : ''
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'CareBridge Connect <onboarding@resend.dev>',
              to: [member.email],
              subject: `Care Insights for ${sanitized.firstName}${subjectSuffix}`,
              html: emailHtml,
            })
            sent++
          } catch (err) {
            console.error(`[care-insights] Failed to send to ${member.email}:`, err)
            skipped++
          }
        }
      } else {
        console.log('[care-insights] RESEND_API_KEY not configured — skipping email')
        skipped++
      }
    } catch (err) {
      console.error(`[care-insights] Error processing patient ${patientId}:`, err)
      errors.push(`Error for patient ${patientId}: ${err instanceof Error ? err.message : String(err)}`)
      skipped++
    }
  }

  return NextResponse.json({
    sent,
    skipped,
    patientsProcessed: patientIds.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}

// -------------------------------------------
// Email Template Builder
// -------------------------------------------

function buildDigestEmail(
  firstName: string,
  insights: CareInsightsOutput,
  severity: 'info' | 'warning' | 'critical'
): string {
  const severityColors = {
    info: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444',
  }

  const trajectoryEmoji = {
    improving: '\u2197\uFE0F',
    stable: '\u27A1\uFE0F',
    declining: '\u2198\uFE0F',
  }

  const highlightsHtml = insights.highlights
    .map((h) => `<li style="margin:4px 0;color:#1e293b;">\u2705 <strong>${h.title}</strong> — ${h.detail}</li>`)
    .join('')

  const concernsHtml = insights.concerns
    .map((c) => {
      const icon = c.severity === 'critical' ? '\uD83D\uDEA8' : c.severity === 'warning' ? '\u26A0\uFE0F' : '\u2139\uFE0F'
      const color = severityColors[c.severity as keyof typeof severityColors]
      return `<li style="margin:4px 0;color:#1e293b;">${icon} <strong style="color:${color};">${c.title}</strong> — ${c.detail}</li>`
    })
    .join('')

  const talkingPointsHtml = insights.familyTalkingPoints
    .map((tp) => `<li style="margin:4px 0;color:#1e293b;">\uD83D\uDCAC ${tp}</li>`)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1B4798;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">CareBridge Connect</h1>
              <p style="margin:4px 0 0;color:#93c5fd;font-size:14px;">Daily Care Insights ${trajectoryEmoji[insights.trends.trajectory]} ${insights.trends.trajectory}</p>
            </td>
          </tr>

          <!-- Assessment -->
          <tr>
            <td style="padding:24px 32px 16px;">
              <p style="margin:0;color:#1e293b;font-size:16px;line-height:1.6;">${insights.overallAssessment}</p>
            </td>
          </tr>

          <!-- Highlights -->
          ${highlightsHtml ? `
          <tr>
            <td style="padding:8px 32px;">
              <h2 style="margin:0 0 8px;color:#1B4798;font-size:16px;">Highlights</h2>
              <ul style="margin:0;padding-left:20px;list-style:none;">${highlightsHtml}</ul>
            </td>
          </tr>` : ''}

          <!-- Concerns -->
          ${concernsHtml ? `
          <tr>
            <td style="padding:8px 32px;">
              <h2 style="margin:0 0 8px;color:#1B4798;font-size:16px;">Items to Watch</h2>
              <ul style="margin:0;padding-left:20px;list-style:none;">${concernsHtml}</ul>
            </td>
          </tr>` : ''}

          <!-- Trends -->
          <tr>
            <td style="padding:8px 32px;">
              <h2 style="margin:0 0 8px;color:#1B4798;font-size:16px;">7-Day Trends</h2>
              <p style="margin:0 0 4px;color:#475569;font-size:14px;line-height:1.5;"><strong>Vitals:</strong> ${insights.trends.vitalsSummary}</p>
              <p style="margin:0 0 4px;color:#475569;font-size:14px;line-height:1.5;"><strong>Mood:</strong> ${insights.trends.moodSummary}</p>
              <p style="margin:0 0 4px;color:#475569;font-size:14px;line-height:1.5;"><strong>Activity:</strong> ${insights.trends.activitySummary}</p>
            </td>
          </tr>

          <!-- Talking Points -->
          ${talkingPointsHtml ? `
          <tr>
            <td style="padding:8px 32px;">
              <h2 style="margin:0 0 8px;color:#1B4798;font-size:16px;">Conversation Ideas for Your Next Visit</h2>
              <ul style="margin:0;padding-left:20px;list-style:none;">${talkingPointsHtml}</ul>
            </td>
          </tr>` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding:24px 32px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1B4798;border-radius:6px;">
                    <a href="https://carebridgeconnect.ai/app"
                       style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      View Full Details
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td style="padding:16px 32px;background-color:#f1f5f9;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;font-style:italic;">
                This digest is AI-generated and is not medical advice. Consult the care team for clinical interpretation.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                Automated care insights from CareBridge Connect.
                <a href="https://carebridgeconnect.ai/app/settings" style="color:#64748b;">Manage preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}
