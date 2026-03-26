'use client'

import { Bell, BellOff } from 'lucide-react'

interface ReminderSelectProps {
  value?: number
  onChange: (minutes: number | undefined) => void
  className?: string
}

const reminderOptions = [
  { value: undefined, label: 'No reminder' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
]

export default function ReminderSelect({
  value,
  onChange,
  className = '',
}: ReminderSelectProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-warm-700 mb-1">
        Reminder
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {value ? (
            <Bell className="h-4 w-4 text-primary-500" />
          ) : (
            <BellOff className="h-4 w-4 text-warm-400" />
          )}
        </div>
        <select
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value
            onChange(val ? parseInt(val) : undefined)
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
        >
          {reminderOptions.map((option) => (
            <option key={option.label} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// Helper to format reminder time
export function formatReminderTime(minutes: number): string {
  if (minutes === 1440) return '1 day before'
  if (minutes >= 60) return `${minutes / 60} hour${minutes > 60 ? 's' : ''} before`
  return `${minutes} minutes before`
}

// Request browser notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Show a notification
export function showNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
    })
  }
}
