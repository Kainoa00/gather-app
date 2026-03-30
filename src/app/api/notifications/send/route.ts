import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { escapeHtml } from '@/lib/utils'

interface NotificationBody {
  recipientEmail: string
  recipientName: string
  patientName: string
  notificationType: string
  message: string
  facilityName?: string
  senderName?: string
}

export async function POST(request: Request) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: NotificationBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    recipientEmail,
    recipientName,
    patientName,
    notificationType,
    message,
    facilityName,
    senderName,
  } = body

  // Validate required fields
  if (!recipientEmail || !recipientName || !patientName || !notificationType || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log('[notifications/send] RESEND_API_KEY not set — skipping email (type:', notificationType, ')')
    return NextResponse.json({ success: true, queued: false })
  }

  const resend = new Resend(apiKey)

  const senderLabel = senderName || 'A care team member'

  // Escape all user-supplied values before embedding in HTML
  const safeRecipient = escapeHtml(recipientName)
  const safeSender = escapeHtml(senderLabel)
  const safePatient = escapeHtml(patientName)
  const safeMessage = escapeHtml(message)
  // Strip newlines/control characters to prevent email header injection
  const subject = `Update about ${patientName} \u2014 ${notificationType}`.replace(/[\r\n\x00-\x1f]/g, '')

  const htmlBody = `
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
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                CareBridge Connect
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:16px;line-height:1.6;">
                Hi ${safeRecipient},
              </p>
              <p style="margin:0 0 16px;color:#1e293b;font-size:16px;line-height:1.6;">
                ${safeSender} posted an update about <strong>${safePatient}</strong>:
              </p>
              <blockquote style="margin:0 0 24px;padding:16px 20px;border-left:4px solid #1B4798;background-color:#f1f5f9;border-radius:0 4px 4px 0;">
                <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">
                  ${safeMessage}
                </p>
              </blockquote>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#1B4798;border-radius:6px;">
                    <a href="https://carebridgeconnect.ai/app"
                       style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      Log in to see the full update
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.5;">
                You're receiving this because you're a member of ${safePatient}'s care circle on CareBridge Connect.
              </p>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                If you no longer wish to receive these notifications, you can update your preferences in your
                <a href="https://carebridgeconnect.ai/app/settings" style="color:#64748b;">account settings</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: [recipientEmail],
      subject,
      html: htmlBody,
    })

    if (error) {
      console.error('[notifications/send] Resend error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[notifications/send] Email sent (id:', data?.id, ', type:', notificationType, ')')

    return NextResponse.json({
      success: true,
      queued: false,
      emailId: data?.id,
    })
  } catch (err) {
    console.error('[notifications/send] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
