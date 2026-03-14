'use client'

import { useState } from 'react'
import Image from 'next/image'
import UserAvatar from '@/components/users/UserAvatar'
import UserStatusBadge from '@/components/users/UserStatusBadge'

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
  index: number
  reactions: Array<{ emoji: string; count: number; user_reacted: boolean }>
  revealedSpoilers: Set<string>
  currentUserId: string
  onRevealSpoiler: (reviewId: string) => void
  onReaction: (reviewId: string, emoji: string) => void
}

export default function ReviewCard({
  review,
  index,
  reactions,
  revealedSpoilers,
  currentUserId,
  onRevealSpoiler,
  onReaction
}: ReviewCardProps) {
  const formattedDate = review.created_at 
    ? new Date(review.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : ''

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(16,56,130,0.15) 0%, transparent 70%)'
        }} />

      <div className="relative p-5">
        {/* Cabecera con usuario y nota */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              username={review.users?.username || ''}
              avatar_url={review.users?.avatar_url || null}
              size="md"
              hasInteracted={true}
            />
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {review.users?.username}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono">
                  #{index + 1}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/30">
                  {formattedDate}
                </span>
                {review.status && (
                  <>
                    <span className="text-white/20">•</span>
                    <UserStatusBadge status={review.status} size="sm" />
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Nota con diseño mejorado */}
          {review.score && (
            <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <span className="text-sm font-black text-[#FA4D5F]">{review.score}</span>
              <span className="text-xs text-white/40">★</span>
            </div>
          )}
        </div>

        {/* Review con efecto de cristal */}
        {review.review_is_spoiler && !revealedSpoilers.has(review.id) ? (
          <div
            className="cursor-pointer rounded-xl p-4 text-center transition-all hover:scale-[0.99]"
            style={{
              background: 'rgba(250,77,95,0.05)',
              border: '1px solid rgba(250,77,95,0.2)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => onRevealSpoiler(review.id)}
          >
            <span className="text-2xl mr-2 opacity-50">⚠️</span>
            <span className="text-sm" style={{ color: '#FA4D5F' }}>
              SPOILER — Click para revelar
            </span>
          </div>
        ) : (
          <div className="relative mb-4">
            {/* Comillas decorativas */}
            <span className="absolute -top-2 -left-2 text-4xl text-white/5 font-serif">
              &quot;
            </span>
            <p className="relative text-sm leading-relaxed pl-4 italic"
              style={{ color: 'rgba(255,255,255,0.8)' }}>
              {review.review}
            </p>
            <span className="absolute -bottom-4 -right-2 text-4xl text-white/5 font-serif rotate-180">
              &quot;
            </span>
          </div>
        )}

        {/* Reacciones */}
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
                  className={`group/emoji relative transition-all duration-200 ${
                    userReacted ? 'scale-110' : 'hover:scale-110'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-full blur-md transition-opacity ${
                    userReacted ? 'opacity-50' : 'opacity-0 group-hover/emoji:opacity-30'
                  }`}
                  style={{ background: userReacted ? '#103882' : '#ffffff' }} />
                  
                  <div className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                    userReacted 
                      ? 'bg-[#103882] text-white shadow-lg shadow-[#103882]/20' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}>
                    <span className="text-base">{emoji}</span>
                    {count > 0 && (
                      <span className={`text-xs font-bold tabular-nums ${
                        userReacted ? 'text-white' : 'text-white/40'
                      }`}>
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
    </div>
  )
}