'use client'

import { useState } from 'react'
import ReviewCard from './ReviewCard'

interface ReviewSectionProps {
  ratings: Array<{
    id: string
    user_id: string
    score: number | null
    status: string | null
    review: string | null
    review_is_spoiler: boolean | null
    created_at: string | null
    users: { id: string; username: string; avatar_url: string | null } | null
  }>
  mediaType: string // Necesario para los verbos dinámicos
  reactions: Record<string, Array<{ emoji: string; count: number; user_reacted: boolean }>>
  currentUserId: string
  onReaction: (reviewId: string, emoji: string) => void
}

export default function ReviewSection({ 
  ratings, 
  mediaType,
  reactions, 
  currentUserId, 
  onReaction 
}: ReviewSectionProps) {
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set())
  const reviewsWithReviews = ratings.filter(r => r.review)

  if (reviewsWithReviews.length === 0) return null

  const handleRevealSpoiler = (reviewId: string) => {
    setRevealedSpoilers(new Set([...revealedSpoilers, reviewId]))
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          Reviews del grupo
        </h2>
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)' }} />
        <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded-full text-white/40">
          {reviewsWithReviews.length}
        </span>
      </div>

      <div className="space-y-4">
        {reviewsWithReviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            mediaType={mediaType}
            index={index}
            reactions={reactions[review.id] || []}
            revealedSpoilers={revealedSpoilers}
            currentUserId={currentUserId}
            onRevealSpoiler={handleRevealSpoiler}
            onReaction={onReaction}
          />
        ))}
      </div>
    </section>
  )
}