'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import CareCircle from '@/components/CareCircle'
import CareCalendar from '@/components/CareCalendar'
import VaultComponent from '@/components/Vault'
import IncidentFeed from '@/components/IncidentFeed'
import { demoMembers, demoEvents, demoVault, demoIncidents } from '@/lib/demo-data'
import { CareCircleMember, CalendarEvent, Vault, Incident, EventType, IncidentSeverity } from '@/types'
import { Heart, Shield, Calendar, Users, Activity, ArrowRight } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('landing')
  const [members, setMembers] = useState<CareCircleMember[]>(demoMembers)
  const [events, setEvents] = useState<CalendarEvent[]>(demoEvents)
  const [vault, setVault] = useState<Vault>(demoVault)
  const [incidents, setIncidents] = useState<Incident[]>(demoIncidents)

  const handleAddMember = (member: Omit<CareCircleMember, 'id' | 'joinedAt'>) => {
    const newMember: CareCircleMember = {
      ...member,
      id: String(members.length + 1),
      joinedAt: new Date(),
    }
    setMembers([...members, newMember])
  }

  const handleClaimEvent = (eventId: string, userName: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? { ...event, claimedBy: '1', claimedByName: userName }
          : event
      )
    )
  }

  const handleAddEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: String(events.length + 1),
      createdAt: new Date(),
      createdBy: '1',
    }
    setEvents([...events, newEvent])
  }

  const handleAddIncident = (incident: Omit<Incident, 'id' | 'createdAt' | 'reportedBy'>) => {
    const newIncident: Incident = {
      ...incident,
      id: String(incidents.length + 1),
      createdAt: new Date(),
      reportedBy: '1',
    }
    setIncidents([newIncident, ...incidents])
  }

  // Landing page
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary-100 rounded-2xl">
                  <Heart className="h-12 w-12 text-primary-600" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                Parent Planner
              </h1>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                One secure place to manage the logistics of your parents' care.
                Coordinate with family, never miss an appointment.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Hook */}
        <div className="bg-amber-50 border-y border-amber-100">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <p className="text-lg text-amber-800">
              <strong>Think about this:</strong> If you had to go to the ER with your parent right now,
              would you have their medication list and insurance ID ready?
            </p>
            <p className="mt-2 text-amber-700">
              Upload them to Parent Planner now so you're prepared when it matters most.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Everything Your Care Team Needs
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Stop the chaos of group texts. Parent Planner keeps everyone on the same page.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Care Calendar</h3>
                <p className="text-gray-600">
                  Track appointments with "I'll do it" claim buttons. No more "I thought you were taking her" mistakes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Care Circle</h3>
                <p className="text-gray-600">
                  Invite siblings, spouses, and aides with role-based permissions. Everyone sees what they need.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-green-100 rounded-xl w-fit mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">The Vault</h3>
                <p className="text-gray-600">
                  Insurance cards, medication lists, provider contacts, and access codes. All encrypted, always accessible.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-amber-100 rounded-xl w-fit mb-4">
                  <Activity className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Incident Feed</h3>
                <p className="text-gray-600">
                  Log health updates that don't belong in a text thread. Searchable history for the next doctor's visit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Shield className="h-12 w-12 mx-auto mb-6 text-green-400" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Built for Trust
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              Your family's health information deserves the highest protection.
              Parent Planner uses encryption at rest and in transit, with
              two-factor authentication for sensitive data access.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                End-to-end encryption
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                HIPAA-compliant standards
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Two-factor authentication
              </span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Start Coordinating Today
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Set up your Care Circle in minutes. Your family will thank you.
            </p>
            <button
              onClick={() => setActiveTab('calendar')}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
            >
              Try the Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>Parent Planner - Caregiving coordination made simple</p>
            <p className="mt-2">Demo version for portfolio showcase</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calendar' && (
          <CareCalendar
            events={events}
            onClaimEvent={handleClaimEvent}
            onAddEvent={handleAddEvent}
          />
        )}
        {activeTab === 'circle' && (
          <CareCircle members={members} onAddMember={handleAddMember} />
        )}
        {activeTab === 'vault' && (
          <VaultComponent vault={vault} onUpdateVault={setVault} />
        )}
        {activeTab === 'incidents' && (
          <IncidentFeed incidents={incidents} onAddIncident={handleAddIncident} />
        )}
      </main>

      {/* Demo Notice */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto">
        <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Activity className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Demo Mode</p>
            <p className="text-slate-300">Data is stored locally in your browser</p>
          </div>
        </div>
      </div>
    </div>
  )
}
