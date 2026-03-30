'use client'

import Image from 'next/image'
import {
  Calendar,
  Users,
  Shield,
  Home,
  ClipboardList,
  Settings,
  LogOut,
  LayoutGrid,
} from 'lucide-react'
import { UserRole } from '@/types'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole?: UserRole
  onSignOut?: () => void
}

const baseNavItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'log', label: 'Care Log', icon: ClipboardList },
  { id: 'circle', label: 'Circle', icon: Users },
  { id: 'vault', label: 'Vault', icon: Shield },
]

// NOTE: The bottom tab bar overlaps the main content area on mobile.
// Add `pb-16 md:pb-0` to the main content container in the parent layout
// (e.g., src/app/app/page.tsx) to prevent content from being hidden behind the tab bar.

export default function Navigation({ activeTab, onTabChange, userRole, onSignOut }: NavigationProps) {
  const navItems = (() => {
    const items = [...baseNavItems]
    if (userRole === 'admin') {
      items.push({ id: 'residents', label: 'Residents', icon: LayoutGrid })
      items.push({ id: 'settings', label: 'Settings', icon: Settings })
    } else if (userRole === 'nurse') {
      items.push({ id: 'residents', label: 'Patients', icon: LayoutGrid })
    }
    return items
  })()

  return (
    <>
      {/* Top Navigation Bar (desktop + mobile logo) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => onTabChange('landing')}
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <Image
                  src="/logos/Logo 1 (color).png"
                  alt="CareBridge Connect"
                  width={180}
                  height={50}
                  className="h-10 w-auto"
                  priority
                />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200
                      ${isActive
                        ? 'text-primary-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : ''}`} />
                    {item.label}
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />
                    )}
                  </button>
                )
              })}
              {onSignOut && (
                <button onClick={onSignOut} className="ml-4 p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors duration-200 ${
                  isActive ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
