import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the app dashboard on successful auth
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    }
  }

  // Auth failed — redirect back to login with error flag
  return NextResponse.redirect(
    new URL('/auth/login?error=true', requestUrl.origin)
  )
}
