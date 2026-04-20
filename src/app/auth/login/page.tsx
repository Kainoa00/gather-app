'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { isDemoMode } from '@/lib/supabase'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

const DEMO_EMAIL = 'admin@carebridge.demo'
const DEMO_PASSWORD = 'carebridge123'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/app'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isDemoMode) {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        document.cookie = 'demo=true; path=/; max-age=86400; samesite=strict; secure'
        router.push(redirect)
      } else {
        setError('Invalid credentials. Please check your email and password.')
        setLoading(false)
      }
      return
    }

    try {
      const supabase = getSupabaseBrowserClient()
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 15_000),
      )
      const { error: authError } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeout,
      ])
      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes('invalid') || msg.includes('credentials')) {
          setError('Invalid email or password. Please try again.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
      } else {
        router.push(redirect)
      }
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === 'TIMEOUT'
      setError(
        isTimeout
          ? 'Sign-in is taking longer than expected. Check your connection and try again.'
          : 'Could not reach the sign-in service. Check your connection and try again.',
      )
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logos/Logo 1 (color).png"
            alt="CareBridge Connect"
            width={200}
            height={56}
            priority
          />
        </div>

        {/* Card */}
        <div className="card-glass p-8">
          <h1 className="text-2xl font-semibold text-center mb-1"
              style={{ color: 'var(--navy-800)' }}>
            Welcome back
          </h1>
          <p className="text-sm text-center mb-6"
             style={{ color: 'var(--navy-600)' }}>
            Sign in to your CareBridge account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--navy-700)' }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@facility.com"
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: error ? '#ef4444' : 'var(--navy-200)',
                  color: 'var(--navy-800)',
                  // @ts-expect-error CSS custom property
                  '--tw-ring-color': 'var(--primary-300)',
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--navy-700)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: error ? '#ef4444' : 'var(--navy-200)',
                  color: 'var(--navy-800)',
                  // @ts-expect-error CSS custom property
                  '--tw-ring-color': 'var(--primary-300)',
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--navy-400)' }}>
          By continuing you agree to our{' '}
          <span className="underline cursor-pointer">Terms of Service</span>
          {' '}and{' '}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
