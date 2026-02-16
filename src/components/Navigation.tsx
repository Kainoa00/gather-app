'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Calendar,
  Users,
  Shield,
  Activity,
  Menu,
  X,
  Heart,
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
    <nav className="glass-strong sticky top-0 z-50 border-b border-white/40">
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
              const isLog = item.id === 'log'
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive
                      ? isLog
                        ? 'bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 shadow-soft'
                        : 'bg-primary-100 text-primary-700 shadow-soft'
                      : 'text-navy-600 hover:bg-cream-100 hover:text-navy-800'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : ''}`} />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-navy-600 hover:bg-cream-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-100/50 bg-white/95 backdrop-blur-xl animate-slide-down">
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
                    flex items-center w-full gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-navy-600 hover:bg-cream-100'
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
