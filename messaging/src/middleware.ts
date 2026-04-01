import { NextRequest, NextResponse } from 'next/server'

// Lightweight auth gate — checks for a session cookie.
// In production, replace with NextAuth middleware or a JWT check.
// Webhook routes are exempted (they verify signatures themselves).

const PUBLIC_PATHS = ['/api/webhooks/', '/api/health']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow webhook endpoints (they have their own signature auth)
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // For MVP demo: allow all requests when DEMO_MODE is set
  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.next()
  }

  // Check for session cookie (NextAuth sets next-auth.session-token)
  const session = req.cookies.get('next-auth.session-token') ?? req.cookies.get('__Secure-next-auth.session-token')
  if (!session) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // For pages, redirect to login (placeholder until NextAuth is configured)
    return NextResponse.redirect(new URL('/api/health', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
