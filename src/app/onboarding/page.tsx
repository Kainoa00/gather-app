'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { isDemoMode } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────

interface FacilityDetails {
  name: string
  address: string
  phone: string
  size: string
}

interface FirstResident {
  name: string
  dob: string
  roomNumber: string
  diagnosis: string
}

interface StaffInvite {
  email: string
  role: string
}

const SIZES = ['1-25 beds', '26-50 beds', '51-100 beds', '100+ beds']
const ROLES = ['Admin', 'Nurse', 'CNA', 'Activities Director', 'Family Member']

// ── Component ──────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1
  const [facility, setFacility] = useState<FacilityDetails>({
    name: '',
    address: '',
    phone: '',
    size: SIZES[0],
  })

  // Step 2
  const [resident, setResident] = useState<FirstResident>({
    name: '',
    dob: '',
    roomNumber: '',
    diagnosis: '',
  })

  // Step 3
  const [staffInvites, setStaffInvites] = useState<StaffInvite[]>([
    { email: '', role: ROLES[0] },
  ])

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function addStaffRow() {
    setStaffInvites((prev) => [...prev, { email: '', role: ROLES[0] }])
  }

  function updateStaffRow(index: number, field: keyof StaffInvite, value: string) {
    setStaffInvites((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  function removeStaffRow(index: number) {
    setStaffInvites((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleComplete() {
    if (submitting) return
    setSubmitError(null)

    // Always cache what the user entered so /app can show a welcome toast
    // and the Settings tab can reflect their facility name even when demo
    // data is layered underneath.
    try {
      localStorage.setItem(
        'demo_onboarding',
        JSON.stringify({
          facilityName: facility.name || 'Sunrise Care Facility',
          residentName: resident.name || 'Kenji Shintaku',
          completedAt: new Date().toISOString(),
        }),
      )
    } catch {
      // localStorage unavailable (SSR/private browsing) — proceed anyway
    }

    // In demo mode there is no authenticated Supabase session to write
    // against. Skip the API call and land directly in /app with the
    // localStorage hint.
    if (isDemoMode) {
      router.push('/app')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility, resident, staffInvites }),
      })
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({ error: null }))) as {
          error?: string
        }
        throw new Error(error || `Request failed with ${res.status}`)
      }
      router.push('/app')
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Could not complete setup. Check your connection and try again.',
      )
      setSubmitting(false)
    }
  }

  // ── Shared field styles ──────────────────────────────────────────
  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border text-sm'
  const inputStyle = {
    borderColor: 'var(--navy-200)',
    color: 'var(--navy-800)',
  }
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--navy-700)' }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
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

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  background: s <= step ? 'var(--primary-600)' : 'var(--navy-200)',
                  color: s <= step ? '#fff' : 'var(--navy-600)',
                }}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className="w-10 h-0.5 rounded"
                  style={{
                    background: s < step ? 'var(--primary-600)' : 'var(--navy-200)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-center mb-6" style={{ color: 'var(--navy-400)' }}>
          Step {step} of 3
        </p>

        {/* Card */}
        <div className="card-glass p-8">
          {/* ── Step 1: Facility Details ─────────────────── */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--navy-800)' }}>
                Facility Details
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--navy-600)' }}>
                Tell us about your care facility.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="facilityName" className={labelClass} style={labelStyle}>
                    Facility name
                  </label>
                  <input
                    id="facilityName"
                    type="text"
                    required
                    value={facility.name}
                    onChange={(e) => setFacility({ ...facility, name: e.target.value })}
                    placeholder="Sunrise Senior Living"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="facilityAddress" className={labelClass} style={labelStyle}>
                    Address
                  </label>
                  <input
                    id="facilityAddress"
                    type="text"
                    required
                    value={facility.address}
                    onChange={(e) => setFacility({ ...facility, address: e.target.value })}
                    placeholder="123 Care Lane, City, ST 12345"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="facilityPhone" className={labelClass} style={labelStyle}>
                    Phone
                  </label>
                  <input
                    id="facilityPhone"
                    type="tel"
                    required
                    value={facility.phone}
                    onChange={(e) => setFacility({ ...facility, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="facilitySize" className={labelClass} style={labelStyle}>
                    Facility size
                  </label>
                  <select
                    id="facilitySize"
                    value={facility.size}
                    onChange={(e) => setFacility({ ...facility, size: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  >
                    {SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="btn-primary w-full text-center mt-6"
              >
                Continue
              </button>
            </>
          )}

          {/* ── Step 2: First Resident ──────────────────── */}
          {step === 2 && (
            <>
              <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--navy-800)' }}>
                Add First Resident
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--navy-600)' }}>
                Add a resident to get started. You can add more later.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="residentName" className={labelClass} style={labelStyle}>
                    Full name
                  </label>
                  <input
                    id="residentName"
                    type="text"
                    required
                    value={resident.name}
                    onChange={(e) => setResident({ ...resident, name: e.target.value })}
                    placeholder="Margaret Johnson"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="residentDob" className={labelClass} style={labelStyle}>
                    Date of birth
                  </label>
                  <input
                    id="residentDob"
                    type="date"
                    required
                    value={resident.dob}
                    onChange={(e) => setResident({ ...resident, dob: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="residentRoom" className={labelClass} style={labelStyle}>
                    Room number
                  </label>
                  <input
                    id="residentRoom"
                    type="text"
                    required
                    value={resident.roomNumber}
                    onChange={(e) => setResident({ ...resident, roomNumber: e.target.value })}
                    placeholder="204A"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="residentDiagnosis" className={labelClass} style={labelStyle}>
                    Primary diagnosis
                  </label>
                  <input
                    id="residentDiagnosis"
                    type="text"
                    value={resident.diagnosis}
                    onChange={(e) => setResident({ ...resident, diagnosis: e.target.value })}
                    placeholder="Alzheimer's, Diabetes, etc."
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 text-center text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1 text-center"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Invite Staff ────────────────────── */}
          {step === 3 && (
            <>
              <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--navy-800)' }}>
                Invite Staff
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--navy-600)' }}>
                Invite your team members. You can skip this and do it later.
              </p>

              <div className="space-y-3">
                {staffInvites.map((invite, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={invite.email}
                        onChange={(e) => updateStaffRow(i, 'email', e.target.value)}
                        placeholder="colleague@facility.com"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <select
                      value={invite.role}
                      onChange={(e) => updateStaffRow(i, 'role', e.target.value)}
                      className="px-3 py-2.5 rounded-xl border text-sm shrink-0"
                      style={inputStyle}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {staffInvites.length > 1 && (
                      <button
                        onClick={() => removeStaffRow(i)}
                        className="p-2.5 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors shrink-0"
                        aria-label="Remove row"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addStaffRow}
                className="text-sm font-medium mt-3 hover:underline"
                style={{ color: 'var(--primary-600)' }}
              >
                + Add another
              </button>

              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-4">{submitError}</p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="btn-secondary flex-1 text-center text-sm disabled:opacity-60"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className="btn-primary flex-1 text-center disabled:opacity-60"
                >
                  {submitting ? 'Setting up…' : 'Finish setup'}
                </button>
              </div>

              <button
                onClick={handleComplete}
                disabled={submitting}
                className="w-full text-center text-sm mt-3 hover:underline disabled:opacity-60"
                style={{ color: 'var(--navy-400)' }}
              >
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
