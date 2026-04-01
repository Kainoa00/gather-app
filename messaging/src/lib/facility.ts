import { prisma } from './prisma'

/**
 * Get the current facility ID.
 * TODO: When auth is implemented, derive from session.user.facilityId
 * For now, uses the first facility in the database (single-tenant MVP).
 */
export async function getFacilityId(): Promise<string> {
  const facility = await prisma.facility.findFirst({ select: { id: true } })
  if (!facility) throw new Error('No facility configured. Run: npm run db:seed')
  return facility.id
}

export async function getFacility() {
  const facility = await prisma.facility.findFirst()
  if (!facility) throw new Error('No facility configured. Run: npm run db:seed')
  return facility
}
