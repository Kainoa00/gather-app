'use client'

import { useState, useEffect } from 'react'
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
import ErrorBoundary from '@/components/ErrorBoundary'
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
import { CareCircleMember, CalendarEvent, Vault, LogEntry, FeedPost, UserRole, Visit, Notification, FacilityReviewEntry } from '@/types'
import { Heart, Shield, Calendar, Users, ClipboardList, Sparkles, Download, Lock, CheckCircle2, MessageSquare, TrendingUp, Star, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'
import { demoGoals } from '@/lib/demo-data'
import { auditPatient } from '@/lib/audit'
import {
  canUseQuickActions,
  canViewMedications,
  getVisibleCalendarEventTypes,
  getVisibleNotificationTypes,
  getVisibleLogCategories,
} from '@/lib/permissions'

export default function Home() {
  const [activeTab, setActiveTab] = useState('login')
  const [showExportModal, setShowExportModal] = useState(false)
  const [internalReviews, setInternalReviews] = useState<FacilityReviewEntry[]>([])

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

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 5000)
  }

  // HIPAA audit logging on login
  useEffect(() => {
    if (currentUser) {
      auditPatient(currentUser.id, currentUser.name, currentUser.role)
    }
  }, [currentUser])

  // Sub-tab states
  const [logSubTab, setLogSubTab] = useState<'timeline' | 'trends' | 'vitals' | 'wellness' | 'progress'>('timeline')

  // Supabase data hooks (fall back to demo data when isDemoMode)
  const { patient } = usePatient(DEMO_PATIENT_ID)
  const { members, loading: membersLoading, setMembers, refetch: refetchMembers } = useMembers(DEMO_PATIENT_ID)
  const { events, loading: eventsLoading, setEvents, refetch: refetchEvents } = useEvents(DEMO_PATIENT_ID)
  const { logEntries, loading: logsLoading, setLogEntries, refetch: refetchLogs } = useLogEntries(DEMO_PATIENT_ID)
  const { posts, loading: postsLoading, setPosts, refetch: refetchPosts } = usePosts(DEMO_PATIENT_ID)
  const { visits, setVisits, refetch: refetchVisits } = useVisits(DEMO_PATIENT_ID)
  const { notifications, setNotifications, refetch: refetchNotifications } = useNotifications(DEMO_PATIENT_ID)
  const { vault, setVault, refetch: refetchVault } = useVault(DEMO_PATIENT_ID)
  const { wellnessDays } = useWellnessDays(DEMO_PATIENT_ID)

  // ==========================================
  // Handler functions (demo mode = local state, Supabase mode = DB + refetch)
  // ==========================================

  const handleAddMember = async (member: Omit<CareCircleMember, 'id' | 'joinedAt'>) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (isDemoMode) {
        const newMember: CareCircleMember = {
          ...member,
          id: crypto.randomUUID(),
          joinedAt: new Date(),
        }
        setMembers([...members, newMember])
      } else {
        await addMemberToDb(member, DEMO_PATIENT_ID)
        refetchMembers()
      }
    } catch (error) {
      showError('Something went wrong. Please try again.')
      console.error('[ERROR]', error)
    } finally {
      setIsSubmitting(false)
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
        showError('Something went wrong. Please try again.')
        console.error('[ERROR]', error)
      }
    }
  }

  const handleAddEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (isDemoMode) {
        const newEvent: CalendarEvent = {
          ...event,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          createdBy: currentUserId,
        }
        setEvents([...events, newEvent])
      } else {
        await addEventToDb(event, currentUserId, DEMO_PATIENT_ID)
        refetchEvents()
      }
    } catch (error) {
      showError('Something went wrong. Please try again.')
      console.error('[ERROR]', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Care Log handlers
  const handleAddLogEntry = async (entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'>) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (isDemoMode) {
        const newEntry: LogEntry = {
          ...entry,
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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
      }
    } catch (error) {
      showError('Something went wrong. Please try again.')
      console.error('[ERROR]', error)
    } finally {
      setIsSubmitting(false)
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
              id: crypto.randomUUID(),
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
        showError('Something went wrong. Please try again.')
        console.error('[ERROR]', error)
      }
    }
  }

  // Home Feed handlers
  const handleAddPost = async (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (isDemoMode) {
        const newPost: FeedPost = {
          ...post,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          likes: [],
          comments: [],
        }
        setPosts([newPost, ...posts])
      } else {
        await addPostToDb(post, DEMO_PATIENT_ID)
        refetchPosts()
      }
    } catch (error) {
      showError('Something went wrong. Please try again.')
      console.error('[ERROR]', error)
    } finally {
      setIsSubmitting(false)
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
        showError('Something went wrong. Please try again.')
        console.error('[ERROR]', error)
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
              id: crypto.randomUUID(),
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
        showError('Something went wrong. Please try again.')
        console.error('[ERROR]', error)
      }
    }
  }

  // Visit handlers
  const handleCheckIn = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const currentMember = members.find(m => m.id === currentUserId)
      if (isDemoMode) {
        const newVisit: Visit = {
          id: crypto.randomUUID(),
          visitorId: currentUserId,
          visitorName: currentMember?.name || currentUserName,
          visitorRelationship: currentMember?.relationship,
          checkInTime: new Date(),
        }
        setVisits([newVisit, ...visits])
      } else {
        await checkInToDb(
          currentUserId,
          currentMember?.name || currentUserName,
          currentMember?.relationship,
          DEMO_PATIENT_ID
        )
        refetchVisits()
      }
    } catch (error) {
      showError('Something went wrong. Please try again.')
      console.error('[ERROR]', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckOut = async (mood: string, note: string) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
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
          id: crypto.randomUUID(),
          type: 'visit',
          title: `${currentUserName} Visited`,
          message: note || 'Family visit completed',
          sourceId: crypto.randomUUID(),
          sourceType: 'visit',
          createdAt: new Date(),
          readBy: [],
        }
        setNotifications([newNotification, ...notifications])
      } else {
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
      }
    } catch (error) {
      showError('Something went wrong. Please try again.')
      console.error('[ERROR]', error)
    } finally {
      setIsSubmitting(false)
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
        showError('Something went wrong. Please try again.')
        console.error('[ERROR]', error)
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
        showError('Something went wrong. Please try again.')
        console.error('[ERROR]', error)
      }
    }
  }

  // Review handler
  const handleAddReview = (review: FacilityReviewEntry) => {
    setInternalReviews(prev => [review, ...prev])
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

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navigation with Notification Bell */}
      <div className="glass-strong sticky top-0 z-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="absolute right-4 top-0 h-16 flex items-center z-50">
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

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Role switcher + user banner */}
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-navy-500">Viewing as:</span>
          <span className="text-sm font-semibold text-navy-800">{currentUserName}</span>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
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
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
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
          <ErrorBoundary>
            <HomeView
              patient={patient}
              logEntries={logEntries}
              events={events}
              visits={visits}
              members={members}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserRole={currentUserRole}
              reviews={internalReviews}
              onClaimVisit={(eventId) => handleClaimEvent(eventId, currentUserName)}
              onAddReview={handleAddReview}
              onNavigateToCalendar={() => setActiveTab('calendar')}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'calendar' && (
          <ErrorBoundary>
            <CareCalendar
              events={events.filter(e => getVisibleCalendarEventTypes(currentUserRole).includes(e.type))}
              onClaimEvent={handleClaimEvent}
              onAddEvent={handleAddEvent}
              loading={eventsLoading}
            />
          </ErrorBoundary>
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
            <div className="flex gap-2 border-b border-primary-100 pb-2 flex-wrap">
              {[
                { id: 'timeline' as const, label: 'Timeline' },
                { id: 'wellness' as const, label: 'Wellness' },
                { id: 'progress' as const, label: 'Progress' },
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
              <ErrorBoundary>
                <CareLog
                  logEntries={logEntries}
                  currentUserRole={currentUserRole}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  patientName={patient?.name ?? 'the patient'}
                  onAddLogEntry={handleAddLogEntry}
                  onAddComment={handleAddLogComment}
                  loading={logsLoading}
                />
              </ErrorBoundary>
            )}

            {logSubTab === 'wellness' && <WellnessTrends days={wellnessDays} />}

            {logSubTab === 'progress' && (
              <div className="space-y-6">
                {/* Recovery Goals */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-bold text-navy-900 mb-5">Recovery Goals</h3>
                  <div className="space-y-6">
                    {demoGoals.map(goal => (
                      <div key={goal.id}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-semibold text-navy-900">{goal.title}</p>
                            <p className="text-xs text-navy-500">{goal.category} · Target: {goal.targetDate}</p>
                          </div>
                          <span className={`text-base font-bold ${
                            goal.progressPercent >= 70 ? 'text-mint-600'
                              : goal.progressPercent >= 40 ? 'text-amber-600'
                              : 'text-red-500'
                          }`}>{goal.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-navy-100 rounded-full h-3 mb-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              goal.progressPercent >= 70 ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                                : goal.progressPercent >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${goal.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {goal.milestones.map((milestone, i) => {
                            const completed = (i / goal.milestones.length) * 100 < goal.progressPercent
                            return (
                              <label key={i} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-default select-none ${
                                completed ? 'bg-mint-50 text-mint-700' : 'bg-cream-100 text-navy-400'
                              }`}>
                                <CheckSquare className={`h-3.5 w-3.5 flex-shrink-0 ${completed ? 'text-mint-600' : 'text-navy-300'}`} />
                                {milestone}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Therapy Session Stats */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-bold text-navy-900 mb-5">Activity Completion</h3>
                  {(() => {
                    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                    const thisWeek = logEntries.filter(e => new Date(e.createdAt) >= sevenDaysAgo)
                    const lastWeek = logEntries.filter(e => new Date(e.createdAt) >= fourteenDaysAgo && new Date(e.createdAt) < sevenDaysAgo)
                    const therapyThis = thisWeek.filter(e => e.category === 'activity' && (e.activityLog?.activityType === 'physical_therapy' || e.activityLog?.activityType === 'occupational_therapy')).length
                    const therapyLast = lastWeek.filter(e => e.category === 'activity' && (e.activityLog?.activityType === 'physical_therapy' || e.activityLog?.activityType === 'occupational_therapy')).length
                    const mealThis = thisWeek.filter(e => e.category === 'activity' && e.activityLog?.activityType === 'meal')
                    const mealLast = lastWeek.filter(e => e.category === 'activity' && e.activityLog?.activityType === 'meal')
                    const participationMap: Record<string, number> = { active: 90, moderate: 60, minimal: 25, refused: 0 }
                    const avgThis = mealThis.length > 0 ? Math.round(mealThis.reduce((s, e) => s + (participationMap[e.activityLog?.participation || 'moderate'] ?? 60), 0) / mealThis.length) : 0
                    const avgLast = mealLast.length > 0 ? Math.round(mealLast.reduce((s, e) => s + (participationMap[e.activityLog?.participation || 'moderate'] ?? 60), 0) / mealLast.length) : 0
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-2xl text-center">
                            <p className="text-3xl font-bold text-blue-700">{therapyThis}</p>
                            <p className="text-xs font-medium text-blue-600 mt-1">Therapy Sessions</p>
                            <p className="text-xs text-navy-500">this week</p>
                            {therapyLast > 0 && (
                              <p className={`text-xs font-medium mt-1 flex items-center justify-center gap-1 ${therapyThis >= therapyLast ? 'text-mint-600' : 'text-amber-600'}`}>
                                {therapyThis >= therapyLast ? '↑' : '↓'} vs {therapyLast} last week
                              </p>
                            )}
                          </div>
                          <div className="p-4 bg-green-50 rounded-2xl text-center">
                            <p className="text-3xl font-bold text-green-700">{avgThis > 0 ? `${avgThis}%` : '—'}</p>
                            <p className="text-xs font-medium text-green-600 mt-1">Meal Participation</p>
                            <p className="text-xs text-navy-500">avg this week</p>
                            {avgLast > 0 && avgThis > 0 && (
                              <p className={`text-xs font-medium mt-1 flex items-center justify-center gap-1 ${avgThis >= avgLast ? 'text-mint-600' : 'text-amber-600'}`}>
                                {avgThis >= avgLast ? '↑' : '↓'} from {avgLast}% last week
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-4 bg-primary-50 rounded-2xl">
                          <p className="text-sm text-primary-700 leading-relaxed">
                            {therapyThis > therapyLast
                              ? `Therapy participation improved from ${therapyLast} → ${therapyThis} sessions this week.`
                              : therapyThis === therapyLast && therapyThis > 0
                                ? `Therapy sessions are consistent at ${therapyThis} per week.`
                                : therapyThis > 0
                                  ? `${therapyThis} therapy session${therapyThis > 1 ? 's' : ''} completed this week.`
                                  : 'Therapy sessions are scheduled this week.'
                            }
                            {avgThis > 0 && avgLast > 0
                              ? avgThis >= avgLast
                                ? ` Meal participation improved from ${avgLast}% → ${avgThis}% this week.`
                                : ` Meal participation changed from ${avgLast}% → ${avgThis}% this week.`
                              : ''
                            }
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Admin: Internal Feedback */}
            {currentUserRole === 'admin' && internalReviews.filter(r => !r.isPublic).length > 0 && (
              <div className="card-glass p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-amber-50">
                    <Star className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">Internal Feedback</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    {internalReviews.filter(r => !r.isPublic).length} private
                  </span>
                </div>
                <div className="space-y-3">
                  {internalReviews.filter(r => !r.isPublic).map(review => (
                    <div key={review.id} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-navy-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-navy-700">{review.authorName}</span>
                        <span className="text-xs text-navy-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      {review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {review.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-white rounded-full text-xs text-navy-600 capitalize">{tag}</span>
                          ))}
                        </div>
                      )}
                      {review.content && <p className="text-sm text-navy-700 leading-relaxed">{review.content}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'circle' && (
          <ErrorBoundary>
            <CareCircle members={members} currentUserRole={currentUserRole} onAddMember={handleAddMember} loading={membersLoading} />
          </ErrorBoundary>
        )}

        {activeTab === 'vault' && (
          <ErrorBoundary>
            <VaultComponent vault={vault} onUpdateVault={setVault} currentUserRole={currentUserRole} />
          </ErrorBoundary>
        )}
      </main>

      {/* Export Button - positioned above chatbot */}
      <button
        onClick={() => setShowExportModal(true)}
        className="fixed bottom-36 md:bottom-24 right-6 p-3.5 bg-gradient-to-br from-navy-600 to-navy-700 text-white rounded-2xl shadow-float hover:shadow-float hover:-translate-y-0.5 transition-all duration-300 z-30"
        title="Export & Share"
      >
        <Download className="h-5 w-5" />
      </button>

      {/* Demo Notice */}
      <div className="fixed bottom-20 md:bottom-4 left-4 right-20 sm:left-auto sm:right-20 sm:w-auto">
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3">
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

      {/* Error toast */}
      {errorMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          {errorMsg}
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
