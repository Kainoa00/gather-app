'use server'
import { prisma } from '@/lib/prisma'
import { DSRStatus, DSRType, AuditActor } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function updateDSRStatus(dsrId: string, status: DSRStatus, notes?: string) {
  await prisma.dataSubjectRequest.update({
    where: { id: dsrId },
    data: {
      status,
      ...(notes ? { notes } : {}),
      ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
    },
  })
  revalidatePath('/dsr')
}

export async function createDSR(data: {
  facilityId: string
  requestType: DSRType
  requestorName: string
  requestorPhone?: string
  requestorEmail?: string
  residentName: string
  notes?: string
}) {
  await prisma.dataSubjectRequest.create({
    data: {
      ...data,
      receivedAt: new Date(),
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day SLA
    },
  })
  revalidatePath('/dsr')
}
