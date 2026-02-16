'use client'

import { useState } from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import CareCircle from '@/components/CareCircle'
import CareCalendar from '@/components/CareCalendar'
import VaultComponent from '@/components/Vault'
import CareLog from '@/components/CareLog'
import ExportModal from '@/components/ExportModal'
import NotificationCenter from '@/components/NotificationCenter'
import VisitTracker from '@/components/VisitTracker'
import WellnessTrends from '@/components/WellnessTrends'
import VitalsTrends from '@/components/VitalsTrends'
import QuickActions from '@/components/QuickActions'
import ChatBot from '@/components/ChatBot'
import LoginScreen from '@/components/LoginScreen'
import HomeView from '@/components/HomeView'
import { isDemoMode, DEMO_PATIENT_ID } from '@/lib/supabase'
import {
  usePatient,
  useMembers,
  useEvents,
  useLogEntries,
  usePosts,
  useVisits,
  useNotifications,
  useVault,
  useWellnessDays,
} from '@/lib/hooks/useSupabaseData'
import {
  addMemberToDb,
  addEventToDb,
  claimEventInDb,
  addLogEntryToDb,
  addLogCommentToDb,
  addPostToDb,
  likePostInDb,
  addPostCommentToDb,
  checkInToDb,
  checkOutInDb,
  createNotificationInDb,
  markNotificationReadInDb,
  markAllNotificationsReadInDb,
} from '@/lib/api/mutations'
import { CareCircleMember, CalendarEvent, Vault, LogEntry, FeedPost, UserRole, Visit, Notification } from '@/types'
import { Heart, Shield, Calendar, Users, ClipboardList, ArrowRight, Sparkles, Download, Lock, CheckCircle2, Building2, Link2, MessageSquare, Phone, PhoneOff, TrendingUp, Star } from 'lucide-react'
import {
  canUseQuickActions,
  canViewMedications,
  getVisibleCalendarEventTypes,
  getVisibleNotificationTypes,
  getVisibleLogCategories,
} from '@/lib/permissions'

export default function Home() {
  const [activeTab, setActiveTab] = useState('landing')
  const [showExportModal, setShowExportModal] = useState(false)

  // Current user state (set by login screen)
  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    role: UserRole
    relationship: string
  } | null>(null)

  // Derive user info from state (fallback for safety)
  const currentUserId = currentUser?.id || '1'
  const currentUserName = currentUser?.name || 'Toshio Shintaku'
  const currentUserRole: UserRole = currentUser?.role || 'primary'

  // Sub-tab states
  const [logSubTab, setLogSubTab] = useState<'timeline' | 'trends' | 'vitals' | 'wellness'>('timeline')

  // Supabase data hooks (fall back to demo data when isDemoMode)
  const { patient } = usePatient(DEMO_PATIENT_ID)
  const { members, setMembers, refetch: refetchMembers } = useMembers(DEMO_PATIENT_ID)
  const { events, setEvents, refetch: refetchEvents } = useEvents(DEMO_PATIENT_ID)
  const { logEntries, setLogEntries, refetch: refetchLogs } = useLogEntries(DEMO_PATIENT_ID)
  const { posts, setPosts, refetch: refetchPosts } = usePosts(DEMO_PATIENT_ID)
  const { visits, setVisits, refetch: refetchVisits } = useVisits(DEMO_PATIENT_ID)
  const { notifications, setNotifications, refetch: refetchNotifications } = useNotifications(DEMO_PATIENT_ID)
  const { vault, setVault, refetch: refetchVault } = useVault(DEMO_PATIENT_ID)
  const { wellnessDays } = useWellnessDays(DEMO_PATIENT_ID)

  // ==========================================
  // Handler functions (demo mode = local state, Supabase mode = DB + refetch)
  // ==========================================

  const handleAddMember = async (member: Omit<CareCircleMember, 'id' | 'joinedAt'>) => {
    if (isDemoMode) {
      const newMember: CareCircleMember = {
        ...member,
        id: String(members.length + 1),
        joinedAt: new Date(),
      }
      setMembers([...members, newMember])
    } else {
      try {
        await addMemberToDb(member, DEMO_PATIENT_ID)
        refetchMembers()
      } catch (error) {
        console.error('Error adding member:', error)
      }
    }
  }

  const handleClaimEvent = async (eventId: string, userName: string) => {
    if (isDemoMode) {
      setEvents(
        events.map((event) =>
          event.id === eventId
            ? { ...event, claimedBy: currentUserId, claimedByName: userName }
            : event
        )
      )
    } else {
      try {
        await claimEventInDb(eventId, currentUserId, userName)
        refetchEvents()
      } catch (error) {
        console.error('Error claiming event:', error)
      }
    }
  }

  const handleAddEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => {
    if (isDemoMode) {
      const newEvent: CalendarEvent = {
        ...event,
        id: String(events.length + 1),
        createdAt: new Date(),
        createdBy: currentUserId,
      }
      setEvents([...events, newEvent])
    } else {
      try {
        await addEventToDb(event, currentUserId, DEMO_PATIENT_ID)
        refetchEvents()
      } catch (error) {
        console.error('Error adding event:', error)
      }
    }
  }

  // Care Log handlers
  const handleAddLogEntry = async (entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'>) => {
    if (isDemoMode) {
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
    } else {
      try {
        const logData = await addLogEntryToDb(entry, DEMO_PATIENT_ID)
        // Create notification in DB too
        const notifTypeMap: Record<string, Notification['type']> = {
          vitals: 'vitals',
          medication: 'medication',
          mood: 'mood',
          incident: 'incident',
          activity: 'general',
        }
        await createNotificationInDb({
          type: notifTypeMap[entry.category] || 'general',
          title: entry.title,
          message: entry.notes || 'New entry logged',
          sourceId: logData.id,
          sourceType: 'log_entry',
        }, DEMO_PATIENT_ID)
        refetchLogs()
        refetchNotifications()
      } catch (error) {
        console.error('Error adding log entry:', error)
      }
    }
  }

  const handleAddLogComment = async (entryId: string, content: string) => {
    const currentMember = members.find(m => m.id === currentUserId)
    if (isDemoMode) {
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
    } else {
      try {
        await addLogCommentToDb(entryId, currentUserId, currentMember?.name || 'You', content)
        refetchLogs()
      } catch (error) {
        console.error('Error adding log comment:', error)
      }
    }
  }

  // Home Feed handlers
  const handleAddPost = async (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    if (isDemoMode) {
      const newPost: FeedPost = {
        ...post,
        id: String(posts.length + 1),
        createdAt: new Date(),
        likes: [],
        comments: [],
      }
      setPosts([newPost, ...posts])
    } else {
      try {
        await addPostToDb(post, DEMO_PATIENT_ID)
        refetchPosts()
      } catch (error) {
        console.error('Error adding post:', error)
      }
    }
  }

  const handleLikePost = async (postId: string) => {
    if (isDemoMode) {
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
    } else {
      try {
        await likePostInDb(postId, currentUserId)
        refetchPosts()
      } catch (error) {
        console.error('Error liking post:', error)
      }
    }
  }

  const handleAddPostComment = async (postId: string, content: string) => {
    const currentMember = members.find(m => m.id === currentUserId)
    if (isDemoMode) {
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
    } else {
      try {
        await addPostCommentToDb(postId, currentUserId, currentMember?.name || 'You', content)
        refetchPosts()
      } catch (error) {
        console.error('Error adding post comment:', error)
      }
    }
  }

  // Visit handlers
  const handleCheckIn = async () => {
    const currentMember = members.find(m => m.id === currentUserId)
    if (isDemoMode) {
      const newVisit: Visit = {
        id: `v-${Date.now()}`,
        visitorId: currentUserId,
        visitorName: currentMember?.name || currentUserName,
        visitorRelationship: currentMember?.relationship,
        checkInTime: new Date(),
      }
      setVisits([newVisit, ...visits])
    } else {
      try {
        await checkInToDb(
          currentUserId,
          currentMember?.name || currentUserName,
          currentMember?.relationship,
          DEMO_PATIENT_ID
        )
        refetchVisits()
      } catch (error) {
        console.error('Error checking in:', error)
      }
    }
  }

  const handleCheckOut = async (mood: string, note: string) => {
    if (isDemoMode) {
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
    } else {
      try {
        // Find current active visit
        const activeVisit = visits.find(v => v.visitorId === currentUserId && !v.checkOutTime)
        if (activeVisit) {
          const duration = Math.round((new Date().getTime() - new Date(activeVisit.checkInTime).getTime()) / 60000)
          await checkOutInDb(activeVisit.id, mood, note, duration)
          await createNotificationInDb({
            type: 'visit',
            title: `${currentUserName} Visited`,
            message: note || 'Family visit completed',
            sourceId: activeVisit.id,
            sourceType: 'visit',
          }, DEMO_PATIENT_ID)
          refetchVisits()
          refetchNotifications()
        }
      } catch (error) {
        console.error('Error checking out:', error)
      }
    }
  }

  // Notification handlers
  const handleMarkAsRead = async (notificationId: string) => {
    if (isDemoMode) {
      setNotifications(notifications.map(n => {
        if (n.id === notificationId && !n.readBy.includes(currentUserId)) {
          return { ...n, readBy: [...n.readBy, currentUserId] }
        }
        return n
      }))
    } else {
      try {
        await markNotificationReadInDb(notificationId, currentUserId)
        refetchNotifications()
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    if (isDemoMode) {
      setNotifications(notifications.map(n => {
        if (!n.readBy.includes(currentUserId)) {
          return { ...n, readBy: [...n.readBy, currentUserId] }
        }
        return n
      }))
    } else {
      try {
        await markAllNotificationsReadInDb(DEMO_PATIENT_ID, currentUserId)
        refetchNotifications()
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    }
  }

  // Login screen
  if (activeTab === 'login') {
    return (
      <LoginScreen
        onLogin={(user) => {
          setCurrentUser(user)
          setActiveTab('home')
        }}
      />
    )
  }

  // Landing page
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen gradient-mesh-bg">
        {/* Decorative blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 blob-primary rounded-full animate-blob"></div>
          <div className="absolute top-1/3 -left-20 w-72 h-72 blob-accent rounded-full animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-1/4 w-64 h-64 blob-primary rounded-full animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
            <div className="text-center max-w-3xl mx-auto">
              {/* Logo */}
              <div className="flex justify-center mb-10 animate-slide-up">
                <Image
                  src="/logos/Logo 1 (color).png"
                  alt="CareBridge Connect"
                  width={600}
                  height={180}
                  className="h-32 sm:h-40 lg:h-48 w-auto"
                  priority
                />
              </div>

              <p className="mt-6 text-xl sm:text-2xl text-navy-600 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
                Peace of mind for families. Less burden for staff.
              </p>

              <p className="mt-3 text-lg text-navy-500 animate-slide-up" style={{ animationDelay: '250ms' }}>
                A HIPAA-compliant communication bridge between care teams and families.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={() => setActiveTab('login')}
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

        {/* Problem Statement Banner */}
        <div className="relative">
          <div className="max-w-4xl mx-auto px-4">
            <div className="card-glass p-6 sm:p-8 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-accent-100 rounded-2xl">
                  <Phone className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <p className="text-lg text-navy-700">
                <strong className="text-navy-900">Healthcare already documents everything &mdash; but families still feel blind.</strong>
              </p>
              <p className="mt-2 text-primary-700 font-medium">
                CareBridge Connect translates documented care into plain-English updates families can trust.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="card-glass p-6 text-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-red-50 rounded-2xl">
                    <PhoneOff className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-navy-900">2-3 hrs</p>
                <p className="text-sm text-navy-500 mt-1">per nurse shift spent on family calls</p>
              </div>
              <div className="card-glass p-6 text-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-accent-100 rounded-2xl">
                    <TrendingUp className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-navy-900">27%</p>
                <p className="text-sm text-navy-500 mt-1">of families dissatisfied with communication</p>
              </div>
              <div className="card-glass p-6 text-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '200ms' }}>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary-100 rounded-2xl">
                    <Star className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-navy-900">Only 29%</p>
                <p className="text-sm text-navy-500 mt-1">of families report being informed of changes</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">How It Works</h2>
            <p className="text-lg text-navy-500 text-center mb-12 max-w-2xl mx-auto">Zero extra work for staff. Automatic peace of mind for families.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-glass p-6 text-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="font-bold text-navy-900 mb-2">Staff Documents Care</h3>
                <p className="text-sm text-navy-600">Care teams continue using their existing systems like PointClickCare. No new workflows.</p>
              </div>
              <div className="card-glass p-6 text-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}>
                <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="font-bold text-navy-900 mb-2">We Translate It</h3>
                <p className="text-sm text-navy-600">Approved data points are translated into plain-English updates, timelines, and progress summaries.</p>
              </div>
              <div className="card-glass p-6 text-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '200ms' }}>
                <div className="w-12 h-12 rounded-2xl bg-mint-100 text-mint-700 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="font-bold text-navy-900 mb-2">Families Feel Informed</h3>
                <p className="text-sm text-navy-600">Families stop calling, feel informed, trust the facility more, and leave positive reviews.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div id="features" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900">
                Everything Families Need to Feel Connected
              </h2>
              <p className="mt-4 text-lg text-navy-600 max-w-2xl mx-auto">
                Real-time visibility into your loved one&apos;s day-to-day care &mdash; without adding work for staff.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1 - Care Timeline (Star Feature - Large) */}
              <div className="bento-item md:col-span-2 lg:col-span-2 card-glass p-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl shrink-0">
                    <ClipboardList className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-2">Event-Based Care Timeline</h3>
                    <p className="text-navy-600 text-lg leading-relaxed">
                      Time-stamped updates like &quot;Medication administered at 7:02 AM,&quot; &quot;PT session completed (30 min),&quot; and &quot;Breakfast consumed (75%).&quot; Read-only for families &mdash; huge for liability control.
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

              {/* Feature 2 - Progress Summaries */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-mint-100 rounded-2xl w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Progress Summaries</h3>
                <p className="text-navy-600">
                  Daily and weekly summaries highlighting trends &mdash; mobility improving, pain decreasing, appetite consistency &mdash; not just raw events.
                </p>
              </div>

              {/* Feature 3 - AI Chat */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-accent-100 rounded-2xl w-fit mb-4">
                  <MessageSquare className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Guardrailed AI Chat</h3>
                <p className="text-navy-600">
                  &quot;When did she last eat?&quot; &mdash; Families ask simple questions. The bot only queries documented facts, never interprets or advises.
                </p>
              </div>

              {/* Feature 4 - Care Circle */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-primary-100 rounded-2xl w-fit mb-4">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Permissioned Access</h3>
                <p className="text-navy-600">
                  Patient opts in. Facility controls who sees what. Family members verified. HIPAA-safe by design.
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
                      Facility info, visiting hours, insurance cards, medications, and care team contacts. Everything families need in one secure, accessible place &mdash; with role-based access controls.
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

        {/* Facility Benefits */}
        <div className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">Why Facilities Choose CareBridge</h2>
            <p className="text-lg text-navy-500 text-center mb-12 max-w-2xl mx-auto">Facilities don&apos;t buy software for families &mdash; they buy it because it solves real operational problems.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: PhoneOff, label: 'Reduced call volume', desc: 'Fewer routine calls to nursing staff' },
                { icon: Heart, label: 'Better satisfaction', desc: 'Families calmer, staff less interrupted' },
                { icon: Star, label: 'Stronger reviews', desc: 'Informed families leave better reviews' },
                { icon: TrendingUp, label: 'Higher census', desc: 'Positive reputation drives occupancy' },
              ].map((item, i) => (
                <div key={i} className="card-glass p-5 text-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: `${i * 80}ms` }}>
                  <item.icon className="h-6 w-6 text-primary-600 mx-auto mb-3" />
                  <p className="font-semibold text-navy-900 text-sm">{item.label}</p>
                  <p className="text-xs text-navy-500 mt-1">{item.desc}</p>
                </div>
              ))}
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
                HIPAA-Compliant by Design
              </h2>
              <p className="text-lg text-navy-600 mb-10 max-w-2xl mx-auto">
                We never show raw clinical notes. Only approved, structured data translated into family-friendly language.
                Role-based access ensures each person sees only what they&apos;re authorized to view.
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
                <div className="flex items-center gap-2 text-navy-700">
                  <CheckCircle2 className="h-5 w-5 text-mint-500" />
                  <span className="font-medium">Opt-in only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 rounded-4xl blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-navy-800 to-navy-900 rounded-4xl p-10 sm:p-16 shadow-glass-lg">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Families Never Have to Wonder Again
                </h2>
                <p className="text-lg text-navy-200 mb-10 max-w-2xl mx-auto">
                  CareBridge Connect exists to ensure that families never have to wonder how their loved one is doing during moments when reassurance matters most.
                </p>
                <button
                  onClick={() => setActiveTab('login')}
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
        <footer className="py-10 border-t border-primary-100/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logos/Logo 1 (color).png"
                alt="CareBridge Connect"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <p className="mt-1 text-navy-500 text-sm">A HIPAA-safe communication bridge between care teams and families</p>
            <p className="mt-4 text-navy-400 text-xs">&copy; 2026 CareBridge Connect LLC. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh-bg">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 blob-primary rounded-full opacity-50"></div>
        <div className="absolute bottom-20 -left-20 w-72 h-72 blob-accent rounded-full opacity-40"></div>
      </div>

      {/* Navigation with Notification Bell */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Notification Bell */}
            <div className="flex items-center">
              <NotificationCenter
                notifications={notifications.filter(n => getVisibleNotificationTypes(currentUserRole).includes(n.type))}
                currentUserId={currentUserId}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onNavigate={(sourceType, sourceId) => {
                  if (sourceType === 'log_entry') setActiveTab('log')
                  else if (sourceType === 'visit') { setActiveTab('home') }
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role switcher + user banner */}
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-navy-500">Viewing as:</span>
          <span className="text-sm font-semibold text-navy-800">{currentUserName}</span>
          <div className="flex gap-1 bg-cream-100 rounded-xl p-1">
            {(['primary', 'admin', 'nurse', 'family'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  const roleMap: Record<UserRole, { id: string; name: string; role: UserRole; relationship: string }> = {
                    primary: { id: '1', name: 'Toshio Shintaku', role: 'primary', relationship: 'Brother (Healthcare POA)' },
                    admin: { id: 'a1', name: 'Mary Wilson', role: 'admin', relationship: 'Facility Administrator' },
                    nurse: { id: 'n1', name: 'Jane Doe', role: 'nurse', relationship: 'Primary Nurse' },
                    family: { id: '2', name: 'Kainoa Shintaku', role: 'family', relationship: 'Nephew' },
                  }
                  setCurrentUser(roleMap[role])
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentUserRole === role
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                {role === 'primary' ? 'Primary' : role === 'admin' ? 'Admin' : role === 'nurse' ? 'Nurse' : 'Family'}
              </button>
            ))}
          </div>
          {!isDemoMode && (
            <span className="text-xs text-mint-600 font-medium px-2 py-1 bg-mint-50 rounded-lg">
              Connected to Supabase
            </span>
          )}
        </div>

        {activeTab === 'home' && (
          <HomeView
            patient={patient}
            logEntries={logEntries}
            events={events}
            visits={visits}
            posts={posts}
            members={members}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRole={currentUserRole}
            onClaimVisit={(eventId) => handleClaimEvent(eventId, currentUserName)}
            onAddPost={handleAddPost}
            onLikePost={handleLikePost}
            onAddComment={handleAddPostComment}
          />
        )}

        {activeTab === 'calendar' && (
          <CareCalendar
            events={events.filter(e => getVisibleCalendarEventTypes(currentUserRole).includes(e.type))}
            onClaimEvent={handleClaimEvent}
            onAddEvent={handleAddEvent}
          />
        )}

        {activeTab === 'log' && (
          <div className="space-y-6">
            {/* Quick Actions for Nurses */}
            {canUseQuickActions(currentUserRole) && (
              <QuickActions
                medications={vault.medications}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onAddLogEntry={handleAddLogEntry}
              />
            )}

            {/* Log Sub-tabs */}
            <div className="flex gap-2 border-b border-primary-100 pb-2">
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
                      ? 'bg-primary-100 text-primary-700 shadow-soft'
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
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onAddLogEntry={handleAddLogEntry}
                onAddComment={handleAddLogComment}
              />
            )}

            {logSubTab === 'vitals' && <VitalsTrends logEntries={logEntries} />}

            {logSubTab === 'wellness' && <WellnessTrends days={wellnessDays} />}
          </div>
        )}

        {activeTab === 'circle' && (
          <CareCircle members={members} currentUserRole={currentUserRole} onAddMember={handleAddMember} />
        )}

        {activeTab === 'vault' && (
          <VaultComponent vault={vault} onUpdateVault={setVault} currentUserRole={currentUserRole} />
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
          <div className={`p-2 ${isDemoMode ? 'bg-primary-500' : 'bg-mint-500'} rounded-xl`}>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">{isDemoMode ? 'Demo Mode' : 'Live Mode'}</p>
            <p className="text-navy-200 text-xs">{isDemoMode ? 'Data stored locally' : 'Connected to Supabase'}</p>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        vault={canViewMedications(currentUserRole) ? vault : { ...vault, medications: [], providers: [], insuranceCards: [] }}
        logEntries={logEntries.filter(e => getVisibleLogCategories(currentUserRole).includes(e.category))}
        events={events.filter(e => getVisibleCalendarEventTypes(currentUserRole).includes(e.type))}
      />

      {/* AI Chat Assistant */}
      <ChatBot
        patientInfo={patient}
        logEntries={logEntries.filter(e => getVisibleLogCategories(currentUserRole).includes(e.category))}
        events={events.filter(e => getVisibleCalendarEventTypes(currentUserRole).includes(e.type))}
        vault={canViewMedications(currentUserRole) ? vault : { ...vault, medications: [], providers: [], insuranceCards: [] }}
        visits={visits}
      />
    </div>
  )
}
