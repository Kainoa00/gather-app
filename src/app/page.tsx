'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import CareCircle from '@/components/CareCircle'
import CareCalendar from '@/components/CareCalendar'
import VaultComponent from '@/components/Vault'
import CareLog from '@/components/CareLog'
import HomeFeed from '@/components/HomeFeed'
import ExportModal from '@/components/ExportModal'
import PatientSummary from '@/components/PatientSummary'
import NotificationCenter from '@/components/NotificationCenter'
import VisitTracker from '@/components/VisitTracker'
import DailyDigest from '@/components/DailyDigest'
import WellnessTrends from '@/components/WellnessTrends'
import VitalsTrends from '@/components/VitalsTrends'
import QuickActions from '@/components/QuickActions'
import ChatBot from '@/components/ChatBot'
import { demoMembers, demoEvents, demoVault, demoLogEntries, demoPosts, demoPatient, demoVisits, demoNotifications, demoWellnessDays } from '@/lib/demo-data'
import { CareCircleMember, CalendarEvent, Vault, LogEntry, FeedPost, UserRole, Visit, Notification } from '@/types'
import { Heart, Shield, Calendar, Users, ClipboardList, ArrowRight, Sparkles, Download, Home as HomeIcon, Lock, CheckCircle2, Building2 } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('landing')
  const [members, setMembers] = useState<CareCircleMember[]>(demoMembers)
  const [events, setEvents] = useState<CalendarEvent[]>(demoEvents)
  const [vault, setVault] = useState<Vault>(demoVault)
  const [logEntries, setLogEntries] = useState<LogEntry[]>(demoLogEntries)
  const [posts, setPosts] = useState<FeedPost[]>(demoPosts)
  const [visits, setVisits] = useState<Visit[]>(demoVisits)
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)
  const [showExportModal, setShowExportModal] = useState(false)

  // Demo: Sarah is the current user (admin/family)
  const currentUserId = '1'
  const currentUserName = 'Sarah Johnson'
  const currentUserRole: UserRole = 'admin'

  // Simulate nurse view toggle for demo
  const [demoRole, setDemoRole] = useState<UserRole>('admin')

  // Sub-tab states
  const [homeSubTab, setHomeSubTab] = useState<'feed' | 'digest' | 'visits'>('feed')
  const [logSubTab, setLogSubTab] = useState<'timeline' | 'trends' | 'vitals' | 'wellness'>('timeline')

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
          ? { ...event, claimedBy: currentUserId, claimedByName: userName }
          : event
      )
    )
  }

  const handleAddEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: String(events.length + 1),
      createdAt: new Date(),
      createdBy: currentUserId,
    }
    setEvents([...events, newEvent])
  }

  // Care Log handlers
  const handleAddLogEntry = (entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `log-${logEntries.length + 1}`,
      createdAt: new Date(),
      comments: [],
    }
    setLogEntries([newEntry, ...logEntries])

    // Auto-generate notification
    const notifTypeMap: Record<string, Notification['type']> = {
      vitals: 'vitals',
      medication: 'medication',
      mood: 'mood',
      incident: 'incident',
      activity: 'general',
    }
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: notifTypeMap[entry.category] || 'general',
      title: entry.title,
      message: entry.notes || 'New entry logged',
      sourceId: newEntry.id,
      sourceType: 'log_entry',
      createdAt: new Date(),
      readBy: [],
    }
    setNotifications([newNotification, ...notifications])
  }

  const handleAddLogComment = (entryId: string, content: string) => {
    const currentMember = members.find(m => m.id === currentUserId)
    setLogEntries(logEntries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          comments: [...entry.comments, {
            id: `lc-${Date.now()}`,
            authorId: currentUserId,
            authorName: currentMember?.name || 'You',
            content,
            createdAt: new Date(),
          }],
        }
      }
      return entry
    }))
  }

  // Home Feed handlers
  const handleAddPost = (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    const newPost: FeedPost = {
      ...post,
      id: String(posts.length + 1),
      createdAt: new Date(),
      likes: [],
      comments: [],
    }
    setPosts([newPost, ...posts])
  }

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUserId)
        return {
          ...post,
          likes: isLiked
            ? post.likes.filter(id => id !== currentUserId)
            : [...post.likes, currentUserId],
        }
      }
      return post
    }))
  }

  const handleAddPostComment = (postId: string, content: string) => {
    const currentMember = members.find(m => m.id === currentUserId)
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: `c${Date.now()}`,
            authorId: currentUserId,
            authorName: currentMember?.name || 'You',
            content,
            createdAt: new Date(),
          }],
        }
      }
      return post
    }))
  }

  // Visit handlers
  const handleCheckIn = () => {
    const currentMember = members.find(m => m.id === currentUserId)
    const newVisit: Visit = {
      id: `v-${Date.now()}`,
      visitorId: currentUserId,
      visitorName: currentMember?.name || currentUserName,
      visitorRelationship: currentMember?.relationship,
      checkInTime: new Date(),
    }
    setVisits([newVisit, ...visits])
  }

  const handleCheckOut = (mood: string, note: string) => {
    setVisits(visits.map(visit => {
      if (visit.visitorId === currentUserId && !visit.checkOutTime) {
        const checkOutTime = new Date()
        const duration = Math.round((checkOutTime.getTime() - new Date(visit.checkInTime).getTime()) / 60000)
        return {
          ...visit,
          checkOutTime,
          duration,
          mood: mood as Visit['mood'],
          note: note || undefined,
        }
      }
      return visit
    }))

    // Create a notification for the visit
    const newNotification: Notification = {
      id: `notif-visit-${Date.now()}`,
      type: 'visit',
      title: `${currentUserName} Visited`,
      message: note || 'Family visit completed',
      sourceId: `v-${Date.now()}`,
      sourceType: 'visit',
      createdAt: new Date(),
      readBy: [],
    }
    setNotifications([newNotification, ...notifications])
  }

  // Notification handlers
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => {
      if (n.id === notificationId && !n.readBy.includes(currentUserId)) {
        return { ...n, readBy: [...n.readBy, currentUserId] }
      }
      return n
    }))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => {
      if (!n.readBy.includes(currentUserId)) {
        return { ...n, readBy: [...n.readBy, currentUserId] }
      }
      return n
    }))
  }

  // Landing page
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen gradient-mesh-bg">
        {/* Decorative blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 blob-lavender rounded-full animate-blob"></div>
          <div className="absolute top-1/3 -left-20 w-72 h-72 blob-peach rounded-full animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-1/4 w-64 h-64 blob-lavender rounded-full animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
            <div className="text-center max-w-3xl mx-auto">
              {/* Logo */}
              <div className="flex justify-center mb-8 animate-slide-up">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender-400 to-peach-400 rounded-3xl blur-xl opacity-50 animate-pulse-soft"></div>
                  <div className="relative p-5 bg-gradient-to-br from-lavender-500 to-lavender-600 rounded-3xl shadow-float">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
                <span className="gradient-text">GatherIn</span>
              </h1>

              <p className="mt-6 text-xl sm:text-2xl text-navy-600 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
                Stay connected to your loved one's care journey.
              </p>

              <p className="mt-3 text-lg text-navy-500 animate-slide-up" style={{ animationDelay: '250ms' }}>
                A family portal for skilled nursing facilities.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={() => setActiveTab('home')}
                  className="btn-primary inline-flex items-center justify-center gap-2 text-lg"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </button>
                <a
                  href="#features"
                  className="btn-secondary inline-flex items-center justify-center text-lg"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Hook Banner */}
        <div className="relative">
          <div className="max-w-4xl mx-auto px-4">
            <div className="card-glass p-6 sm:p-8 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-peach-100 rounded-2xl">
                  <Building2 className="h-6 w-6 text-peach-600" />
                </div>
              </div>
              <p className="text-lg text-navy-700">
                <strong className="text-navy-900">When your loved one is in a skilled nursing facility,</strong> staying informed shouldn't be a guessing game.
              </p>
              <p className="mt-2 text-peach-600 font-medium">
                GatherIn gives your family real-time care updates, visit coordination, and peace of mind.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div id="features" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900">
                Everything Your Family Needs
              </h2>
              <p className="mt-4 text-lg text-navy-600 max-w-2xl mx-auto">
                Stay informed about your loved one's daily care. No more wondering how Mom is doing today.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1 - Care Log (Star Feature - Large) */}
              <div className="bento-item md:col-span-2 lg:col-span-2 card-glass p-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="p-4 bg-gradient-to-br from-lavender-100 to-peach-100 rounded-2xl shrink-0">
                    <ClipboardList className="h-8 w-8 text-lavender-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-2">Daily Care Log</h3>
                    <p className="text-navy-600 text-lg leading-relaxed">
                      Nurses log vitals, medications, activities, and mood throughout the day. Family members see a real-time timeline with the ability to comment and ask questions.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full">Vitals</span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">Medications</span>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">Activities</span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">Mood</span>
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full">Incidents</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Calendar */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-mint-100 rounded-2xl w-fit mb-4">
                  <Calendar className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Visit Calendar</h3>
                <p className="text-navy-600">
                  See the best times to visit, how your loved one is feeling, and coordinate with family and facility events.
                </p>
              </div>

              {/* Feature 3 - Home Feed */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-peach-100 rounded-2xl w-fit mb-4">
                  <Heart className="h-6 w-6 text-peach-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Moments Feed</h3>
                <p className="text-navy-600">
                  Joyful moments, visit recaps, activity photos, and milestones shared by staff and family.
                </p>
              </div>

              {/* Feature 4 - Care Circle */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-lavender-100 rounded-2xl w-fit mb-4">
                  <Users className="h-6 w-6 text-lavender-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Care Circle</h3>
                <p className="text-navy-600">
                  Family and staff contact directory. Everyone who's part of your loved one's care, in one place.
                </p>
              </div>

              {/* Feature 5 - Vault (Large) */}
              <div className="bento-item md:col-span-2 lg:col-span-2 card-glass p-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="p-4 bg-gradient-to-br from-mint-100 to-mint-200 rounded-2xl shrink-0">
                    <Shield className="h-8 w-8 text-mint-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-2">The Vault</h3>
                    <p className="text-navy-600 text-lg leading-relaxed">
                      Facility info, room number, visiting hours, insurance cards, medications, and care team contacts. Everything you need in one secure, accessible place.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Facility Info</span>
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Insurance</span>
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Medications</span>
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Care Team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4">
            <div className="card-glass p-10 sm:p-14 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl shadow-glass-lg">
                  <Lock className="h-8 w-8 text-mint-400" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
                Built for Trust
              </h2>
              <p className="text-lg text-navy-600 mb-10 max-w-2xl mx-auto">
                Your family's health information deserves the highest protection.
                GatherIn uses encryption at rest and in transit, with
                role-based access control for sensitive data.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-navy-700">
                  <CheckCircle2 className="h-5 w-5 text-mint-500" />
                  <span className="font-medium">End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2 text-navy-700">
                  <CheckCircle2 className="h-5 w-5 text-mint-500" />
                  <span className="font-medium">HIPAA-compliant</span>
                </div>
                <div className="flex items-center gap-2 text-navy-700">
                  <CheckCircle2 className="h-5 w-5 text-mint-500" />
                  <span className="font-medium">Role-based access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-lavender-500 to-peach-500 rounded-4xl blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-navy-800 to-navy-900 rounded-4xl p-10 sm:p-16 shadow-glass-lg">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Stay Connected to Their Care
                </h2>
                <p className="text-lg text-navy-200 mb-10">
                  Set up your care circle in minutes. Your family will thank you.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="btn-accent inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
                >
                  Try the Demo
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-10 border-t border-lavender-100/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-2 bg-lavender-100 rounded-xl">
                <Heart className="h-5 w-5 text-lavender-600" />
              </div>
            </div>
            <p className="text-navy-600 font-medium">GatherIn</p>
            <p className="mt-1 text-navy-500 text-sm">Stay connected to your loved one's care</p>
            <p className="mt-4 text-navy-400 text-xs">Demo version for portfolio showcase</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh-bg">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 blob-lavender rounded-full opacity-50"></div>
        <div className="absolute bottom-20 -left-20 w-72 h-72 blob-peach rounded-full opacity-40"></div>
      </div>

      {/* Navigation with Notification Bell */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Notification Bell */}
            <div className="flex items-center">
              <NotificationCenter
                notifications={notifications}
                currentUserId={currentUserId}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onNavigate={(sourceType, sourceId) => {
                  if (sourceType === 'log_entry') setActiveTab('log')
                  else if (sourceType === 'visit') { setActiveTab('home'); setHomeSubTab('visits') }
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo role switcher */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-navy-500">Viewing as:</span>
          <div className="flex gap-1 bg-cream-100 rounded-xl p-1">
            {(['admin', 'nurse', 'family'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setDemoRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  demoRole === role
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                {role === 'admin' ? 'Admin' : role === 'nurse' ? 'Nurse' : 'Family'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Patient Summary Dashboard */}
            <PatientSummary
              patient={demoPatient}
              logEntries={logEntries}
              events={events}
              visits={visits}
              onClaimVisit={(eventId) => handleClaimEvent(eventId, currentUserName)}
            />

            {/* Home Sub-tabs */}
            <div className="flex gap-2 border-b border-lavender-100 pb-2">
              {[
                { id: 'feed' as const, label: 'Feed' },
                { id: 'digest' as const, label: 'Daily Digest' },
                { id: 'visits' as const, label: 'Visits' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setHomeSubTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    homeSubTab === tab.id
                      ? 'bg-lavender-100 text-lavender-700 shadow-soft'
                      : 'text-navy-600 hover:bg-cream-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {homeSubTab === 'feed' && (
              <HomeFeed
                posts={posts}
                members={members}
                currentUserId={currentUserId}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onAddComment={handleAddPostComment}
              />
            )}

            {homeSubTab === 'digest' && (
              <DailyDigest logEntries={logEntries} visits={visits} />
            )}

            {homeSubTab === 'visits' && (
              <VisitTracker
                visits={visits}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <CareCalendar
            events={events}
            onClaimEvent={handleClaimEvent}
            onAddEvent={handleAddEvent}
          />
        )}

        {activeTab === 'log' && (
          <div className="space-y-6">
            {/* Quick Actions for Nurses */}
            {(demoRole === 'nurse' || demoRole === 'admin') && (
              <QuickActions
                medications={vault.medications}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onAddLogEntry={handleAddLogEntry}
              />
            )}

            {/* Log Sub-tabs */}
            <div className="flex gap-2 border-b border-lavender-100 pb-2">
              {[
                { id: 'timeline' as const, label: 'Timeline' },
                { id: 'vitals' as const, label: 'Vitals Trends' },
                { id: 'wellness' as const, label: 'Wellness' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLogSubTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    logSubTab === tab.id
                      ? 'bg-lavender-100 text-lavender-700 shadow-soft'
                      : 'text-navy-600 hover:bg-cream-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {logSubTab === 'timeline' && (
              <CareLog
                logEntries={logEntries}
                currentUserRole={demoRole}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onAddLogEntry={handleAddLogEntry}
                onAddComment={handleAddLogComment}
              />
            )}

            {logSubTab === 'vitals' && <VitalsTrends logEntries={logEntries} />}

            {logSubTab === 'wellness' && <WellnessTrends days={demoWellnessDays} />}
          </div>
        )}

        {activeTab === 'circle' && (
          <CareCircle members={members} onAddMember={handleAddMember} />
        )}

        {activeTab === 'vault' && (
          <VaultComponent vault={vault} onUpdateVault={setVault} />
        )}
      </main>

      {/* Export Button - positioned above chatbot */}
      <button
        onClick={() => setShowExportModal(true)}
        className="fixed bottom-24 right-6 p-3.5 bg-gradient-to-br from-navy-600 to-navy-700 text-white rounded-2xl shadow-float hover:shadow-float hover:-translate-y-0.5 transition-all duration-300 z-30"
        title="Export & Share"
      >
        <Download className="h-5 w-5" />
      </button>

      {/* Demo Notice */}
      <div className="fixed bottom-4 left-4 right-20 sm:left-auto sm:right-20 sm:w-auto">
        <div className="glass-dark text-white px-4 py-3 rounded-2xl shadow-glass-lg flex items-center gap-3">
          <div className="p-2 bg-lavender-500 rounded-xl">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Demo Mode</p>
            <p className="text-navy-200 text-xs">Data stored locally</p>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        vault={vault}
        logEntries={logEntries}
        events={events}
      />

      {/* AI Chat Assistant */}
      <ChatBot
        patientInfo={demoPatient}
        logEntries={logEntries}
        events={events}
        vault={vault}
        visits={visits}
      />
    </div>
  )
}
