// src/app/api/webhooks/pcc/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processPccEvent } from '@/lib/pcc'
import crypto from 'crypto'

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

  const pccEventId = payload.eventId as string
  if (!pccEventId) return new NextResponse('Missing eventId', { status: 400 })

  // Store raw webhook event
  await prisma.pccWebhookEvent.upsert({
    where: { pccEventId },
    update: {},
    create: {
      pccEventId,
      eventType: payload.eventType as string,
      payload: payload as any,
      processed: false,
    },
  })

  // Process asynchronously (in production: use a queue like AWS SQS)
  // For MVP, process inline
  await processPccEvent(pccEventId)

  return NextResponse.json({ received: true })
}
