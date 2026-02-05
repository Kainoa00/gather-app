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
  Activity,
  Music,
  Users,
  X,
  Bell,
  Smile,
  Meh,
  Frown,
  Heart,
} from 'lucide-react'
import { CalendarEvent, EventType } from '@/types'
import { format, isToday, isTomorrow } from 'date-fns'
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
    color: 'bg-red-50 text-red-700 border-red-200',
    bgColor: 'bg-red-50',
  },
  therapy_session: {
    label: 'Therapy',
    icon: Activity,
    color: 'bg-green-50 text-green-700 border-green-200',
    bgColor: 'bg-green-50',
  },
  facility_event: {
    label: 'Facility Event',
    icon: Music,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    bgColor: 'bg-purple-50',
  },
  family_visit: {
    label: 'Family Visit',
    icon: Users,
    color: 'bg-lavender-100 text-lavender-700 border-lavender-200',
    bgColor: 'bg-lavender-50',
  },
}

const moodConfig = {
  great: { label: 'Great Day', emoji: '😊', color: 'bg-green-100 text-green-700' },
  good: { label: 'Good Day', emoji: '🙂', color: 'bg-blue-100 text-blue-700' },
  fair: { label: 'Fair Day', emoji: '😐', color: 'bg-amber-100 text-amber-700' },
  poor: { label: 'Rough Day', emoji: '😔', color: 'bg-red-100 text-red-700' },
}

export default function CareCalendar({ events, onClaimEvent, onAddEvent }: CareCalendarProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'visits' | 'therapy' | 'events'>('all')
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'family_visit' as EventType,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    endTime: '',
    location: '',
    reminder: undefined as number | undefined,
    patientMood: undefined as CalendarEvent['patientMood'],
    visitWindow: false,
  })

  const filteredEvents = events
    .filter((event) => {
      if (filter === 'visits') return event.type === 'family_visit'
      if (filter === 'therapy') return event.type === 'therapy_session'
      if (filter === 'events') return event.type === 'facility_event'
      return true
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const visitWindows = events.filter((e) => e.visitWindow)

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
        patientMood: newEvent.patientMood || undefined,
      })
      setNewEvent({
        title: '', description: '', type: 'family_visit',
        date: format(new Date(), 'yyyy-MM-dd'), time: '', endTime: '', location: '',
        reminder: undefined, patientMood: undefined, visitWindow: false,
      })
      setShowAddModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Visit Calendar</h2>
          <p className="text-navy-600 mt-1">
            Appointments, therapy sessions, and visit times
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-2xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-float hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Schedule Visit
        </button>
      </div>

      {/* Visit Windows Banner */}
      {visitWindows.length > 0 && (
        <div className="card-glass p-5 border-l-4 border-lavender-400">
          <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-lavender-500" />
            Best Times to Visit
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {visitWindows.map((window) => (
              <div key={window.id} className="flex items-center gap-3 bg-lavender-50/50 rounded-xl p-3">
                <div className="text-center min-w-[60px]">
                  <div className="text-sm font-semibold text-navy-900">{getDateLabel(new Date(window.date))}</div>
                  <div className="text-xs text-navy-500">{window.time}{window.endTime ? ` - ${window.endTime}` : ''}</div>
                </div>
                {window.patientMood && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${moodConfig[window.patientMood].color}`}>
                    {moodConfig[window.patientMood].emoji} {moodConfig[window.patientMood].label}
                  </span>
                )}
                {!window.claimedBy && (
                  <button
                    onClick={() => onClaimEvent(window.id, 'Sarah')}
                    className="ml-auto px-3 py-1.5 bg-lavender-500 text-white rounded-lg text-xs font-medium hover:bg-lavender-600 transition-colors"
                  >
                    I'll Visit
                  </button>
                )}
                {window.claimedBy && (
                  <span className="ml-auto text-xs text-mint-700 bg-mint-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" /> {window.claimedByName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'visits', label: 'Family Visits' },
          { id: 'therapy', label: 'Therapy' },
          { id: 'events', label: 'Facility Events' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === f.id
                ? 'bg-lavender-100 text-lavender-700 shadow-sm'
                : 'bg-white text-navy-600 hover:bg-cream-100 border border-lavender-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event Type Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(eventTypeConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <span key={key} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {config.label}
            </span>
          )
        })}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 card-glass">
            <Calendar className="h-12 w-12 text-lavender-300 mx-auto mb-3" />
            <p className="text-navy-500">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const config = eventTypeConfig[event.type]
            const Icon = config.icon
            const eventDate = new Date(event.date)

            return (
              <div key={event.id}
                className={`card-glass p-5 hover:shadow-float transition-all duration-200 ${
                  event.visitWindow ? 'ring-2 ring-lavender-200' : ''
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${config.bgColor}`}>
                      <Icon className={`h-6 w-6 ${config.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-sm text-navy-500">{getDateLabel(eventDate)}</span>
                        {event.patientMood && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${moodConfig[event.patientMood].color}`}>
                            {moodConfig[event.patientMood].emoji} {moodConfig[event.patientMood].label}
                          </span>
                        )}
                        {event.visitWindow && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-lavender-100 text-lavender-700">
                            Visit Window
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-navy-900 text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-navy-600 text-sm mt-1">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-navy-500">
                        {event.time && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.time}{event.endTime ? ` - ${event.endTime}` : ''}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </span>
                        )}
                        {event.reminder && (
                          <span className="flex items-center text-lavender-600">
                            <Bell className="h-4 w-4 mr-1" />
                            {formatReminderTime(event.reminder)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Claim / Visit Button */}
                  {event.type === 'family_visit' && (
                    <div className="flex-shrink-0 ml-4">
                      {event.claimedBy ? (
                        <div className="flex items-center px-3 py-2 bg-mint-50 rounded-xl">
                          <User className="h-4 w-4 text-mint-600 mr-2" />
                          <span className="text-sm text-mint-700 font-medium">{event.claimedByName}</span>
                          <Check className="h-4 w-4 text-mint-600 ml-2" />
                        </div>
                      ) : (
                        <button
                          onClick={() => onClaimEvent(event.id, 'Sarah')}
                          className="flex items-center px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 font-medium shadow-soft"
                        >
                          <User className="h-4 w-4 mr-2" />
                          I'll Visit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-glass-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900">Schedule an Event</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-cream-100 rounded-xl transition-colors">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Event Type</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent">
                  {Object.entries(eventTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Title</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                  placeholder="e.g., Family Visit" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Description (optional)</label>
                <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Date</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Start Time</label>
                  <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Location (optional)</label>
                <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent"
                  placeholder="e.g., Room 214B" />
              </div>

              <ReminderSelect value={newEvent.reminder} onChange={(reminder) => setNewEvent({ ...newEvent, reminder })} />
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 rounded-xl hover:bg-cream-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddEvent}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 transition-all duration-200 shadow-soft">
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
