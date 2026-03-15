'use client'

import { useState, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import type { Reaction, Rating } from '@/types/local'
import { EMOJIS } from '@/lib/constants/media'

const supabase = supabaseBrowser

export function useReactions(ratings: Rating[], currentUserId: string) {
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})

  const loadReactions = useCallback(async () => {
    const reviewsWithReactions = ratings.filter(r => r.review)
    
    const initialReactions: Record<string, Reaction[]> = {}
    reviewsWithReactions.forEach(review => {
      initialReactions[review.id] = EMOJIS.map(emoji => ({
        emoji,
        count: 0,
        user_reacted: false
      }))
    })
    setReactions(initialReactions)
    
    for (const review of reviewsWithReactions) {
      const { data: reactionData } = await supabase
        .from('reactions')
        .select('emoji, user_id')
        .eq('target_type', 'review')
        .eq('target_id', review.id)

      if (reactionData && reactionData.length > 0) {
        const counts: Record<string, number> = {}
        reactionData.forEach(r => {
          counts[r.emoji] = (counts[r.emoji] || 0) + 1
        })

        const userReactions = new Set(
          reactionData.filter(r => r.user_id === currentUserId).map(r => r.emoji)
        )

        const reviewReactions = EMOJIS.map(emoji => ({
          emoji,
          count: counts[emoji] || 0,
          user_reacted: userReactions.has(emoji)
        }))

        setReactions(prev => ({
          ...prev,
          [review.id]: reviewReactions
        }))
      }
    }
  }, [ratings, currentUserId])

  const handleReaction = async (reviewId: string, emoji: string) => {
    if (!currentUserId) return

    const currentReactions = reactions[reviewId] || []
    const targetReaction = currentReactions.find(r => r.emoji === emoji)
    const userReacted = targetReaction?.user_reacted || false

    if (userReacted) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('target_type', 'review')
        .eq('target_id', reviewId)
        .eq('user_id', currentUserId)
        .eq('emoji', emoji)

      if (!error) {
        setReactions(prev => ({
          ...prev,
          [reviewId]: prev[reviewId].map(r => 
            r.emoji === emoji ? { ...r, count: r.count - 1, user_reacted: false } : r
          )
        }))
      }
    } else {
      const { error } = await supabase
        .from('reactions')
        .insert({
          target_type: 'review',
          target_id: reviewId,
          user_id: currentUserId,
          emoji: emoji
        })

      if (!error) {
        setReactions(prev => ({
          ...prev,
          [reviewId]: prev[reviewId].map(r => 
            r.emoji === emoji ? { ...r, count: r.count + 1, user_reacted: true } : r
          )
        }))
      }
    }
  }

  return { reactions, loadReactions, handleReaction }
}