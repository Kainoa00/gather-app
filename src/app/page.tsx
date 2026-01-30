'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import CareCircle from '@/components/CareCircle'
import CareCalendar from '@/components/CareCalendar'
import VaultComponent from '@/components/Vault'
import IncidentFeed from '@/components/IncidentFeed'
import HomeFeed from '@/components/HomeFeed'
import FamilyFun from '@/components/FamilyFun'
import ExportModal from '@/components/ExportModal'
import { demoMembers, demoEvents, demoVault, demoIncidents, demoPosts, demoGifts } from '@/lib/demo-data'
import { CareCircleMember, CalendarEvent, Vault, Incident, EventType, IncidentSeverity, FeedPost, FamilyGift } from '@/types'
import { Heart, Shield, Calendar, Users, Activity, ArrowRight, Sparkles, Download, Home as HomeIcon, Gift, Star, Zap, Lock, Camera, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('landing')
  const [members, setMembers] = useState<CareCircleMember[]>(demoMembers)
  const [events, setEvents] = useState<CalendarEvent[]>(demoEvents)
  const [vault, setVault] = useState<Vault>(demoVault)
  const [incidents, setIncidents] = useState<Incident[]>(demoIncidents)
  const [posts, setPosts] = useState<FeedPost[]>(demoPosts)
  const [gifts, setGifts] = useState<FamilyGift[]>(demoGifts)
  const [showExportModal, setShowExportModal] = useState(false)

  const currentUserId = '1' // Demo: Sarah is the current user (admin)

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

  // Home Feed handlers
  const handleAddPost = (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    const newPost: FeedPost = {
      ...post,
      id: String(posts.length + 1),
      createdAt: new Date(),
      likes: [],
      comments: []
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
            : [...post.likes, currentUserId]
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
            createdAt: new Date()
          }]
        }
      }
      return post
    }))
  }

  // Family Fun handlers
  const handleAddGift = (gift: Omit<FamilyGift, 'id' | 'createdAt' | 'rsvps' | 'comments'>) => {
    const newGift: FamilyGift = {
      ...gift,
      id: `g${gifts.length + 1}`,
      createdAt: new Date(),
      rsvps: [],
      comments: []
    }
    setGifts([newGift, ...gifts])
  }

  const handleRsvp = (giftId: string) => {
    setGifts(gifts.map(gift => {
      if (gift.id === giftId) {
        const isRsvped = gift.rsvps.includes(currentUserId)
        return {
          ...gift,
          rsvps: isRsvped
            ? gift.rsvps.filter(id => id !== currentUserId)
            : [...gift.rsvps, currentUserId]
        }
      }
      return gift
    }))
  }

  const handleAddGiftComment = (giftId: string, content: string) => {
    const currentMember = members.find(m => m.id === currentUserId)
    setGifts(gifts.map(gift => {
      if (gift.id === giftId) {
        return {
          ...gift,
          comments: [...gift.comments, {
            id: `gc${Date.now()}`,
            authorId: currentUserId,
            authorName: currentMember?.name || 'You',
            content,
            createdAt: new Date()
          }]
        }
      }
      return gift
    }))
  }

  const handleViewGift = (giftId: string) => {
    setActiveTab('fun')
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
                <span className="gradient-text">Gather</span>
              </h1>

              <p className="mt-6 text-xl sm:text-2xl text-navy-600 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
                One secure place for your family.
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
                  <Zap className="h-6 w-6 text-peach-600" />
                </div>
              </div>
              <p className="text-lg text-navy-700">
                <strong className="text-navy-900">Think about this:</strong> If you had to go to the ER with your parent right now,
                would you have their medication list and insurance ID ready?
              </p>
              <p className="mt-2 text-peach-600 font-medium">
                Upload them to Gather now so you're prepared when it matters most.
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
                Stop the chaos of group texts. Gather keeps everyone on the same page.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1 - Home Feed (Large) */}
              <div className="bento-item md:col-span-2 lg:col-span-2 card-glass p-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="p-4 bg-gradient-to-br from-lavender-100 to-lavender-200 rounded-2xl shrink-0">
                    <Camera className="h-8 w-8 text-lavender-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-2">Family Feed</h3>
                    <p className="text-navy-600 text-lg leading-relaxed">
                      Share photos and videos of precious family moments. Like a private Instagram just for your loved ones. Keep everyone connected no matter the distance.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-lavender-100 text-lavender-700 text-sm font-medium rounded-full">Photos</span>
                      <span className="px-3 py-1 bg-lavender-100 text-lavender-700 text-sm font-medium rounded-full">Videos</span>
                      <span className="px-3 py-1 bg-lavender-100 text-lavender-700 text-sm font-medium rounded-full">Comments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Calendar */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-mint-100 rounded-2xl w-fit mb-4">
                  <Calendar className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Care Calendar</h3>
                <p className="text-navy-600">
                  Track appointments with "I'll do it" claim buttons. No more coordination mistakes.
                </p>
              </div>

              {/* Feature 3 - Family Fun */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-peach-100 rounded-2xl w-fit mb-4">
                  <Gift className="h-6 w-6 text-peach-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Family Fun</h3>
                <p className="text-navy-600">
                  Share tickets, gift cards, and restaurant reservations. Plan experiences together.
                </p>
              </div>

              {/* Feature 4 - Care Circle */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-lavender-100 rounded-2xl w-fit mb-4">
                  <Users className="h-6 w-6 text-lavender-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Care Circle</h3>
                <p className="text-navy-600">
                  Invite family with role-based permissions. Everyone sees exactly what they need.
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
                      Insurance cards, medications, healthcare providers, and access codes. All critical information in one secure, easily accessible place.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Insurance</span>
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Medications</span>
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Providers</span>
                      <span className="px-3 py-1 bg-mint-100 text-mint-700 text-sm font-medium rounded-full">Access Codes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 6 - Care Log */}
              <div className="bento-item card-glass p-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="p-3 bg-cream-200 rounded-2xl w-fit mb-4">
                  <Activity className="h-6 w-6 text-navy-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Care Log</h3>
                <p className="text-navy-600">
                  Log health updates with photos. Searchable history for doctor visits and incidents.
                </p>
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
                Gather uses encryption at rest and in transit, with
                two-factor authentication for sensitive data access.
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
                  <span className="font-medium">Two-factor auth</span>
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
                  Start Coordinating Today
                </h2>
                <p className="text-lg text-navy-200 mb-10">
                  Set up your Care Circle in minutes. Your family will thank you.
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
            <p className="text-navy-600 font-medium">Gather</p>
            <p className="mt-1 text-navy-500 text-sm">One secure place for your family</p>
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

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HomeFeed
            posts={posts}
            members={members}
            currentUserId={currentUserId}
            onAddPost={handleAddPost}
            onLikePost={handleLikePost}
            onAddComment={handleAddPostComment}
            onViewGift={handleViewGift}
          />
        )}
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
        {activeTab === 'fun' && (
          <FamilyFun
            gifts={gifts}
            members={members}
            currentUserId={currentUserId}
            isAdmin={members.find(m => m.id === currentUserId)?.role === 'admin'}
            onAddGift={handleAddGift}
            onRsvp={handleRsvp}
            onAddComment={handleAddGiftComment}
          />
        )}
        {activeTab === 'vault' && (
          <VaultComponent vault={vault} onUpdateVault={setVault} />
        )}
        {activeTab === 'log' && (
          <IncidentFeed incidents={incidents} onAddIncident={handleAddIncident} />
        )}
      </main>

      {/* Export Button */}
      <button
        onClick={() => setShowExportModal(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 p-3.5 bg-gradient-to-br from-lavender-500 to-lavender-600 text-white rounded-2xl shadow-float hover:shadow-float hover:-translate-y-0.5 transition-all duration-300"
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
        incidents={incidents}
        events={events}
      />
    </div>
  )
}
