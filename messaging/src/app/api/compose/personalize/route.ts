import { NextRequest, NextResponse } from 'next/server'
import { personalizeMessages, ContactForPersonalization } from '@/lib/ai/personalize'
import { applyRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const PersonalizeSchema = z.object({
  baseMessage: z.string().min(1).max(2000),
  contacts: z.array(z.object({
    contactId: z.string(),
    contactName: z.string(),
    relationship: z.string(),
    residentFirstName: z.string(),
    residentLastName: z.string(),
  })).min(1).max(100),
})

export async function POST(req: NextRequest) {
  const rateLimited = applyRateLimit(req, 'personalize', 5, 60000)
  if (rateLimited) return rateLimited

  const body = await req.json()
  const parsed = PersonalizeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const messages = await personalizeMessages(parsed.data.baseMessage, parsed.data.contacts)
    return NextResponse.json({ messages })
  } catch (err) {
    console.error('[compose/personalize] Error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: 'Failed to personalize messages' }, { status: 500 })
  }
}
