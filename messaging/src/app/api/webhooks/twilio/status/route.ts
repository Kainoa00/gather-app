import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MessageStatus } from '@prisma/client'

// Twilio StatusCallback webhook — updates message delivery status
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const messageSid = formData.get('MessageSid') as string
  const messageStatus = formData.get('MessageStatus') as string

  if (!messageSid || !messageStatus) {
    return new NextResponse('Missing fields', { status: 400 })
  }

  const statusMap: Record<string, MessageStatus> = {
    delivered: MessageStatus.DELIVERED,
    undelivered: MessageStatus.FAILED,
    failed: MessageStatus.FAILED,
  }

  const newStatus = statusMap[messageStatus]
  if (!newStatus) {
    // Status like 'queued', 'sent', 'sending' — ignore, we already track SENT
    return new NextResponse('OK', { status: 200 })
  }

  await prisma.message.updateMany({
    where: { twilioSid: messageSid },
    data: {
      status: newStatus,
      ...(newStatus === MessageStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
      ...(newStatus === MessageStatus.FAILED ? { failedAt: new Date(), failureReason: `Twilio: ${messageStatus}` } : {}),
    },
  })
  // result.count === 0 means SID not found — that's fine, just return OK

  return new NextResponse('OK', { status: 200 })
}
