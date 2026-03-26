import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user?.email) {
      // Check if this user is already in any care circle (i.e. not a new user)
      const db = createServiceRoleClient()
      const { data: membership } = await db
        .from('care_circle_members')
        .select('id')
        .eq('email', data.user.email)
        .limit(1)
        .maybeSingle()

      const destination = membership ? '/app' : '/onboarding'
      return NextResponse.redirect(new URL(destination, requestUrl.origin))
    }
  }

  // Auth failed — redirect back to login with error flag
  return NextResponse.redirect(
    new URL('/auth/login?error=true', requestUrl.origin)
  )
}
