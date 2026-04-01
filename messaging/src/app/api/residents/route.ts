// src/app/api/residents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const facilityId = searchParams.get('facilityId')
  if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })

  const residents = await prisma.resident.findMany({
    where: { facilityId, status: 'ACTIVE' },
    include: { contacts: { include: { consents: true } } },
    orderBy: { lastName: 'asc' },
  })

  return NextResponse.json(residents)
}

const CreateResidentSchema = z.object({
  facilityId:   z.string(),
  firstName:    z.string().min(1),
  lastName:     z.string().min(1),
  dateOfBirth:  z.string(),
  roomNumber:   z.string(),
  admittedAt:   z.string(),
  pccPatientId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = rateLimit(`residents:${ip}`, 10, 60000) // 10 per minute
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const body = await req.json()
  const parsed = CreateResidentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const resident = await prisma.resident.create({
    data: {
      ...parsed.data,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      admittedAt:  new Date(parsed.data.admittedAt),
    },
  })

  return NextResponse.json(resident, { status: 201 })
}
