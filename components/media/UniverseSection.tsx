// components/media/UniverseSection.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { Character } from '@/types/local'

interface UniverseSectionProps {
  description: string | null
  creator: string | null
  mediaType: string
  characters: Character[]
  typeIcons?: Record<string, string>
  typeColors?: Record<string, string>
  isLoading?: boolean
}

const CHARACTERS_PER_PAGE = 6

export default function UniverseSection({
  description,
  creator,
  mediaType,
  characters,
  typeIcons = {},
  typeColors = {},
  isLoading = false,
}: UniverseSectionProps) {
  const router = useRouter()
  const [synopsisRevealed, setSynopsisRevealed] = useState(false)
  const [characterPage, setCharacterPage] = useState(1)
  
  const accentColor = typeColors[mediaType] ?? '#00d4ff'
  
  const displayedCharacters = characters.slice(0, characterPage * CHARACTERS_PER_PAGE)
  const hasMoreCharacters = characters.length > displayedCharacters.length

  const loadMoreCharacters = () => {
    setCharacterPage(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${accentColor}20`, borderTopColor: accentColor }} />
        </div>
      </section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Sinopsis */}
      <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border-t border-l border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-black" style={{ color: accentColor }}>📖</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/30">
            Sinopsis
          </h3>
          {description && (
            <span
              className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/50"
            >
              ⚠ Podría contener spoilers
            </span>
          )}
        </div>

        {description ? (
          <div
            className="relative cursor-pointer group"
            onClick={() => setSynopsisRevealed(!synopsisRevealed)}
          >
            <p
              className="text-base leading-[1.8] transition-all duration-300 text-slate-200/90"
              style={{
                filter: synopsisRevealed ? 'none' : 'blur(4px)',
              }}
            >
              {description}
            </p>
            {!synopsisRevealed && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                  className="text-xs px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/80"
                >
                  Click para revelar
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-base italic text-white/30">Sinopsis no disponible</p>
          </div>
        )}
      </div>

      {/* Personajes */}
      {characters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 ml-1">
            Personajes Destacados ({characters.length})
          </h3>

          <div className="grid grid-cols-6 gap-3">
            {displayedCharacters.map((character) => (
              <motion.div
                key={character.id}
                onClick={() => router.push(`/characters/${character.id}`)}
                className="cursor-pointer group"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-2">
                  {character.image_url ? (
                    <Image
                      src={character.image_url}
                      alt={character.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <span className="text-2xl text-white/20">🎭</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-white/80 truncate text-center">
                  {character.name}
                </p>
                <p className="text-[9px] text-white/40 truncate text-center">
                  {character.role}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Botón "Ver más" para personajes */}
          {hasMoreCharacters && (
            <motion.button
              onClick={loadMoreCharacters}
              className="mt-6 mx-auto flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:border-white/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm font-medium">
                Mostrar más ({characters.length - displayedCharacters.length} restantes)
              </span>
              <ChevronDown size={16} />
            </motion.button>
          )}
        </div>
      )}
    </motion.section>
  )
}