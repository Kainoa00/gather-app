'use client'

import { useState } from 'react'
import {
  Gift,
  Ticket,
  Music,
  Utensils,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Plus,
  X,
  Check,
  MessageCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Sparkles
} from 'lucide-react'
import { FamilyGift, GiftType, CareCircleMember, FeedComment } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'

interface FamilyFunProps {
  gifts: FamilyGift[]
  members: CareCircleMember[]
  currentUserId: string
  isAdmin: boolean
  onAddGift: (gift: Omit<FamilyGift, 'id' | 'createdAt' | 'rsvps' | 'comments'>) => void
  onRsvp: (giftId: string) => void
  onAddComment: (giftId: string, comment: string) => void
}

const giftTypeConfig: Record<GiftType, { label: string; icon: typeof Gift; color: string; bgColor: string; gradient: string }> = {
  sports: {
    label: 'Sports',
    icon: Ticket,
    color: 'text-lavender-600',
    bgColor: 'bg-lavender-50',
    gradient: 'from-lavender-500 to-lavender-600'
  },
  event: {
    label: 'Event',
    icon: Music,
    color: 'text-mint-600',
    bgColor: 'bg-mint-50',
    gradient: 'from-mint-500 to-mint-600'
  },
  dining: {
    label: 'Dining',
    icon: Utensils,
    color: 'text-peach-600',
    bgColor: 'bg-peach-50',
    gradient: 'from-peach-500 to-peach-600'
  },
  giftcard: {
    label: 'Gift Card',
    icon: CreditCard,
    color: 'text-navy-600',
    bgColor: 'bg-cream-100',
    gradient: 'from-navy-600 to-navy-700'
  },
  other: {
    label: 'Other',
    icon: Gift,
    color: 'text-navy-600',
    bgColor: 'bg-cream-50',
    gradient: 'from-navy-500 to-navy-600'
  }
}

const filterTabs = [
  { id: 'all', label: 'All', icon: Gift },
  { id: 'sports', label: 'Sports', icon: Ticket },
  { id: 'event', label: 'Events', icon: Music },
  { id: 'dining', label: 'Dining', icon: Utensils },
  { id: 'giftcard', label: 'Gift Cards', icon: CreditCard }
]

export default function FamilyFun({
  gifts,
  members,
  currentUserId,
  isAdmin,
  onAddGift,
  onRsvp,
  onAddComment
}: FamilyFunProps) {
  const [filter, setFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<FamilyGift | null>(null)
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState('')
  const [newGift, setNewGift] = useState<Partial<FamilyGift>>({
    type: 'sports',
    title: '',
    description: '',
    forMembers: ['all']
  })

  const filteredGifts = gifts.filter(gift =>
    filter === 'all' || gift.type === filter
  ).sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const toggleCodeVisibility = (id: string) => {
    setVisibleCodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateGift = () => {
    if (!newGift.title?.trim()) return

    onAddGift({
      type: newGift.type as GiftType,
      title: newGift.title,
      description: newGift.description,
      date: newGift.date,
      time: newGift.time,
      location: newGift.location,
      details: newGift.details,
      value: newGift.value,
      code: newGift.code,
      sharedBy: currentUserId,
      sharedByName: members.find(m => m.id === currentUserId)?.name || 'Admin',
      forMembers: newGift.forMembers || ['all'],
      isFeatured: newGift.isFeatured
    })

    setNewGift({ type: 'sports', title: '', description: '', forMembers: ['all'] })
    setShowCreateModal(false)
  }

  const handleComment = () => {
    if (!selectedGift || !commentInput.trim()) return
    onAddComment(selectedGift.id, commentInput)
    setCommentInput('')
  }

  const currentMember = members.find(m => m.id === currentUserId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender-400 to-peach-400 rounded-2xl blur-md opacity-50"></div>
              <div className="relative p-3 bg-gradient-to-br from-lavender-500 to-peach-500 rounded-2xl shadow-float">
                <Gift className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Family Fun</h2>
              <p className="text-navy-600">Experiences that bring us together</p>
            </div>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Share Gift
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {filterTabs.map(tab => {
          const Icon = tab.icon
          const isActive = filter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-lavender-100 text-lavender-700 shadow-soft'
                  : 'bg-white/80 backdrop-blur-sm text-navy-600 hover:bg-cream-100 border border-cream-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Gifts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredGifts.map((gift, index) => {
          const config = giftTypeConfig[gift.type]
          const Icon = config.icon
          const isRsvped = gift.rsvps.includes(currentUserId)
          const isForMe = gift.forMembers.includes('all') || gift.forMembers.includes(currentUserId)

          return (
            <div
              key={gift.id}
              className={`feed-item relative card-glass overflow-hidden animate-slide-up opacity-0 ${
                gift.isFeatured ? 'ring-2 ring-lavender-300' : ''
              }`}
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
            >
              {/* Featured Badge */}
              {gift.isFeatured && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-lavender-500 to-peach-500 text-white text-xs font-semibold rounded-full shadow-float">
                  <Star className="h-3.5 w-3.5 fill-white" />
                  Featured
                </div>
              )}

              {/* Gift Type Banner */}
              <div className={`${config.bgColor} px-5 py-4 border-b border-white/50`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-gradient-to-br ${config.gradient} rounded-xl shadow-soft`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
                      {config.label}
                    </span>
                    <h3 className="text-lg font-bold text-navy-900 mt-0.5">{gift.title}</h3>
                  </div>
                </div>
              </div>

              {/* Gift Content */}
              <div className="p-5 space-y-4">
                {gift.description && (
                  <p className="text-navy-700">{gift.description}</p>
                )}

                {/* Date/Time/Location */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {gift.date && (
                    <div className="flex items-center gap-2 text-navy-600">
                      <Calendar className="h-4 w-4 text-lavender-500" />
                      {format(new Date(gift.date), 'EEE, MMM d, yyyy')}
                    </div>
                  )}
                  {gift.time && (
                    <div className="flex items-center gap-2 text-navy-600">
                      <Clock className="h-4 w-4 text-lavender-500" />
                      {gift.time}
                    </div>
                  )}
                  {gift.location && (
                    <div className="flex items-center gap-2 text-navy-600">
                      <MapPin className="h-4 w-4 text-peach-500" />
                      {gift.location}
                    </div>
                  )}
                </div>

                {/* Details */}
                {gift.details && (
                  <div className="bg-cream-100/80 rounded-xl px-4 py-3 text-sm text-navy-700 border border-cream-200">
                    {gift.details}
                  </div>
                )}

                {/* Gift Card Code */}
                {gift.type === 'giftcard' && gift.code && (
                  <div className="bg-gradient-to-r from-lavender-50 to-peach-50 rounded-xl p-4 border border-lavender-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-navy-500 mb-1">Gift Card Code</p>
                        <p className="font-mono text-lg font-bold text-navy-800">
                          {visibleCodes.has(gift.id) ? gift.code : '••••••••••••'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCodeVisibility(gift.id)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          {visibleCodes.has(gift.id) ? (
                            <EyeOff className="h-5 w-5 text-navy-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-navy-500" />
                          )}
                        </button>
                        <button
                          onClick={() => copyCode(gift.code!, gift.id)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          {copiedId === gift.id ? (
                            <Check className="h-5 w-5 text-mint-600" />
                          ) : (
                            <Copy className="h-5 w-5 text-navy-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    {gift.value && (
                      <p className="text-2xl font-bold gradient-text mt-2">${gift.value}</p>
                    )}
                  </div>
                )}

                {/* For Members */}
                <div className="flex items-center gap-2 text-sm text-navy-500">
                  <Users className="h-4 w-4" />
                  <span>
                    For: {gift.forMembers.includes('all')
                      ? 'Everyone'
                      : gift.forMembers.map(id => members.find(m => m.id === id)?.name.split(' ')[0]).join(', ')
                    }
                  </span>
                </div>

                {/* RSVP Section */}
                {(gift.type === 'sports' || gift.type === 'event' || gift.type === 'dining') && (
                  <div className="pt-4 border-t border-lavender-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-navy-700">Who's going?</p>
                        <div className="flex -space-x-2">
                          {gift.rsvps.slice(0, 4).map(id => {
                            const member = members.find(m => m.id === id)
                            return (
                              <div
                                key={id}
                                className="h-8 w-8 rounded-xl bg-gradient-to-br from-lavender-400 to-mint-400 flex items-center justify-center border-2 border-white text-xs font-semibold text-white shadow-soft"
                                title={member?.name}
                              >
                                {member?.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )
                          })}
                          {gift.rsvps.length > 4 && (
                            <div className="h-8 w-8 rounded-xl bg-cream-200 flex items-center justify-center border-2 border-white text-xs font-medium text-navy-600">
                              +{gift.rsvps.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                      {isForMe && (
                        <button
                          onClick={() => onRsvp(gift.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                            isRsvped
                              ? 'bg-mint-100 text-mint-700'
                              : 'bg-gradient-to-r from-lavender-500 to-lavender-600 text-white shadow-float hover:-translate-y-0.5'
                          }`}
                        >
                          {isRsvped ? (
                            <>
                              <Check className="h-4 w-4" />
                              I'm In!
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Count Me In
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedGift(gift)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cream-100/80 hover:bg-cream-200/80 text-navy-700 font-medium rounded-xl transition-all duration-300 border border-cream-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  {gift.comments.length > 0 ? `${gift.comments.length} Comments` : 'Add Comment'}
                </button>
              </div>

              {/* Shared By */}
              <div className="px-5 py-3 bg-cream-100/50 border-t border-cream-200/50 flex items-center justify-between">
                <p className="text-sm text-navy-500">
                  Shared by <span className="font-medium text-navy-700">{gift.sharedByName}</span>
                </p>
                <p className="text-xs text-navy-400">
                  {formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredGifts.length === 0 && (
        <div className="text-center py-16 card-glass animate-slide-up">
          <Gift className="h-16 w-16 text-lavender-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-700 mb-2">No gifts yet</h3>
          <p className="text-navy-500 mb-6">
            {isAdmin ? 'Share something special with your family!' : 'Check back later for family gifts and experiences.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Share Your First Gift
            </button>
          )}
        </div>
      )}

      {/* Create Gift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-glass-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-lavender-100/50 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-xl font-bold text-navy-900">Share a Gift</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Gift Type */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(giftTypeConfig).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={type}
                        onClick={() => setNewGift(prev => ({ ...prev, type: type as GiftType }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                          newGift.type === type
                            ? `${config.bgColor} ${config.color} ring-2 ring-lavender-300`
                            : 'bg-cream-50 text-navy-600 hover:bg-cream-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newGift.title || ''}
                  onChange={(e) => setNewGift(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Jazz vs Lakers Game"
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Description</label>
                <textarea
                  value={newGift.description || ''}
                  onChange={(e) => setNewGift(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Date & Time (for events) */}
              {(newGift.type === 'sports' || newGift.type === 'event' || newGift.type === 'dining') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newGift.date ? format(new Date(newGift.date), 'yyyy-MM-dd') : ''}
                      onChange={(e) => setNewGift(prev => ({ ...prev, date: new Date(e.target.value) }))}
                      className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={newGift.time || ''}
                      onChange={(e) => setNewGift(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              {(newGift.type === 'sports' || newGift.type === 'event' || newGift.type === 'dining') && (
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newGift.location || ''}
                    onChange={(e) => setNewGift(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Delta Center, Salt Lake City"
                    className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all"
                  />
                </div>
              )}

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Details</label>
                <input
                  type="text"
                  value={newGift.details || ''}
                  onChange={(e) => setNewGift(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="e.g., Section 108, Row 12, Seats 1-4"
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all"
                />
              </div>

              {/* Gift Card specific fields */}
              {newGift.type === 'giftcard' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Value ($)</label>
                    <input
                      type="number"
                      value={newGift.value || ''}
                      onChange={(e) => setNewGift(prev => ({ ...prev, value: Number(e.target.value) }))}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Code</label>
                    <input
                      type="text"
                      value={newGift.code || ''}
                      onChange={(e) => setNewGift(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent font-mono transition-all"
                    />
                  </div>
                </div>
              )}

              {/* For Members */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">For</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setNewGift(prev => ({ ...prev, forMembers: ['all'] }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      newGift.forMembers?.includes('all')
                        ? 'bg-lavender-100 text-lavender-700 ring-2 ring-lavender-300'
                        : 'bg-cream-100 text-navy-600 hover:bg-cream-200'
                    }`}
                  >
                    Everyone
                  </button>
                  {members.map(member => (
                    <button
                      key={member.id}
                      onClick={() => {
                        const current = newGift.forMembers?.filter(id => id !== 'all') || []
                        const updated = current.includes(member.id)
                          ? current.filter(id => id !== member.id)
                          : [...current, member.id]
                        setNewGift(prev => ({ ...prev, forMembers: updated.length > 0 ? updated : ['all'] }))
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        newGift.forMembers?.includes(member.id) && !newGift.forMembers?.includes('all')
                          ? 'bg-lavender-100 text-lavender-700 ring-2 ring-lavender-300'
                          : 'bg-cream-100 text-navy-600 hover:bg-cream-200'
                      }`}
                    >
                      {member.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={newGift.isFeatured || false}
                    onChange={(e) => setNewGift(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-cream-200 rounded-full peer peer-checked:bg-lavender-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-soft"></div>
                </div>
                <span className="text-sm font-medium text-navy-700">Mark as Featured</span>
              </label>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-lavender-100/50 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGift}
                disabled={!newGift.title?.trim()}
                className="flex-1 btn-primary disabled:from-cream-200 disabled:to-cream-200 disabled:text-navy-400 disabled:shadow-none"
              >
                Share Gift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Detail Modal */}
      {selectedGift && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-glass-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-lavender-100/50 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-xl font-bold text-navy-900">{selectedGift.title}</h3>
              <button
                onClick={() => setSelectedGift(null)}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Comments */}
              <div className="space-y-3">
                {selectedGift.comments.length === 0 ? (
                  <p className="text-center text-navy-500 py-8">No comments yet. Be the first!</p>
                ) : (
                  selectedGift.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="h-10 w-10 rounded-xl bg-lavender-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lavender-700 text-sm font-medium">
                          {comment.authorName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 bg-cream-100/80 rounded-2xl px-4 py-3 border border-cream-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-navy-800">{comment.authorName}</span>
                          <span className="text-xs text-navy-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-navy-700">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="flex items-center gap-3 pt-4 border-t border-lavender-100/50">
                <div className="h-10 w-10 rounded-xl bg-lavender-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lavender-700 text-sm font-medium">
                    {currentMember?.name.split(' ').map(n => n[0]).join('') || 'Y'}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-cream-100/80 rounded-xl px-4 py-2 border border-cream-200">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-navy-800 placeholder:text-navy-400 focus:outline-none"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentInput.trim()}
                    className="p-2 text-lavender-500 disabled:text-navy-300 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
