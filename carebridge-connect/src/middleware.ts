import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Allow the auth callback through unconditionally ──────────────
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // ── Demo-mode escape hatch ───────────────────────────────────────
  const isDemoEnv = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const hasDemoCookie = request.cookies.get('demo')?.value === 'true'

  if (isDemoEnv || hasDemoCookie) {
    return NextResponse.next()
  }

  // ── Only protect /app routes ─────────────────────────────────────
  if (!pathname.startsWith('/app')) {
    return NextResponse.next()
  }

  // ── Supabase session check ───────────────────────────────────────
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          // Set cookie on the request so it is available to downstream handlers
          request.cookies.set({ name, value })
          // Set cookie on the response so it persists for the browser
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set(name, value, options as Record<string, string>)
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '' })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set(name, '', options as Record<string, string>)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match /app routes and /auth/callback.
     * Skip static files and Next.js internals.
     */
    '/app/:path*',
    '/auth/callback',
  ],
}
