'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import UserAvatar from '@/components/users/UserAvatar'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import { Star, AlertTriangle } from 'lucide-react'
import { getStatusVerb, type MediaType } from '@/lib/utils/statusVerbs'

const EMOJIS = ['🔥', '😱', '❤️', '🫡', '📉']

interface ReviewCardProps {
  review: {
    id: string
    user_id: string
    score: number | null
    status: string | null
    review: string | null
    review_is_spoiler: boolean | null
    created_at: string | null
    users: { id: string; username: string; avatar_url: string | null } | null
  }
  mediaType: string
  index: number
  reactions: Array<{ emoji: string; count: number; user_reacted: boolean }>
  revealedSpoilers: Set<string>
  currentUserId: string
  onRevealSpoiler: (reviewId: string) => void
  onReaction: (reviewId: string, emoji: string) => void
}

function renderMentionLinks(text: string, router: ReturnType<typeof useRouter>) {
  if (!text) return null
  
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g)
  
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1)
      return (
        <span
          key={index}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/profile/${username}`)
          }}
          className="text-[#00d4ff] hover:text-[#ff6eb4] transition-colors cursor-pointer"
        >
          {part}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export default function ReviewCard({
  review,
  mediaType,
  index,
  reactions,
  revealedSpoilers,
  currentUserId,
  onRevealSpoiler,
  onReaction
}: ReviewCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const formattedDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : ''

  const statusVerb = review.status 
    ? getStatusVerb(mediaType as MediaType, review.status) 
    : ''

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden transition-all duration-500 max-w-2xl"
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent backdrop-blur-xl" />
      <div
        className="absolute inset-0 rounded-2xl border transition-colors duration-500"
        style={{
          borderColor: isHovered ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)',
          boxShadow: isHovered ? '0 0 40px rgba(0,212,255,0.2)' : 'none'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5">
        <div className="flex items-start gap-3 mb-4">
          <UserAvatar
            username={review.users?.username || ''}
            avatar_url={review.users?.avatar_url || null}
            size="md"
            hasInteracted={true}
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white/90" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {review.users?.username}
              </span>
              {review.score && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-[#00d4ff]">{review.score}</span>
                  <Star size={14} className="text-[#00d4ff] fill-[#00d4ff]" strokeWidth={1.5} />
                </div>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono border border-white/10">
                #{index + 1}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/40">{formattedDate}</span>
              {review.status && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                    {statusVerb}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {review.review_is_spoiler && !revealedSpoilers.has(review.id) ? (
          <div
            className="cursor-pointer rounded-xl p-4 text-center transition-all hover:scale-[0.99] backdrop-blur-md"
            style={{
              background: 'rgba(255,110,180,0.1)',
              border: '1px solid rgba(255,110,180,0.2)',
            }}
            onClick={() => onRevealSpoiler(review.id)}
          >
            <AlertTriangle className="inline mr-2 text-[#ff6eb4]" size={20} strokeWidth={1.5} />
            <span className="text-sm text-[#ff6eb4]/80">SPOILER — Click para revelar</span>
          </div>
        ) : (
          <div className="relative mb-4 p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5">
            <p className="relative text-sm leading-relaxed text-white/80" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {review.review ? renderMentionLinks(review.review, router) : null}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <span className="text-xs text-white/30 mr-2">Reacciones</span>
          <div className="flex gap-1.5">
            {EMOJIS.map((emoji) => {
              const reaction = reactions.find(r => r.emoji === emoji)
              const count = reaction?.count || 0
              const userReacted = reaction?.user_reacted || false

              return (
                <button
                  key={emoji}
                  onClick={() => onReaction(review.id, emoji)}
                  className="group/emoji relative transition-all duration-200"
                >
                  <div
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm ${
                      userReacted
                        ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span className="text-base">{emoji}</span>
                    {count > 0 && (
                      <span className={`text-xs font-bold ${userReacted ? 'text-[#00d4ff]' : 'text-white/40'}`}>
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}