'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('loading')
    setErrorMessage('')

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setFormState('error')
        return
      }

      setFormState('success')
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setFormState('error')
    }
  }

  function handleDemoLogin() {
    document.cookie = 'demo=true; path=/; max-age=86400; samesite=lax'
    window.location.href = '/app'
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
          {formState === 'success' ? (
            /* ── Success state ─────────────────────────────── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{ background: 'var(--primary-50)' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                     stroke="var(--primary-600)">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--navy-800)' }}>
                Check your email
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--navy-600)' }}>
                We sent a magic link to <strong>{email}</strong>.
                Click the link in the email to sign in.
              </p>
              <button
                onClick={() => setFormState('idle')}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--primary-600)' }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Email form ────────────────────────────────── */
            <>
              <h1 className="text-2xl font-semibold text-center mb-1"
                  style={{ color: 'var(--navy-800)' }}>
                Sign in
              </h1>
              <p className="text-sm text-center mb-6"
                 style={{ color: 'var(--navy-600)' }}>
                Enter your email to receive a magic link
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@facility.com"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{
                      borderColor: 'var(--navy-200)',
                      color: 'var(--navy-800)',
                    }}
                  />
                </div>

                {formState === 'error' && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  className="btn-primary w-full text-center disabled:opacity-60"
                >
                  {formState === 'loading' ? 'Sending link...' : 'Send magic link'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: 'var(--navy-200)' }} />
                <span className="text-xs" style={{ color: 'var(--navy-400)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--navy-200)' }} />
              </div>

              {/* Demo link */}
              <button
                onClick={handleDemoLogin}
                className="btn-secondary w-full text-center text-sm"
              >
                Use demo account
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--navy-400)' }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
