'use client'

import RatingSection from '@/components/media/RatingSection'  // ← DEBE SER RatingSection
import type { UserRating } from '@/types/local'

interface MediaRatingSectionWrapperProps {
  myRating?: UserRating | null
  onSave: (data: {
    score: number | null
    status: string
    review: string
    isSpoiler: boolean
  }) => Promise<void>
  onDelete?: () => Promise<void>
  hasExistingReview: boolean
  mediaType: string
}

export default function MediaRatingSectionWrapper({
  myRating,
  onSave,
  onDelete,
  hasExistingReview,
  mediaType
}: MediaRatingSectionWrapperProps) {
  return (
    <RatingSection
      initialScore={myRating?.score ?? null}
      initialStatus={myRating?.status || ''}
      initialReview={myRating?.review || ''}
      initialSpoiler={myRating?.review_is_spoiler || false}
      onSave={onSave}
      onDelete={onDelete}
      hasExistingReview={hasExistingReview}
      mediaType={mediaType}
    />
  )
}