// Simple in-memory rate limiter for MVP
// In production, replace with Redis-backed solution (Upstash)

const store = new Map<string, { count: number; resetAt: number }>()
const MAX_ENTRIES = 10000

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()

  // Cleanup if store gets too large
  if (store.size > MAX_ENTRIES) {
    store.forEach((v, k) => {
      if (v.resetAt < now) store.delete(k)
    })
  }

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: limit - entry.count }
}
