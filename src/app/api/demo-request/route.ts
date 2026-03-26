import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml, getClientIp } from '@/lib/utils'

// Simple in-memory rate limiter — max 5 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

interface DemoRequestBody {
  name: string
  email: string
  facilityName: string
  role: string
  residentCount: string
  notes: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function buildTeamNotificationHtml(data: DemoRequestBody, timestamp: string): string {
  const safe = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    facilityName: escapeHtml(data.facilityName),
    role: escapeHtml(data.role),
    residentCount: escapeHtml(data.residentCount),
    notes: data.notes ? escapeHtml(data.notes) : '<em style="color:#999;">None provided</em>',
  }
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f9;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1e3a5f;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">New Demo Request</h1>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;border-bottom:1px solid #eef0f3;width:140px;">Name</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef0f3;">${safe.name}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;border-bottom:1px solid #eef0f3;">Email</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef0f3;"><a href="mailto:${safe.email}" style="color:#2563eb;">${safe.email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;border-bottom:1px solid #eef0f3;">Facility</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef0f3;">${safe.facilityName}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;border-bottom:1px solid #eef0f3;">Role</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef0f3;">${safe.role}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;border-bottom:1px solid #eef0f3;">Residents</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef0f3;">${safe.residentCount}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;border-bottom:1px solid #eef0f3;">Notes</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef0f3;">${safe.notes}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Submitted</td>
          <td style="padding:10px 12px;">${timestamp}</td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`
}

function buildConfirmationHtml(name: string): string {
  const safeName = escapeHtml(name)
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f9;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1e3a5f;padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">CareBridge Connect</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:18px;">Hi ${safeName},</h2>
      <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 16px;">
        Thank you for requesting a demo of CareBridge Connect! We're excited to show you how our platform can transform communication at your facility.
      </p>
      <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 8px;font-weight:600;">
        Here's what to expect:
      </p>
      <ul style="color:#444;font-size:14px;line-height:1.9;margin:0 0 24px;padding-left:20px;">
        <li>A member of our team will reach out within <strong>1 business day</strong></li>
        <li>We'll schedule a <strong>30-minute personalized walkthrough</strong> tailored to your facility</li>
        <li>No commitment required &mdash; just a conversation about your needs</li>
      </ul>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://carebridgeconnect.ai" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          Visit CareBridge Connect
        </a>
      </div>
      <p style="color:#888;font-size:12px;line-height:1.6;margin:24px 0 0;text-align:center;">
        If you have any questions in the meantime, reply to this email or reach us at kai@carebridgeconnect.ai.
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(request: Request) {
  const ip = getClientIp(request) ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: DemoRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, facilityName, role, residentCount, notes } = body

  // Validate required fields
  if (!name || !email || !facilityName || !role || !residentCount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Denver',
  })

  // Graceful degradation: if no API key, log and return success
  if (!process.env.RESEND_API_KEY) {
    console.log('[demo-request] RESEND_API_KEY not set — logging submission to console:')
    console.log({ name, email, facilityName, role, residentCount, notes, timestamp })
    return NextResponse.json({ success: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Send both emails concurrently
    await Promise.all([
      // Notification to CareBridge team
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: 'kai@carebridgeconnect.ai',
        subject: `New Demo Request — ${facilityName}`,
        html: buildTeamNotificationHtml(body, timestamp),
      }),
      // Confirmation to the prospect
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: email,
        subject: "Your CareBridge Connect demo request — we'll be in touch!",
        html: buildConfirmationHtml(name),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[demo-request] Resend error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
