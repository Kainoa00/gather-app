import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase, isDemoMode } from '@/lib/supabase'

interface DigestEntry {
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
  // Auth check — skip if CRON_SECRET is not set (local dev)
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (isDemoMode) {
    return NextResponse.json({ sent: 0, skipped: 0, message: 'Demo mode — no emails sent' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ sent: 0, skipped: 0, message: 'RESEND_API_KEY not configured' })
  }

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

  let sent = 0
  let skipped = 0

  // Group members by patient_id
  const membersByPatient = new Map<string, PrimaryMember[]>()
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
  for (const patientId of patientIds) {
    const members = membersByPatient.get(patientId)!

    // Fetch last 24 hours of log entries for this patient
    const { data: entries, error: entriesError } = await supabase
      .from('log_entries')
      .select('created_at, category, title')
      .eq('patient_id', patientId)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })

    if (entriesError) {
      console.error(`[daily-digest] Error fetching entries for patient ${patientId}:`, entriesError)
      skipped += members.length
      continue
    }

    if (!entries || entries.length === 0) {
      skipped += members.length
      continue
    }

    const typedEntries = entries as DigestEntry[]

    // Build digest HTML
    const entriesHtml = typedEntries
      .map((e) => {
        const time = new Date(e.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;white-space:nowrap;">${time}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1B4798;font-size:14px;font-weight:600;">${e.category}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${e.title}</td>
        </tr>`
      })
      .join('')

    // Send to each primary member for this patient
    for (const member of members) {
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
                Hi ${member.name},
              </p>
              <p style="margin:0 0 20px;color:#1e293b;font-size:16px;line-height:1.6;">
                Here's a summary of ${typedEntries.length} care update${typedEntries.length !== 1 ? 's' : ''} from the last 24 hours:
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

      try {
        await resend.emails.send({
          from: 'CareBridge Connect <onboarding@resend.dev>',
          to: [member.email],
          subject: `Daily Care Digest \u2014 ${typedEntries.length} update${typedEntries.length !== 1 ? 's' : ''}`,
          html,
        })
        sent++
      } catch (err) {
        console.error(`[daily-digest] Failed to send to ${member.email}:`, err)
        skipped++
      }
    }
  }

  return NextResponse.json({ sent, skipped })
}
