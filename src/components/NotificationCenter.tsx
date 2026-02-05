'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Bell,
  Heart,
  Pill,
  Smile,
  AlertTriangle,
  Users,
  FileText,
  Check,
  X,
  Filter,
} from 'lucide-react'
import { Notification, NotificationType } from '@/types'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NotificationCenterProps {
  notifications: Notification[]
  currentUserId: string
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onNavigate?: (sourceType: string, sourceId: string) => void
}

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

type FilterTab = 'all' | 'log' | 'visits'

const notificationTypeConfig: Record<
  NotificationType,
  { icon: typeof Heart; colorClass: string; bgClass: string }
> = {
  vitals: {
    icon: Heart,
    colorClass: 'text-red-500',
    bgClass: 'bg-red-50',
  },
  medication: {
    icon: Pill,
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-50',
  },
  mood: {
    icon: Smile,
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-50',
  },
  incident: {
    icon: AlertTriangle,
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-50',
  },
  visit: {
    icon: Users,
    colorClass: 'text-lavender-600',
    bgClass: 'bg-lavender-50',
  },
  document: {
    icon: FileText,
    colorClass: 'text-mint-500',
    bgClass: 'bg-mint-100',
  },
  general: {
    icon: Bell,
    colorClass: 'text-navy-600',
    bgClass: 'bg-cream-100',
  },
}

function groupLabel(date: Date): 'TODAY' | 'YESTERDAY' | 'EARLIER' {
  const d = new Date(date)
  if (isToday(d)) return 'TODAY'
  if (isYesterday(d)) return 'YESTERDAY'
  return 'EARLIER'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NotificationCenter({
  notifications,
  currentUserId,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  // ---- Derived data -------------------------------------------------------

  const unreadCount = useMemo(
    () =>
      notifications.filter((n) => !n.readBy.includes(currentUserId)).length,
    [notifications, currentUserId],
  )

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]

    if (activeFilter === 'log') {
      filtered = filtered.filter((n) => n.sourceType === 'log_entry')
    } else if (activeFilter === 'visits') {
      filtered = filtered.filter(
        (n) => n.sourceType === 'visit' || n.sourceType === 'event',
      )
    }

    // Sort descending by createdAt
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return filtered
  }, [notifications, activeFilter])

  const grouped = useMemo(() => {
    const groups: { label: 'TODAY' | 'YESTERDAY' | 'EARLIER'; items: Notification[] }[] = []
    const map = new Map<string, Notification[]>()

    for (const n of filteredNotifications) {
      const label = groupLabel(n.createdAt)
      if (!map.has(label)) {
        map.set(label, [])
      }
      map.get(label)!.push(n)
    }

    // Maintain ordering: TODAY -> YESTERDAY -> EARLIER
    const order: ('TODAY' | 'YESTERDAY' | 'EARLIER')[] = ['TODAY', 'YESTERDAY', 'EARLIER']
    for (const label of order) {
      const items = map.get(label)
      if (items && items.length > 0) {
        groups.push({ label, items })
      }
    }

    return groups
  }, [filteredNotifications])

  // ---- Click-outside detection --------------------------------------------

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  // ---- Handlers -----------------------------------------------------------

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readBy.includes(currentUserId)) {
      onMarkAsRead(notification.id)
    }
    if (onNavigate && notification.sourceType && notification.sourceId) {
      onNavigate(notification.sourceType, notification.sourceId)
    }
    setIsOpen(false)
  }

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead()
  }

  // ---- Render helpers -----------------------------------------------------

  const isUnread = (notification: Notification) =>
    !notification.readBy.includes(currentUserId)

  // ---- JSX ----------------------------------------------------------------

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl text-navy-600 hover:bg-cream-100 transition-all duration-300 focus:outline-none"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-soft ring-2 ring-white animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] glass-strong rounded-2xl shadow-glass-lg z-50 animate-scale-in origin-top-right overflow-hidden"
          role="dialog"
          aria-label="Notification center"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-lavender-100/50">
            <h2 className="text-lg font-bold text-navy-900">Notifications</h2>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-lavender-600 hover:bg-lavender-50 rounded-xl transition-all duration-300"
                  title="Mark all as read"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-cream-100 rounded-lg transition-all duration-300"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-5 py-3 border-b border-lavender-100/50">
            <Filter className="h-3.5 w-3.5 text-navy-400 mr-1" />
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'log', label: 'Log' },
                { key: 'visits', label: 'Visits' },
              ] as { key: FilterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                  activeFilter === tab.key
                    ? 'bg-lavender-100 text-lavender-700 shadow-soft'
                    : 'text-navy-500 hover:bg-cream-100 hover:text-navy-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5">
                <div className="p-4 bg-cream-100 rounded-2xl mb-3">
                  <Bell className="h-7 w-7 text-navy-300" />
                </div>
                <p className="text-sm font-medium text-navy-500">
                  No notifications
                </p>
                <p className="text-xs text-navy-400 mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.label}>
                  {/* Day Group Header */}
                  <div className="sticky top-0 z-10 px-5 py-2 bg-cream-100/90 backdrop-blur-sm">
                    <span className="text-[11px] font-semibold tracking-wider text-navy-400 uppercase">
                      {group.label}
                    </span>
                  </div>

                  {/* Notification Items */}
                  {group.items.map((notification) => {
                    const config = notificationTypeConfig[notification.type]
                    const Icon = config.icon
                    const unread = isUnread(notification)

                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left flex items-start gap-3 px-5 py-3.5 transition-all duration-200 hover:bg-lavender-50/60 ${
                          unread ? 'bg-lavender-50/30' : ''
                        }`}
                      >
                        {/* Unread Indicator */}
                        <div className="flex-shrink-0 pt-2">
                          <div
                            className={`h-2 w-2 rounded-full transition-all ${
                              unread
                                ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                                : 'bg-transparent'
                            }`}
                          />
                        </div>

                        {/* Type Icon */}
                        <div
                          className={`flex-shrink-0 h-9 w-9 rounded-xl ${config.bgClass} flex items-center justify-center`}
                        >
                          <Icon className={`h-4 w-4 ${config.colorClass}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-snug ${
                              unread
                                ? 'font-semibold text-navy-900'
                                : 'font-medium text-navy-700'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-navy-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {notification.sourceType && (
                              <span className="text-[11px] font-medium text-lavender-500 capitalize">
                                {notification.sourceType.replace('_', ' ')}
                              </span>
                            )}
                            {notification.sourceType && (
                              <span className="text-navy-300 text-[11px]">
                                &middot;
                              </span>
                            )}
                            <span className="text-[11px] text-navy-400">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && grouped.length > 0 && (
            <div className="border-t border-lavender-100/50 px-5 py-3">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-lavender-600 hover:text-lavender-700 hover:bg-lavender-50 rounded-xl transition-all duration-300"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
