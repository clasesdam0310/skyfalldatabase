'use client'

import { useRouter } from 'next/navigation'

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
  game:  '#34d399',
  film:  '#38bdf8',
  anime: '#a78bfa',
  manga: '#fbbf24',
  vn:    '#f472b6',
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
  const accentColor = event.media_type ? (TYPE_COLORS[event.media_type] ?? '#103882') : '#103882'
  const action = event.payload?.action ?? event.event_type

  if (!event.media_id) return null

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Evita que se active el click de la tarjeta
    router.push(`/profile/${event.username}`)
  }

  const handleCardClick = () => {
    router.push(`/media/${event.media_id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] 
                 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(16,56,130,0.15) 0%, transparent 70%)'
        }} />

      {/* Blurred cover background */}
      {event.media_cover && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${event.media_cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1.5px)',
            transform: 'scale(1.15)',
            opacity: 0.85,
          }}
        />
      )}
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#050507]/55 pointer-events-none" />

      <div className="relative p-4 z-10">
        {/* Media title + type icon */}
        {event.media_title && (
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-black" style={{ color: accentColor }}>
              {TYPE_ICONS[event.media_type ?? ''] ?? '◈'}
            </span>
            <p className="text-[12px] font-bold text-white/90 leading-tight line-clamp-1">
              {event.media_title}
            </p>
          </div>
        )}

        {/* User + action + score */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleUsernameClick}
            className="text-[11px] font-black text-[#103882] tracking-tight hover:text-[#FA4D5F] transition-colors"
          >
            @{event.username}
          </button>
          <span className="text-[11px] text-white/35 font-medium">
            {action}
          </span>
          {event.payload?.score != null && (
            <span className="text-[11px] font-black text-[#FA4D5F] ml-auto">
              {String(event.payload.score)}★
            </span>
          )}
        </div>

        {/* Review snippet */}
        {event.payload?.review && (
          <p className="text-[10px] text-white/50 mt-2 leading-relaxed line-clamp-2 italic border-l-2 pl-2"
            style={{ borderColor: accentColor }}>
            {event.payload.review_is_spoiler
              ? '⚠ Contiene spoilers'
              : String(event.payload.review)
            }
          </p>
        )}

        {/* Timestamp */}
        <p className="text-[9px] text-white/20 mt-1.5 font-medium tracking-wide">
          {event.created_at ? formatRelativeTime(event.created_at) : ''}
        </p>
      </div>
    </div>
  )
}