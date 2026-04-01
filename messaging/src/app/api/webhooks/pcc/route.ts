// src/app/api/webhooks/pcc/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processPccEvent } from '@/lib/pcc'
import crypto from 'crypto'
import { z } from 'zod'

const PccWebhookSchema = z.object({
  eventId:    z.string().min(1, 'eventId is required'),
  eventType:  z.string().min(1, 'eventType is required'),
  patientId:  z.string().min(1, 'patientId is required'),
  occurredAt: z.string().optional(),
  details:    z.record(z.unknown()).optional(),
}).passthrough()

export async function POST(req: NextRequest) {
  // Verify PCC webhook signature (HMAC-SHA256)
  const rawBody = await req.text()
  const signature = req.headers.get('x-pcc-signature') ?? ''
  const secret = process.env.PCC_WEBHOOK_SECRET!

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  if (signature !== expected && process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Validate payload structure
  const parsed = PccWebhookSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid webhook payload', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const pccEventId = parsed.data.eventId

  // Store raw webhook event
  await prisma.pccWebhookEvent.upsert({
    where: { pccEventId },
    update: {},
    create: {
      pccEventId,
      eventType: parsed.data.eventType,
      payload: payload as any,
      processed: false,
    },
  })

  // Process asynchronously (in production: use a queue like AWS SQS)
  // For MVP, process inline
  await processPccEvent(pccEventId)

  return NextResponse.json({ received: true })
}
