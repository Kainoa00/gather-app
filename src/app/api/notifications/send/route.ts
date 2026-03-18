import { NextResponse } from 'next/server'

interface NotificationBody {
  recipientEmail: string
  recipientName: string
  patientName: string
  notificationType: string
  message: string
}

export async function POST(request: Request) {
  let body: NotificationBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { recipientEmail, recipientName, patientName, notificationType, message } = body

  // Validate required fields
  if (!recipientEmail || !recipientName || !patientName || !notificationType || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // TODO: Wire to Twilio for SMS
  // TODO: Wire to Resend for email delivery

  console.log('[notifications/send] Notification queued:', {
    recipientEmail,
    recipientName,
    patientName,
    notificationType,
    message,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json({ success: true, queued: true })
}
