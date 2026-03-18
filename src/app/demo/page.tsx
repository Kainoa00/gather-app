'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react'

// ─── Form state shape ─────────────────────────────────────────────────────────
interface FormData {
  name: string
  email: string
  facilityName: string
  role: string
  residentCount: string
  notes: string
}

const initialForm: FormData = {
  name: '',
  email: '',
  facilityName: '',
  role: '',
  residentCount: '',
  notes: '',
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-navy-700 mb-1.5"
    >
      {children}
      {optional && (
        <span className="text-navy-400 font-normal ml-1">(optional)</span>
      )}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-navy-200 px-4 py-3 text-sm min-h-[44px] text-navy-800 placeholder:text-navy-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow duration-150'

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isMounted = useRef(true)

  useEffect(() => () => { isMounted.current = false }, [])

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!isMounted.current) return

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setSubmitError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      setLoading(false)
      setSubmitted(true)
    } catch {
      if (!isMounted.current) return
      setSubmitError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="gradient-mesh-bg min-h-screen py-12 px-4 sm:px-6 flex flex-col items-center justify-start">

      {/* Back link */}
      <div className="w-full max-w-lg mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-navy-500 hover:text-navy-800 text-sm transition-colors duration-150"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to CareBridge Connect
        </Link>
      </div>

      {/* Card */}
      <div className="card-glass rounded-2xl p-8 sm:p-12 w-full max-w-lg">

        {/* Logo */}
        <Image
          src="/logos/Logo 1 (color).png"
          alt="CareBridge Connect"
          width={200}
          height={55}
          className="h-12 w-auto mx-auto mb-8"
          priority
        />

        {/* ── Success state ── */}
        {submitted ? (
          <div className="flex flex-col items-center text-center gap-5 py-6">
            <div className="bg-mint-100 rounded-full p-4">
              <CheckCircle2
                size={40}
                className="text-mint-600"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-navy-900 text-2xl font-bold">
              You&apos;re on the list!
            </h1>
            <p className="text-navy-600 text-sm leading-relaxed max-w-sm">
              Thank you! We&apos;ll reach out within 1 business day to schedule
              your demo.
            </p>
            <Link
              href="/"
              className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors duration-150"
            >
              ← Return to homepage
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h1 className="text-navy-900 text-2xl font-bold text-center mb-2">
              Schedule Your Demo
            </h1>
            <p className="text-navy-600 text-center text-sm mb-8 leading-relaxed">
              We&apos;ll give you a 30-minute walkthrough tailored to your
              facility type. No commitment required.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

              {/* Your Name */}
              <div>
                <FieldLabel htmlFor="name">Your Name</FieldLabel>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Sarah Johnson"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Email Address */}
              <div>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="sarah@yourfacility.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Facility Name */}
              <div>
                <FieldLabel htmlFor="facilityName">Facility Name</FieldLabel>
                <input
                  id="facilityName"
                  name="facilityName"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="Sunrise Senior Living"
                  value={form.facilityName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Your Role */}
              <div>
                <FieldLabel htmlFor="role">Your Role</FieldLabel>
                <select
                  id="role"
                  name="role"
                  required
                  value={form.role}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select your role…
                  </option>
                  <option value="Facility Director">Facility Director</option>
                  <option value="Director of Nursing">
                    Director of Nursing
                  </option>
                  <option value="VP/Regional Operations">
                    VP/Regional Operations
                  </option>
                  <option value="Administrator">Administrator</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Number of Residents */}
              <div>
                <FieldLabel htmlFor="residentCount">
                  Number of Residents
                </FieldLabel>
                <select
                  id="residentCount"
                  name="residentCount"
                  required
                  value={form.residentCount}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select range…
                  </option>
                  <option value="Under 30">Under 30</option>
                  <option value="30–75">30–75</option>
                  <option value="75–150">75–150</option>
                  <option value="150–300">150–300</option>
                  <option value="300+">300+</option>
                </select>
              </div>

              {/* Notes (optional) */}
              <div>
                <FieldLabel htmlFor="notes" optional>
                  Anything specific you&apos;d like to see?
                </FieldLabel>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="e.g., How family notifications work, HIPAA controls, EHR integration…"
                  value={form.notes}
                  onChange={handleChange}
                  className={`${inputClass} min-h-[88px] resize-none`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed w-full text-white rounded-xl py-3.5 font-semibold min-h-[48px] text-sm transition-all duration-150 hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 mt-1"
              >
                {loading ? 'Sending…' : 'Request My Demo'}
              </button>

              {submitError && (
                <p className="text-red-600 text-sm mt-2">{submitError}</p>
              )}

            </form>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <Lock size={12} className="text-navy-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-navy-500 text-xs">
                We typically respond within 1 business day. Your information is
                never shared.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
