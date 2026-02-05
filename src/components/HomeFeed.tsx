'use client'

import { useState, useRef } from 'react'
import {
  Heart,
  MessageCircle,
  MapPin,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Smile,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react'
import { FeedPost, FeedComment, CareCircleMember } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface HomeFeedProps {
  posts: FeedPost[]
  members: CareCircleMember[]
  currentUserId: string
  onAddPost: (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => void
  onLikePost: (postId: string) => void
  onAddComment: (postId: string, comment: string) => void
}

const postTypeConfig = {
  visit_recap: { label: 'Visit Recap', color: 'bg-lavender-100 text-lavender-700', icon: Users },
  facility_moment: { label: 'Facility Moment', color: 'bg-mint-100 text-mint-700', icon: Star },
  activity_photo: { label: 'Activity', color: 'bg-peach-100 text-peach-700', icon: Star },
  milestone: { label: 'Milestone', color: 'bg-amber-100 text-amber-700', icon: Star },
  general: { label: 'Update', color: 'bg-cream-200 text-navy-700', icon: Star },
}

const roleColors: Record<string, string> = {
  nurse: 'from-mint-400 to-mint-500',
  family: 'from-lavender-400 to-lavender-500',
  admin: 'from-lavender-400 to-peach-400',
}

export default function HomeFeed({
  posts,
  members,
  currentUserId,
  onAddPost,
  onLikePost,
  onAddComment,
}: HomeFeedProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({
    content: '',
    media: [] as { type: 'image' | 'video'; url: string }[],
    location: '',
    postType: 'visit_recap' as FeedPost['postType'],
  })
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [mediaIndex, setMediaIndex] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentMember = members.find((m) => m.id === currentUserId)

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const type = file.type.startsWith('video/') ? 'video' : 'image'
        setNewPost((prev) => ({
          ...prev,
          media: [...prev.media, { type, url: event.target?.result as string }],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMedia = (index: number) => {
    setNewPost((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }))
  }

  const handleCreatePost = () => {
    if (!newPost.content.trim() && newPost.media.length === 0) return
    onAddPost({
      authorId: currentUserId,
      authorName: currentMember?.name || 'You',
      authorInitials: currentMember?.name.split(' ').map((n) => n[0]).join('') || 'Y',
      authorRole: currentMember?.role || 'family',
      content: newPost.content,
      postType: newPost.postType,
      media: newPost.media.length > 0 ? newPost.media : undefined,
      location: newPost.location || undefined,
    })
    setNewPost({ content: '', media: [], location: '', postType: 'visit_recap' })
    setShowCreateModal(false)
  }

  const handleComment = (postId: string) => {
    const comment = commentInputs[postId]?.trim()
    if (!comment) return
    onAddComment(postId, comment)
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const navigateMedia = (postId: string, direction: 'prev' | 'next', totalMedia: number) => {
    setMediaIndex((prev) => {
      const current = prev[postId] || 0
      const next = direction === 'next' ? (current + 1) % totalMedia : (current - 1 + totalMedia) % totalMedia
      return { ...prev, [postId]: next }
    })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Create Post Card */}
      <div className="card-glass p-5 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${roleColors[currentMember?.role || 'family']} flex items-center justify-center flex-shrink-0 shadow-soft`}>
            <span className="text-white font-bold text-lg">
              {currentMember?.name.split(' ').map((n) => n[0]).join('') || 'Y'}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 text-left px-5 py-3.5 bg-cream-100/80 hover:bg-cream-200/80 rounded-2xl text-navy-400 transition-all duration-300 border border-cream-200"
          >
            Share a visit, moment, or update...
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-lavender-100/50">
          <button
            onClick={() => { setShowCreateModal(true); setTimeout(() => fileInputRef.current?.click(), 100) }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-mint-50 rounded-xl transition-all duration-300"
          >
            <ImageIcon className="h-5 w-5 text-mint-500" />
            Photo
          </button>
          <button
            onClick={() => { setShowCreateModal(true); setTimeout(() => fileInputRef.current?.click(), 100) }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-lavender-50 rounded-xl transition-all duration-300"
          >
            <Video className="h-5 w-5 text-lavender-500" />
            Video
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-peach-50 rounded-xl transition-all duration-300"
          >
            <MapPin className="h-5 w-5 text-peach-500" />
            Location
          </button>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {posts.map((post, index) => {
          const isLiked = post.likes.includes(currentUserId)
          const showComments = expandedComments.has(post.id)
          const currentMediaIndex = mediaIndex[post.id] || 0
          const hasMultipleMedia = post.media && post.media.length > 1
          const typeConfig = postTypeConfig[post.postType] || postTypeConfig.general

          return (
            <article
              key={post.id}
              className="feed-item card-glass overflow-hidden animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
            >
              {/* Pinned/Milestone Banner */}
              {post.isPinned && (
                <div className="bg-gradient-to-r from-amber-50 to-peach-50 px-5 py-3 flex items-center gap-2 border-b border-amber-100/50">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">Milestone Update</span>
                </div>
              )}

              {/* Post Header */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${roleColors[post.authorRole] || roleColors.family} flex items-center justify-center shadow-soft`}>
                      <span className="text-white font-semibold">{post.authorInitials}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy-900">{post.authorName}</h3>
                        {post.authorRole === 'nurse' && (
                          <span className="px-1.5 py-0.5 bg-mint-100 text-mint-700 text-xs font-medium rounded-md flex items-center gap-0.5">
                            <Stethoscope className="h-3 w-3" /> Staff
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-navy-500">
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        {post.location && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {post.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              {post.content && (
                <div className="px-5 pb-4">
                  <p className="text-navy-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              )}

              {/* Media */}
              {post.media && post.media.length > 0 && (
                <div className="relative img-zoom">
                  {post.media[currentMediaIndex].type === 'image' ? (
                    <img src={post.media[currentMediaIndex].url} alt="Post media" className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="relative w-full aspect-square bg-navy-900 flex items-center justify-center">
                      <video src={post.media[currentMediaIndex].url} className="w-full h-full object-cover" controls />
                    </div>
                  )}
                  {hasMultipleMedia && (
                    <>
                      <button onClick={() => navigateMedia(post.id, 'prev', post.media!.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-glass transition-all">
                        <ChevronLeft className="h-5 w-5 text-navy-700" />
                      </button>
                      <button onClick={() => navigateMedia(post.id, 'next', post.media!.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-glass transition-all">
                        <ChevronRight className="h-5 w-5 text-navy-700" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {post.media.map((_, i) => (
                          <div key={i} className={`h-2 rounded-full transition-all ${i === currentMediaIndex ? 'bg-white w-5' : 'bg-white/50 w-2'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${isLiked ? 'text-peach-600 bg-peach-50' : 'text-navy-600 hover:bg-cream-100'}`}>
                      <Heart className={`h-5 w-5 transition-all ${isLiked ? 'fill-peach-500 animate-heart-pop' : ''}`} />
                      <span className="font-medium">{post.likes.length}</span>
                    </button>
                    <button onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-navy-600 hover:bg-cream-100 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="font-medium">{post.comments.length}</span>
                    </button>
                  </div>
                </div>

                {post.likes.length > 0 && (
                  <div className="mt-3 text-sm text-navy-600">
                    Loved by{' '}
                    <span className="font-medium text-navy-800">
                      {post.likes.slice(0, 2).map((id) => members.find((m) => m.id === id)?.name.split(' ')[0] || 'Someone').join(', ')}
                      {post.likes.length > 2 && ` and ${post.likes.length - 2} others`}
                    </span>
                  </div>
                )}

                {/* Comments */}
                {(showComments || post.comments.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-lavender-100/50">
                    {post.comments.slice(0, showComments ? undefined : 2).map((comment) => (
                      <div key={comment.id} className="flex gap-3 mb-3">
                        <div className="h-8 w-8 rounded-xl bg-lavender-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-lavender-700 text-xs font-medium">
                            {comment.authorName.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 bg-cream-100/80 rounded-2xl px-4 py-2.5">
                          <span className="font-medium text-navy-800 text-sm">{comment.authorName}</span>
                          <p className="text-navy-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {!showComments && post.comments.length > 2 && (
                      <button onClick={() => toggleComments(post.id)} className="text-sm text-lavender-600 hover:text-lavender-700 font-medium mb-3">
                        View all {post.comments.length} comments
                      </button>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-lavender-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lavender-700 text-xs font-medium">
                          {currentMember?.name.split(' ').map((n) => n[0]).join('') || 'Y'}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 bg-cream-100/80 rounded-2xl px-4 py-2 border border-cream-200">
                        <input type="text" value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-transparent text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none" />
                        <button onClick={() => handleComment(post.id)} disabled={!commentInputs[post.id]?.trim()}
                          className="p-1 text-lavender-500 disabled:text-navy-300 transition-colors">
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-glass-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-lavender-100/50 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-xl font-bold text-navy-900">Share an Update</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-cream-100 rounded-xl transition-colors">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${roleColors[currentMember?.role || 'family']} flex items-center justify-center shadow-soft`}>
                  <span className="text-white font-bold">{currentMember?.name.split(' ').map((n) => n[0]).join('') || 'Y'}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{currentMember?.name || 'You'}</p>
                  <p className="text-sm text-navy-500">Sharing with the care circle</p>
                </div>
              </div>

              {/* Post Type */}
              <div>
                <label className="text-sm font-medium text-navy-700 mb-2 block">Type of Update</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(postTypeConfig).map(([key, config]) => (
                    <button key={key} onClick={() => setNewPost((prev) => ({ ...prev, postType: key as FeedPost['postType'] }))}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        newPost.postType === key ? config.color + ' ring-2 ring-offset-1' : 'bg-cream-100 text-navy-600 hover:bg-cream-200'
                      }`}>
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea value={newPost.content} onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="How was your visit? Share a moment from the facility..."
                className="w-full h-32 px-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent resize-none transition-all" />

              {newPost.media.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {newPost.media.map((item, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden aspect-square">
                      {item.type === 'image' ? (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" />
                      )}
                      <button onClick={() => removeMedia(i)} className="absolute top-2 right-2 p-1.5 bg-navy-900/70 hover:bg-navy-900 rounded-full transition-colors">
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-peach-500" />
                <input type="text" value={newPost.location} onChange={(e) => setNewPost((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Add location (optional)"
                  className="flex-1 px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all" />
              </div>

              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} className="hidden" />
            </div>

            <div className="p-5 border-t border-lavender-100/50 flex items-center justify-between sticky bottom-0 bg-white rounded-b-3xl">
              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-3 hover:bg-mint-50 rounded-xl transition-colors">
                  <ImageIcon className="h-6 w-6 text-mint-500" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="p-3 hover:bg-lavender-50 rounded-xl transition-colors">
                  <Video className="h-6 w-6 text-lavender-500" />
                </button>
              </div>
              <button onClick={handleCreatePost} disabled={!newPost.content.trim() && newPost.media.length === 0}
                className="btn-primary disabled:from-cream-200 disabled:to-cream-200 disabled:text-navy-400 disabled:shadow-none">
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
