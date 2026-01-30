'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Check,
  Plus,
  Stethoscope,
  Pill,
  Users,
  Home,
  X,
  Bell
} from 'lucide-react'
import { CalendarEvent, EventType } from '@/types'
import { format, isToday, isTomorrow, addDays, startOfWeek, endOfWeek } from 'date-fns'
import ReminderSelect, { formatReminderTime } from './ReminderSelect'

interface CareCalendarProps {
  events: CalendarEvent[]
  onClaimEvent: (eventId: string, userName: string) => void
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => void
}

const eventTypeConfig = {
  doctor_visit: {
    label: 'Doctor Visit',
    icon: Stethoscope,
    color: 'bg-primary-100 text-primary-700 border-primary-200',
    bgColor: 'bg-primary-50',
  },
  medication_refill: {
    label: 'Medication Refill',
    icon: Pill,
    color: 'bg-terracotta-100 text-terracotta-700 border-terracotta-200',
    bgColor: 'bg-terracotta-50',
  },
  social_activity: {
    label: 'Social Activity',
    icon: Users,
    color: 'bg-sage-100 text-sage-700 border-sage-200',
    bgColor: 'bg-sage-50',
  },
  family_visit: {
    label: 'Family Visit',
    icon: Home,
    color: 'bg-cream-200 text-warm-700 border-cream-300',
    bgColor: 'bg-cream-100',
  },
}

export default function CareCalendar({ events, onClaimEvent, onAddEvent }: CareCalendarProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unclaimed' | 'mine'>('all')
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'doctor_visit' as EventType,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    location: '',
    reminder: undefined as number | undefined,
  })

  const filteredEvents = events
    .filter((event) => {
      if (filter === 'unclaimed') return !event.claimedBy
      if (filter === 'mine') return event.claimedBy === '1' // Demo: user ID 1
      return true
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const unclaimedCount = events.filter((e) => !e.claimedBy).length

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEEE, MMM d')
  }

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      onAddEvent({
        ...newEvent,
        date: new Date(newEvent.date),
      })
      setNewEvent({
        title: '',
        description: '',
        type: 'doctor_visit',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        location: '',
        reminder: undefined,
      })
      setShowAddModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Care Calendar</h2>
          <p className="text-warm-600 mt-1">
            {unclaimedCount > 0 ? (
              <span className="text-terracotta-600 font-medium">
                {unclaimedCount} event{unclaimedCount !== 1 ? 's' : ''} need{unclaimedCount === 1 ? 's' : ''} someone to claim
              </span>
            ) : (
              'All events have been claimed'
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-5 py-2.5 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-all duration-200 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'unclaimed', label: 'Needs Volunteer' },
          { id: 'mine', label: 'My Events' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === f.id
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'bg-white text-warm-600 hover:bg-cream-100 border border-cream-200'
            }`}
          >
            {f.label}
            {f.id === 'unclaimed' && unclaimedCount > 0 && (
              <span className="ml-2 bg-terracotta-500 text-white px-2 py-0.5 rounded-full text-xs">
                {unclaimedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Event Type Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(eventTypeConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <span
              key={key}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {config.label}
            </span>
          )
        })}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-cream-200">
            <Calendar className="h-12 w-12 text-cream-400 mx-auto mb-3" />
            <p className="text-warm-500">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const config = eventTypeConfig[event.type]
            const Icon = config.icon
            const eventDate = new Date(event.date)

            return (
              <div
                key={event.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border border-cream-200 hover:shadow-warm transition-all duration-200 ${
                  !event.claimedBy ? 'ring-2 ring-terracotta-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${config.bgColor}`}>
                      <Icon className={`h-6 w-6 ${config.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-sm text-warm-500">
                          {getDateLabel(eventDate)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-warm-900 text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-warm-600 text-sm mt-1">{event.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-warm-500">
                        {event.time && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.time}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </span>
                        )}
                        {event.reminder && (
                          <span className="flex items-center text-primary-600">
                            <Bell className="h-4 w-4 mr-1" />
                            {formatReminderTime(event.reminder)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div className="flex-shrink-0 ml-4">
                    {event.claimedBy ? (
                      <div className="flex items-center px-3 py-2 bg-sage-50 rounded-xl">
                        <User className="h-4 w-4 text-sage-600 mr-2" />
                        <span className="text-sm text-sage-700 font-medium">
                          {event.claimedByName}
                        </span>
                        <Check className="h-4 w-4 text-sage-600 ml-2" />
                      </div>
                    ) : (
                      <button
                        onClick={() => onClaimEvent(event.id, 'Sarah')}
                        className="flex items-center px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 font-medium shadow-warm hover:shadow-warm-lg"
                      >
                        <User className="h-4 w-4 mr-2" />
                        I'll Do It
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-warm-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-warm-900">Add New Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-warm-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(eventTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Cardiology Appointment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="Add any notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 123 Medical Center Dr"
                />
              </div>

              <ReminderSelect
                value={newEvent.reminder}
                onChange={(reminder) => setNewEvent({ ...newEvent, reminder })}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-cream-200 text-warm-700 rounded-xl hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-warm"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
