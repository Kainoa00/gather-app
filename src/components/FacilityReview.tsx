'use client'

import { useState } from 'react'
import { Star, X, ExternalLink, CheckCircle2 } from 'lucide-react'
import { FacilityReviewEntry, UserRole } from '@/types'

interface FacilityReviewProps {
  currentUserId: string
  currentUserName: string
  currentUserRole: UserRole
  onAddReview: (review: FacilityReviewEntry) => void
  onClose: () => void
}

const REVIEW_TAGS = ['Food', 'Staff', 'Cleanliness', 'Activities', 'Communication']

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!']

export default function FacilityReview({
  currentUserId,
  currentUserName,
  onAddReview,
  onClose,
}: FacilityReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedRating, setSubmittedRating] = useState(0)

  const handleSubmit = () => {
    if (rating === 0) return
    const review: FacilityReviewEntry = {
      id: crypto.randomUUID(),
      authorId: currentUserId,
      authorName: currentUserName,
      rating,
      content,
      tags: selectedTags.map(t => t.toLowerCase()),
      createdAt: new Date(),
      isPublic: rating >= 4,
    }
    onAddReview(review)
    setSubmittedRating(rating)
    setSubmitted(true)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const displayRating = hoveredRating || rating

  if (submitted) {
    const isPositive = submittedRating >= 4
    return (
      <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-glass-lg p-8 text-center animate-scale-in">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-2xl ${isPositive ? 'bg-mint-100' : 'bg-primary-50'}`}>
              <CheckCircle2 className={`h-8 w-8 ${isPositive ? 'text-mint-600' : 'text-primary-600'}`} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-navy-900 mb-2">Thank You!</h3>
          {isPositive ? (
            <>
              <p className="text-navy-600 mb-6 leading-relaxed">
                We appreciate your kind words! Would you like to share your experience on Google to help others find great care?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    window.open('https://g.page/r/PLACEHOLDER_GOOGLE_PLACE_ID/review', '_blank')
                    onClose()
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-float"
                >
                  <ExternalLink className="h-4 w-4" />
                  Share on Google Reviews
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-primary-200 text-navy-700 rounded-2xl hover:bg-cream-50 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-navy-600 mb-6 leading-relaxed">
                Thank you for your feedback. Our team will review this privately to improve your experience.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-float"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-glass-lg animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-primary-100/50 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h3 className="text-xl font-bold text-navy-900">Leave a Review</h3>
            <p className="text-sm text-navy-500">How are we doing?</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-navy-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3 text-center">
              Overall Rating
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= displayRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-navy-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-center text-sm font-medium text-navy-600 mt-2">
                {ratingLabels[displayRating]}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3">
              What stood out? <span className="font-normal text-navy-400">(Optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-100 text-primary-700 border-primary-300'
                      : 'border-navy-200 text-navy-600 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Your Comments <span className="font-normal text-navy-400">(Optional)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-3 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none text-sm"
            />
          </div>
        </div>

        <div className="p-5 border-t border-primary-100/50 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-primary-200 text-navy-700 rounded-xl hover:bg-cream-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )
}
