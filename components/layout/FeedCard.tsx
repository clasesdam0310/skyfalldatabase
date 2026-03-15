'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Star } from 'lucide-react'

interface FeedCardProps {
  event: {
    id: string
    event_type: string
    user_id: string
    media_id: string | null
    payload: {
      score?: number | string
      review?: string
      review_is_spoiler?: boolean
      action?: string
    } | null
    created_at: string | null
    username: string
    media_title: string | null
    media_type: string | null
    media_cover: string | null
  }
}

const TYPE_ICONS: Record<string, string> = {
  game:  '⊞',
  film:  '▶',
  anime: '⊡',
  manga: '≡',
  vn:    '◇',
}

const TYPE_COLORS: Record<string, string> = {
  game:  '#00d4ff',
  film:  '#1e6fa8',
  anime: '#ff6eb4',
  manga: '#ff8c42',
  vn:    '#4ae8ff',
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'ahora mismo'
  if (mins  < 60) return `hace ${mins}m`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

export default function FeedCard({ event }: FeedCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const mediaType = event.media_type ?? 'game'
  const accentColor = TYPE_COLORS[mediaType] ?? '#00d4ff'
  const typeIcon = TYPE_ICONS[mediaType] ?? '◈'
  const action = event.payload?.action ?? event.event_type

  if (!event.media_id) return null

  const score = event.payload?.score ? Number(event.payload.score) : null

  return (
    <motion.div
      onClick={() => router.push(`/media/${event.media_id}`)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-xl cursor-pointer"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Imagen de fondo */}
      {event.media_cover && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${event.media_cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1px)',
            transform: 'scale(1.1)',
            opacity: 0.7,
          }}
        />
      )}

      {/* Overlay oscuro */}
      <div className="absolute inset-0" style={{ background: 'rgba(5,8,16,0.65)' }} />

      {/* Glow en hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accentColor}15 0%, transparent 70%)`,
        }}
      />

      {/* Contenido - ESTRUCTURA CORREGIDA CON FLEX COLUMN Y GAPS */}
      <div className="relative z-10 p-4 flex flex-col gap-1.5">
        {/* Línea 1: Avatar + Usuario + Nota */}
        <div className="flex items-center gap-1.5">
          {/* Avatar */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}80)`,
              border: `1px solid ${accentColor}50`,
            }}
          >
            {event.username[0].toUpperCase()}
          </div>

          {/* Usuario */}
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/profile/${event.username}`) }}
            className="text-xs font-medium text-white/80 hover:text-white transition-colors truncate max-w-[100px]"
          >
            @{event.username}
          </button>

          {/* Nota con estrella cyan */}
          {score && (
            <div className="flex items-center gap-0.5 ml-auto">
              <span className="text-xs font-bold text-[#00d4ff]">{score}</span>
              <Star size={10} className="text-[#00d4ff] fill-[#00d4ff]" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Línea 2: Tiempo + Acción */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-slate-400">
            {event.created_at ? formatRelativeTime(event.created_at) : ''}
          </span>
          <span className="text-white/30">·</span>
          <span className="text-slate-400 truncate">{action}</span>
        </div>

        {/* Línea 3: Título del medio */}
        {event.media_title && (
          <h4 className="text-sm font-semibold text-white leading-tight line-clamp-1">
            {event.media_title}
          </h4>
        )}

        {/* Línea 4: Reseña (si existe) */}
        {event.payload?.review && (
          <p className="text-[11px] italic leading-relaxed line-clamp-2 text-white/60">
            {event.payload.review_is_spoiler
              ? '⚠ Contiene spoilers'
              : `"${event.payload.review}"`}
          </p>
        )}
      </div>
    </motion.div>
  )
}