// components/media/TechSpecs.tsx
'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Film, Gamepad2, Book, Tag, LucideIcon } from 'lucide-react'

interface TechSpecsProps {
  mediaType: string
  creator: string | null
  year: number | null
  genres: string[] | null
  duration?: number | null
}

interface SpecItem {
  label: string
  value: React.ReactNode
  icon: LucideIcon
}

export default function TechSpecs({
  mediaType,
  creator,
  year,
  genres,
  duration,
}: TechSpecsProps) {
  const creatorLabel = mediaType === 'game' ? 'DESARROLLADORA' 
    : mediaType === 'film' ? 'DIRECTOR'
    : mediaType === 'anime' ? 'ESTUDIO'
    : mediaType === 'manga' ? 'AUTOR'
    : mediaType === 'vn' ? 'ESTUDIO'
    : 'CREADOR'

  const specs: SpecItem[] = []

  // El creador siempre va primero
  if (creator) {
    specs.push({
      label: creatorLabel,
      value: creator,
      icon: mediaType === 'game' ? Gamepad2 
        : mediaType === 'film' ? Film
        : mediaType === 'anime' ? Film
        : mediaType === 'manga' ? Book
        : Film,
    })
  }

  // Duración - solo si existe
  if (duration) {
    let value = ''
    let label = 'DURACIÓN'
    
    if (mediaType === 'film') {
      value = `${duration} min`
    } else if (mediaType === 'anime') {
      value = duration === 1 ? `${duration} episodio` : `${duration} episodios`
      label = 'EPISODIOS'
    } else if (mediaType === 'manga') {
      value = duration === 1 ? `${duration} capítulo` : `${duration} capítulos`
      label = 'CAPÍTULOS'
    } else {
      value = `${duration} h`
    }
    
    specs.push({
      label,
      value,
      icon: Clock,
    })
  }

  if (year) {
    specs.push({
      label: 'AÑO',
      value: year,
      icon: Calendar,
    })
  }

  if (genres && genres.length > 0) {
    specs.push({
      label: 'GÉNEROS',
      value: (
        <div className="flex flex-wrap gap-1.5">
          {genres.map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.05] text-[#00d4ff] border border-white/10"
            >
              {genre}
            </span>
          ))}
        </div>
      ),
      icon: Tag,
    })
  }

  // Si no hay specs, no mostrar nada
  if (specs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-6 border-t border-l border-white/5"
    >
      <h3 className="text-xs font-display font-black tracking-[0.3em] uppercase text-[#00d4ff]/60 mb-6">
        FICHA TÉCNICA
      </h3>

      <div className="space-y-0 divide-y divide-white/[0.03]">
        {specs.map((spec, idx) => (
          <div 
            key={idx} 
            className="flex py-5 first:pt-0 last:pb-0"
          >
            {/* Label con ancho fijo de 140px */}
            <div className="w-[140px] flex-shrink-0">
              <div className="flex items-center gap-2">
                <spec.icon size={12} className="text-[#00d4ff]/30" strokeWidth={1.5} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00d4ff]/40">
                  {spec.label}
                </span>
              </div>
            </div>

            {/* Valor con ancho flexible */}
            <div className="flex-1">
              <div className="text-sm text-white/90 leading-relaxed font-medium">
                {spec.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}