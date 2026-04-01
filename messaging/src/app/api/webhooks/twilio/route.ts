// src/app/api/webhooks/twilio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleInboundSMS } from '@/lib/sms'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  // Validate Twilio signature
  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url = process.env.TWILIO_WEBHOOK_URL!
  const body = await req.formData()
  const params = Object.fromEntries(body.entries()) as Record<string, string>

  const valid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  )

  if (!valid && process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from     = params['From']
  const bodyText = params['Body'] ?? ''
  const smsSid   = params['SmsSid'] ?? ''

  await handleInboundSMS({ from, body: bodyText, twilioSid: smsSid })

  // Respond with empty TwiML — no auto-reply
  return new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}
