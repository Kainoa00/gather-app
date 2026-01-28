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
  X
} from 'lucide-react'
import { CalendarEvent, EventType } from '@/types'
import { format, isToday, isTomorrow, addDays, startOfWeek, endOfWeek } from 'date-fns'

interface CareCalendarProps {
  events: CalendarEvent[]
  onClaimEvent: (eventId: string, userName: string) => void
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => void
}

const eventTypeConfig = {
  doctor_visit: {
    label: 'Doctor Visit',
    icon: Stethoscope,
    color: 'bg-red-100 text-red-700 border-red-200',
    bgColor: 'bg-red-50',
  },
  medication_refill: {
    label: 'Medication Refill',
    icon: Pill,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    bgColor: 'bg-orange-50',
  },
  social_activity: {
    label: 'Social Activity',
    icon: Users,
    color: 'bg-green-100 text-green-700 border-green-200',
    bgColor: 'bg-green-50',
  },
  family_visit: {
    label: 'Family Visit',
    icon: Home,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    bgColor: 'bg-blue-50',
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
      })
      setShowAddModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Care Calendar</h2>
          <p className="text-gray-600 mt-1">
            {unclaimedCount > 0 ? (
              <span className="text-amber-600 font-medium">
                {unclaimedCount} event{unclaimedCount !== 1 ? 's' : ''} need{unclaimedCount === 1 ? 's' : ''} someone to claim
              </span>
            ) : (
              'All events have been claimed'
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f.label}
            {f.id === 'unclaimed' && unclaimedCount > 0 && (
              <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">
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
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const config = eventTypeConfig[event.type]
            const Icon = config.icon
            const eventDate = new Date(event.date)

            return (
              <div
                key={event.id}
                className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
                  !event.claimedBy ? 'ring-2 ring-amber-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${config.bgColor}`}>
                      <Icon className={`h-6 w-6 ${config.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getDateLabel(eventDate)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
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
                      </div>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div className="flex-shrink-0 ml-4">
                    {event.claimedBy ? (
                      <div className="flex items-center px-3 py-2 bg-green-50 rounded-lg">
                        <User className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-700 font-medium">
                          {event.claimedByName}
                        </span>
                        <Check className="h-4 w-4 text-green-600 ml-2" />
                      </div>
                    ) : (
                      <button
                        onClick={() => onClaimEvent(event.id, 'Sarah')}
                        className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(eventTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Cardiology Appointment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="Add any notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 123 Medical Center Dr"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
