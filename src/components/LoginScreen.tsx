'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Building2, Heart, Stethoscope, Users, ArrowRight, Shield } from 'lucide-react'
import { UserRole } from '@/types'

const ROLES: { id: UserRole; label: string; description: string; icon: typeof Heart; color: string }[] = [
  { id: 'primary', label: 'Primary Family', description: 'Full access to all care updates', icon: Heart, color: 'text-rose-500 bg-rose-50' },
  { id: 'admin', label: 'Facility Admin', description: 'Manage staff, residents, reports', icon: Building2, color: 'text-primary-600 bg-primary-50' },
  { id: 'nurse', label: 'Care Staff', description: 'Log entries and care activities', icon: Stethoscope, color: 'text-green-600 bg-green-50' },
  { id: 'family', label: 'Family Member', description: 'View updates and communicate', icon: Users, color: 'text-purple-600 bg-purple-50' },
]

const DEMO_USERS: Record<UserRole, { id: string; name: string; relationship: string }> = {
  primary: { id: '1', name: 'Toshio Shintaku', relationship: 'Son' },
  admin: { id: 'a1', name: 'Mary Wilson', relationship: 'Facility Administrator' },
  nurse: { id: 'n1', name: 'Jane Doe', relationship: 'Primary Nurse' },
  family: { id: '2', name: 'Kainoa Shintaku', relationship: 'Nephew' },
}

interface LoginScreenProps {
  onLogin: (user: { id: string; name: string; role: UserRole; relationship: string }) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!selected || isLoading) return
    setIsLoading(true)
    // Simulate auth delay for UX polish
    await new Promise(r => setTimeout(r, 400))
    const user = DEMO_USERS[selected]
    onLogin({ ...user, role: selected })
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/logos/Logo 1 (color).png"
            alt="CareBridge Connect"
            width={180}
            height={48}
            className="h-9 w-auto brightness-0 invert"
          />
        </div>

        {/* Copy */}
        <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, margin: 0 }}>
            Connecting families with the people who care for them.
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, margin: 0, maxWidth: '28rem' }}>
            Real-time care updates, secure messaging, and transparent progress tracking — built for skilled nursing facilities.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem' }}>
            {[
              { number: '−60%', label: 'Family call volume' },
              { number: '2–3 hrs', label: 'Reclaimed per shift' },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>{s.number}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance footer */}
        <div className="relative z-10" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
          <Shield size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
          HIPAA Certified · SOC 2 Type II · 256-bit encryption
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:px-12 relative">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.5,
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white via-white/90 to-primary-50/20" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Mobile logo + tagline (left panel is hidden below lg) */}
          <div className="lg:hidden mb-6">
            <Image src="/logos/Logo 1 (color).png" alt="CareBridge Connect" width={160} height={40} className="h-8 w-auto mb-3" />
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Shield size={12} className="text-emerald-500 shrink-0" />
              HIPAA Certified · SOC 2 Type II
            </p>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Choose your view</h2>
            <p className="text-sm text-slate-500">Select a role to explore the demo</p>
          </div>

          {/* Role cards */}
          <div className="space-y-3 mb-8">
            {ROLES.map((role, i) => {
              const Icon = role.icon
              const isSelected = selected === role.id
              return (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  onClick={() => setSelected(role.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    isSelected
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${role.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{role.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{role.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Continue button */}
          <button
            onClick={handleLogin}
            disabled={!selected || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-navy-800 text-white px-6 py-4 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-800 focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue as {selected ? ROLES.find(r => r.id === selected)?.label : '...'}
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">
            This is a demo environment. No real patient data is used.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
