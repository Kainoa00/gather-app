// Simple in-memory rate limiter for MVP
// In production, replace with Redis-backed solution (Upstash)

import { NextRequest, NextResponse } from 'next/server'

const store = new Map<string, { count: number; resetAt: number }>()
const MAX_ENTRIES = 10000

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()

  // Cleanup if store gets too large
  if (store.size > MAX_ENTRIES) {
    const toDelete: string[] = []
    store.forEach((v, k) => { if (v.resetAt < now) toDelete.push(k) })
    toDelete.forEach(k => store.delete(k))
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

export function applyRateLimit(req: NextRequest, prefix: string, limit = 10, windowMs = 60000): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = rateLimit(`${prefix}:${ip}`, limit, windowMs)
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  return null
}
