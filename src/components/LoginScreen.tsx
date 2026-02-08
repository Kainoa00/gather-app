'use client'

import { useState } from 'react'
import { Heart, Shield, ShieldCheck, Activity, Users, Check, Mail, Lock, ArrowRight, Sparkles, Link2 } from 'lucide-react'
import { UserRole } from '@/types'

interface LoginScreenProps {
  onLogin: (user: { id: string; name: string; role: UserRole; relationship: string }) => void
}

const demoUsers = [
  {
    id: '1',
    name: 'Toshio Shintaku',
    role: 'primary' as const,
    relationship: 'Brother (Healthcare POA)',
    subtitle: 'Primary (POA)',
    initials: 'TS',
    icon: ShieldCheck,
    gradientFrom: 'from-navy-400',
    gradientTo: 'to-navy-600',
    bgLight: 'bg-navy-50',
    borderActive: 'border-navy-400',
    badgeColor: 'bg-navy-100 text-navy-700',
    shadowColor: 'rgba(30, 41, 59, 0.2)',
  },
  {
    id: 'a1',
    name: 'Mary Wilson',
    role: 'admin' as const,
    relationship: 'Facility Administrator',
    subtitle: 'Admin',
    initials: 'MW',
    icon: Shield,
    gradientFrom: 'from-lavender-400',
    gradientTo: 'to-lavender-600',
    bgLight: 'bg-lavender-50',
    borderActive: 'border-lavender-400',
    badgeColor: 'bg-lavender-100 text-lavender-700',
    shadowColor: 'rgba(151, 117, 250, 0.2)',
  },
  {
    id: 'n1',
    name: 'Jane Doe',
    role: 'nurse' as const,
    relationship: 'Primary Nurse',
    subtitle: 'Nursing Staff',
    initials: 'JD',
    icon: Activity,
    gradientFrom: 'from-mint-400',
    gradientTo: 'to-mint-600',
    bgLight: 'bg-mint-50',
    borderActive: 'border-mint-400',
    badgeColor: 'bg-mint-100 text-mint-700',
    shadowColor: 'rgba(34, 197, 94, 0.2)',
  },
  {
    id: '2',
    name: 'Kainoa Shintaku',
    role: 'family' as const,
    relationship: 'Nephew',
    subtitle: 'Family Member',
    initials: 'KS',
    icon: Users,
    gradientFrom: 'from-peach-400',
    gradientTo: 'to-peach-600',
    bgLight: 'bg-peach-50',
    borderActive: 'border-peach-400',
    badgeColor: 'bg-peach-100 text-peach-700',
    shadowColor: 'rgba(255, 138, 101, 0.2)',
  },
]

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleSelectUser = (user: typeof demoUsers[0]) => {
    setSelectedUser(user.id)
    setIsLoggingIn(true)

    // Brief delay for the selection animation before transitioning
    setTimeout(() => {
      onLogin({
        id: user.id,
        name: user.name,
        role: user.role,
        relationship: user.relationship,
      })
    }, 600)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Cosmetic only — always log in as Toshio (primary)
    setIsLoggingIn(true)
    setTimeout(() => {
      onLogin({
        id: '1',
        name: 'Toshio Shintaku',
        role: 'primary',
        relationship: 'Brother (Healthcare POA)',
      })
    }, 600)
  }

  return (
    <div className="min-h-screen gradient-mesh-bg flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 blob-lavender rounded-full animate-blob"></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 blob-peach rounded-full animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 blob-lavender rounded-full animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div
          className="card-glass p-8 sm:p-10 animate-scale-in"
          style={{ animationDuration: '0.4s' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 animate-slide-up">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender-400 to-peach-400 rounded-2xl blur-lg opacity-50 animate-pulse-soft"></div>
              <div className="relative p-4 bg-gradient-to-br from-lavender-500 to-lavender-600 rounded-2xl shadow-float">
                <Link2 className="h-7 w-7 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="gradient-text">CareBridge</span>
              <span className="text-navy-400 text-lg sm:text-xl ml-1.5">Connect</span>
            </h1>
            <p className="mt-2 text-navy-500 text-sm text-center">
              {showEmailForm ? 'Sign in to your account' : 'Choose your role to continue'}
            </p>
          </div>

          {!showEmailForm ? (
            <>
              {/* Role Selection Cards */}
              <div className="space-y-3">
                {demoUsers.map((user, index) => {
                  const Icon = user.icon
                  const isSelected = selectedUser === user.id

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      disabled={isLoggingIn}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300
                        animate-slide-up
                        ${isSelected
                          ? `${user.borderActive} ${user.bgLight} scale-[0.98]`
                          : 'border-transparent bg-white/60 hover:bg-white/80 hover:border-lavender-200 hover:shadow-soft-lg hover:-translate-y-0.5'
                        }
                        ${isLoggingIn && !isSelected ? 'opacity-40 pointer-events-none' : ''}
                      `}
                      style={{ animationDelay: `${150 + index * 80}ms`, animationFillMode: 'backwards' }}
                    >
                      {/* Avatar */}
                      <div className={`relative shrink-0 w-12 h-12 bg-gradient-to-br ${user.gradientFrom} ${user.gradientTo} rounded-xl flex items-center justify-center shadow-sm`}>
                        <span className="text-white font-bold text-sm">{user.initials}</span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                            <Check className="h-3 w-3 text-lavender-600" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-navy-900 text-sm">{user.name}</p>
                        <p className="text-navy-500 text-xs">{user.relationship}</p>
                      </div>

                      {/* Role Badge + Icon */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${user.badgeColor}`}>
                          {user.subtitle}
                        </span>
                        <Icon className="h-4 w-4 text-navy-400" />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6 animate-slide-up" style={{ animationDelay: '450ms', animationFillMode: 'backwards' }}>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lavender-200 to-transparent"></div>
                <span className="text-xs text-navy-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-lavender-200 to-transparent"></div>
              </div>

              {/* Email Toggle */}
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-navy-600 hover:text-lavender-700 hover:bg-lavender-50 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}
              >
                <Mail className="h-4 w-4" />
                Sign in with email
              </button>
            </>
          ) : (
            /* Email/Password Form */
            <form onSubmit={handleEmailLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-navy-600 mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@carebridge.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/70 border border-lavender-200 rounded-xl text-sm text-navy-900 placeholder:text-navy-400 focus:border-lavender-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-600 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-white/70 border border-lavender-200 rounded-xl text-sm text-navy-900 placeholder:text-navy-400 focus:border-lavender-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-center text-xs text-navy-500 hover:text-lavender-600 transition-colors py-2"
              >
                Back to role selection
              </button>
            </form>
          )}

          {/* Footer Tag */}
          <div className="mt-6 pt-5 border-t border-lavender-100/60 flex items-center justify-center gap-2 animate-slide-up" style={{ animationDelay: '550ms', animationFillMode: 'backwards' }}>
            <Sparkles className="h-3.5 w-3.5 text-lavender-400" />
            <p className="text-xs text-navy-400">
              Demo mode — no real credentials required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
