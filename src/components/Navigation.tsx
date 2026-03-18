'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Calendar,
  Users,
  Shield,
  Menu,
  X,
  Home,
  ClipboardList,
} from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'log', label: 'Care Log', icon: ClipboardList },
  { id: 'circle', label: 'Circle', icon: Users },
  { id: 'vault', label: 'Vault', icon: Shield },
]

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
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
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-3 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`
                    flex items-center w-full gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200
                    ${isActive
                      ? 'text-primary-700 bg-primary-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
