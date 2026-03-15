'use client'

import { motion } from 'framer-motion'
import { Clock, Film, Calendar, Star, Gamepad2, LucideIcon } from 'lucide-react'

interface MediaMetadataProps {
  mediaType: string
  genres: string[] | null
  creator: string | null
  year: number | null
  duration?: number | null
  platforms?: string[] | null
  voteAverage?: number | null
  voteCount?: number
}

interface MetadataItem {
  icon: LucideIcon
  label: string
  value: React.ReactNode
}

export default function MediaMetadata({
  mediaType,
  genres,
  creator,
  year,
  duration,
  platforms,
  voteAverage,
  voteCount,
}: MediaMetadataProps) {
  const items: MetadataItem[] = []

  if (year) {
    items.push({
      icon: Calendar,
      label: 'Año',
      value: year,
    })
  }

  if (duration) {
    const label = mediaType === 'film' ? 'Duración' : 'Horas'
    const value = mediaType === 'film'
      ? `${duration} min`
      : `${duration} h`
    items.push({ icon: Clock, label, value })
  }

  if (genres && genres.length > 0) {
    items.push({
      icon: Film,
      label: 'Géneros',
      value: genres.join(' • '),
    })
  }

  if (platforms && platforms.length > 0) {
    items.push({
      icon: Gamepad2,
      label: 'Plataformas',
      value: platforms.join(' • '),
    })
  }

  if (voteAverage && voteCount && voteCount > 0) {
    items.push({
      icon: Star,
      label: 'Puntuación',
      value: `${voteAverage.toFixed(1)} (${voteCount} votos)`,
    })
  }

  if (items.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <item.icon size={18} className="text-[#00d4ff] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-xs text-white/40 font-medium">{item.label}</p>
            <p className="text-sm text-white/80 leading-relaxed">{item.value}</p>
          </div>
        </div>
      ))}
    </motion.div>
  )
}