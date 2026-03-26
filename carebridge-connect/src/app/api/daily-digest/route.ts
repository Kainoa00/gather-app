import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { escapeHtml } from '@/lib/utils'

interface DigestEntry {
  patient_id: string
  created_at: string
  category: string
  title: string
}

interface PrimaryMember {
  patient_id: string
  name: string
  email: string
}

export async function GET(request: Request) {
  // Auth check — require CRON_SECRET in production
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ sent: 0, skipped: 0, message: 'RESEND_API_KEY not configured' })
  }

  // Use service-role client — this is a server-side cron job, not a user request
  const supabase = createServiceRoleClient()
  const resend = new Resend(apiKey)

  // Fetch all primary-role family members
  const { data: primaryMembers, error: membersError } = await supabase
    .from('care_circle_members')
    .select('patient_id, name, email, role')
    .eq('role', 'primary')

  if (membersError) {
    console.error('[daily-digest] Error fetching members:', membersError)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }

  if (!primaryMembers || primaryMembers.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Group members by patient_id
  const membersByPatient = new Map<string, PrimaryMember[]>()
  let skipped = 0
  for (const member of primaryMembers as PrimaryMember[]) {
    if (!member.email) {
      skipped++
      continue
    }
    const existing = membersByPatient.get(member.patient_id) || []
    existing.push(member)
    membersByPatient.set(member.patient_id, existing)
  }

  const patientIds = Array.from(membersByPatient.keys())

  // Batch fetch all log entries for all patients in a single query (fixes N+1)
  const { data: allEntries, error: entriesError } = await supabase
    .from('log_entries')
    .select('patient_id, created_at, category, title')
    .in('patient_id', patientIds)
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })

  if (entriesError) {
    console.error('[daily-digest] Error fetching entries:', entriesError)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }

  // Group entries by patient_id in memory
  const entriesByPatient = new Map<string, DigestEntry[]>()
  for (const entry of (allEntries ?? []) as DigestEntry[]) {
    const arr = entriesByPatient.get(entry.patient_id) || []
    arr.push(entry)
    entriesByPatient.set(entry.patient_id, arr)
  }

  // Send emails concurrently (instead of sequentially)
  const emailPromises: Promise<{ success: boolean }>[] = []

  for (const patientId of patientIds) {
    const members = membersByPatient.get(patientId)!
    const entries = entriesByPatient.get(patientId)
    if (!entries || entries.length === 0) {
      skipped += members.length
      continue
    }

    // Build digest HTML with escaped values
    const entriesHtml = entries
      .map((e) => {
        const time = new Date(e.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;white-space:nowrap;">${time}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1B4798;font-size:14px;font-weight:600;">${escapeHtml(e.category)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${escapeHtml(e.title)}</td>
        </tr>`
      })
      .join('')

    for (const member of members) {
      const safeName = escapeHtml(member.name)
      const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#1B4798;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">CareBridge Connect</h1>
              <p style="margin:4px 0 0;color:#93c5fd;font-size:14px;">Daily Care Digest</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:16px;line-height:1.6;">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 20px;color:#1e293b;font-size:16px;line-height:1.6;">
                Here's a summary of ${entries.length} care update${entries.length !== 1 ? 's' : ''} from the last 24 hours:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
                <tr style="background-color:#f1f5f9;">
                  <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:13px;font-weight:600;">Time</th>
                  <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:13px;font-weight:600;">Category</th>
                  <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:13px;font-weight:600;">Title</th>
                </tr>
                ${entriesHtml}
              </table>
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
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                This is an automated daily digest from CareBridge Connect.
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

      emailPromises.push(
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'CareBridge Connect <onboarding@resend.dev>',
          to: [member.email],
          subject: `Daily Care Digest \u2014 ${entries.length} update${entries.length !== 1 ? 's' : ''}`,
          html,
        }).then(() => ({ success: true as const }))
          .catch((err) => {
            console.error(`[daily-digest] Failed to send to ${member.email}:`, err)
            return { success: false as const }
          })
      )
    }
  }

  // Send all emails concurrently
  const results = await Promise.all(emailPromises)
  const sent = results.filter(r => r.success).length
  skipped += results.filter(r => !r.success).length

  return NextResponse.json({ sent, skipped })
}
