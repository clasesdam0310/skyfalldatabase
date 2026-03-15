// app/(app)/anime/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { Search, Film, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Database } from '@/types/database'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Tipos de Supabase
type Tables = Database['public']['Tables']
type MediaItem = Tables['media_items']['Row']
type Rating = Tables['ratings']['Row']
type User = Tables['users']['Row']

// Tipo para animes procesados
type Anime = {
  id: string
  title: string
  cover_image: string | null
  year: number | null
  genres: string[] | null
  creator: string | null
  avg_score: number
  vote_count: number
  api_id: string | null
}

// Tipo para animes UTR con información del usuario
type UtrAnime = Anime & {
  single_score: number
  voter_username: string
}

// Tipo para animes de AniList
type AnilistAnime = {
  id: number
  name: string
  background_image: string | null
  released: string | null
  genres: string[]
  studios: string[]
  averageScore: number | null
  source: 'anilist'
}

// Tipo para la respuesta de media_items con ratings
type MediaItemWithRatings = MediaItem & {
  ratings: (Pick<Rating, 'score' | 'user_id'> & {
    users: Pick<User, 'username'> | null
  })[]
}

const LOADING_TEXTS = [
  'Conectando con el servidor de Akihabara...',
  'Cargando openings...',
  'Preparando episodios...',
]

// Componente de tarjeta reutilizable
function AnimeCard({ anime, badge, utrInfo }: {
  anime: Anime;
  badge?: 'top' | 'utr' | 'nyd';
  utrInfo?: { score: number; username: string };
}) {
  const router = useRouter()

  const badgeStyles = {
    top: {
      bg: 'bg-[#ff6eb4]/20',
      text: 'text-[#ff6eb4]',
      border: 'border-[#ff6eb4]/30',
      label: `#${anime.avg_score.toFixed(1)}`
    },
    utr: {
      bg: 'bg-black/60',
      text: 'text-white/80',
      border: 'border-white/10',
      label: 'UTR'
    },
    nyd: {
      bg: 'bg-[#ff6eb4]',
      text: 'text-white',
      border: 'border-[#ff6eb4]/50',
      label: 'NYD'
    }
  }

  const style = badge ? badgeStyles[badge] : null

  // Determinar qué nota mostrar en la esquina superior izquierda
  const displayScore = badge === 'utr' && utrInfo?.score !== undefined
    ? utrInfo.score
    : anime.avg_score

  return (
    <motion.div
      onClick={() => router.push(`/media/${anime.id}`)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 bg-white/5 border border-white/10"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="relative aspect-[2/3]">
        {anime.cover_image ? (
          <Image src={anime.cover_image} alt={anime.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#ff6eb4]/10">
            <Film size={32} className="text-white/30" strokeWidth={1} />
          </div>
        )}

        {/* Badge superior */}
        {style && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full border ${style.bg} ${style.border} backdrop-blur-sm`}>
            <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
          </div>
        )}

        {/* Nota en la esquina superior izquierda para UTR y Top */}
        {(badge === 'utr' || badge === 'top') && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
            <span className="text-xs font-bold text-[#ff6eb4]">
              {displayScore.toFixed(1)}★
            </span>
          </div>
        )}
      </div>

      <div className="p-2">
        <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
          {anime.title}
        </p>
        <p className="text-xs truncate text-white/30">
          {anime.creator ?? anime.genres?.[0] ?? ''}
        </p>

        {/* Para UTR: mostrar quién lo votó */}
        {badge === 'utr' && utrInfo?.username && (
          <p className="text-[10px] text-[#ff6eb4] mt-1 truncate">
            @{utrInfo.username}
          </p>
        )}

        {/* Para Top: mostrar número de votos */}
        {badge === 'top' && (
          <p className="text-[10px] text-white/40 mt-1">
            {anime.vote_count} {anime.vote_count === 1 ? 'voto' : 'votos'}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function AnilistCard({ anime }: { anime: AnilistAnime }) {
  const router = useRouter()
  const [registering, setRegistering] = useState(false)

  async function handleClick() {
    if (registering) return
    setRegistering(true)
    try {
      const res = await fetch('/api/media/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_id: String(anime.id),
          api_source: 'anilist',
          type: 'anime',
          title: anime.name,
          cover_image: anime.background_image,
          year: anime.released ? parseInt(anime.released) : null,
          genres: anime.genres ?? [],
          creator: anime.studios?.[0] ?? null,
        }),
      })
      const data = await res.json()
      router.push(`/media/${data.id}`)
    } catch {
      setRegistering(false)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 bg-white/5 border border-[#ff6eb4]/30"
    >
      <div className="relative aspect-[2/3]">
        {anime.background_image ? (
          <Image src={anime.background_image} alt={anime.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#ff6eb4]/10">
            <Film size={32} className="text-white/30" strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          {registering ? (
            <div className="w-4 h-4 rounded-full border-2 border-[#ff6eb4]/30 border-t-[#ff6eb4] animate-spin" />
          ) : (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#ff6eb4] text-white font-semibold">
              NYD
            </span>
          )}
        </div>
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
          {anime.name}
        </p>
        <p className="text-xs truncate text-white/30">
          {anime.released ?? ''}{anime.genres?.[0] ? ` · ${anime.genres[0]}` : ''}
        </p>
      </div>
    </div>
  )
}

export default function AnimePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [topAnime, setTopAnime] = useState<Anime[]>([])
  const [utrAnime, setUtrAnime] = useState<UtrAnime[]>([])
  const [utrPage, setUtrPage] = useState(1)
  const [hasMoreUtr, setHasMoreUtr] = useState(false)
  const [allLocalAnime, setAllLocalAnime] = useState<Anime[]>([])
  const [filteredLocalAnime, setFilteredLocalAnime] = useState<Anime[]>([])
  const [anilistAnime, setAnilistAnime] = useState<AnilistAnime[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const loadingText = LOADING_TEXTS[0]

  const UTR_PAGE_SIZE = 10

  // Cargar todos los animes con sus ratings
  useEffect(() => {
    async function loadAnime() {
      setLoading(true)

      const { data, error } = await supabase
        .from('media_items')
        .select(`
          id,
          title,
          cover_image,
          year,
          genres,
          creator,
          api_id,
          ratings (
            score,
            user_id,
            users (
              username
            )
          )
        `)
        .eq('type', 'anime')

      if (error || !data) {
        console.error('Error loading anime:', error)
        setLoading(false)
        return
      }

      // Tipar los datos correctamente
      const animeWithRatings = data as unknown as MediaItemWithRatings[]

      // Procesar los datos para cálculos generales
      const processedAnime: Anime[] = animeWithRatings.map((anime) => {
        const scores = anime.ratings
          .map((r) => r.score)
          .filter((score): score is number => score !== null)

        const voteCount = scores.length
        const avgScore = voteCount > 0
          ? scores.reduce((a, b) => a + b, 0) / voteCount
          : 0

        return {
          id: anime.id,
          title: anime.title,
          cover_image: anime.cover_image,
          year: anime.year,
          genres: anime.genres,
          creator: anime.creator,
          avg_score: avgScore,
          vote_count: voteCount,
          api_id: anime.api_id,
        }
      })

      setAllLocalAnime(processedAnime)

      // Top 20: mínimo 2 votos
      const top = processedAnime
        .filter(a => a.vote_count >= 2)
        .sort((a, b) => {
          if (a.avg_score !== b.avg_score) {
            return b.avg_score - a.avg_score
          }
          return b.vote_count - a.vote_count
        })
        .slice(0, 20)

      setTopAnime(top)

      // UTR: exactamente 1 voto, con info del usuario
      const utr: UtrAnime[] = animeWithRatings
        .filter(anime => {
          const validRatings = anime.ratings.filter(r => r.score !== null)
          return validRatings.length === 1
        })
        .map(anime => {
          const singleRating = anime.ratings.find(r => r.score !== null)!
          const baseAnime = processedAnime.find(a => a.id === anime.id)!

          return {
            ...baseAnime,
            single_score: singleRating.score!,
            voter_username: singleRating.users?.username ?? 'usuario'
          }
        })
        .sort((a, b) => b.single_score - a.single_score)

      setUtrAnime(utr)
      setHasMoreUtr(utr.length > UTR_PAGE_SIZE)
      setLoading(false)
    }

    loadAnime()
  }, [])

  // Cargar más UTR
  const loadMoreUtr = useCallback(() => {
    setUtrPage(prev => prev + 1)
  }, [])

  // UTR paginado
  const displayedUtr = utrAnime.slice(0, utrPage * UTR_PAGE_SIZE)

  // Función de búsqueda con debounce
  const handleSearch = useCallback((input: string) => {
    const trimmedQuery = input.trim().replace(/\s+/g, ' ')
    setQuery(input)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (trimmedQuery.length < 2) {
      setFilteredLocalAnime([])
      setAnilistAnime([])
      return
    }

    setSearching(true)
    debounceTimer.current = setTimeout(async () => {
      const searchTerm = trimmedQuery.toLowerCase()

      // 1. FILTRADO LOCAL
      const filtered = allLocalAnime.filter(anime =>
        anime.title.toLowerCase().includes(searchTerm)
      )
      setFilteredLocalAnime(filtered)

      // 2. BUSCAR EN ANILIST
      try {
        const res = await fetch(`/api/anilist/search?q=${encodeURIComponent(trimmedQuery)}`)
        const data = await res.json()

        const localApiIds = new Set(
          allLocalAnime
            .map(a => a.api_id)
            .filter((id): id is string => id !== null)
        )

        const filteredAnilist = (data.results ?? [])
          .filter((a: AnilistAnime) => !localApiIds.has(String(a.id)))
          .slice(0, 8)

        setAnilistAnime(filteredAnilist)
      } catch {
        setAnilistAnime([])
      }

      setSearching(false)
    }, 300)
  }, [allLocalAnime])

  const isSearching = query.trim().length >= 2

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Film size={28} className="text-[#ff6eb4]" strokeWidth={1.5} />
          <h1 className="text-3xl font-black text-white tracking-tight">
            Anime
          </h1>
        </div>
        <p className="text-sm text-white/30">{loadingText}</p>
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Buscar anime..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-5 py-4 rounded-2xl text-white text-sm outline-none transition-all bg-white/5 border border-white/10 focus:border-[#ff6eb4]/30 focus:ring-2 focus:ring-[#ff6eb4]/20"
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-[#ff6eb4]/30 border-t-[#ff6eb4] animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64"
          >
            <div className="w-6 h-6 rounded-full border-2 border-[#ff6eb4]/30 border-t-[#ff6eb4] animate-spin mb-4" />
            <p className="text-sm text-white/30">{loadingText}</p>
          </motion.div>
        ) : isSearching ? (
          // MODO BÚSQUEDA
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {filteredLocalAnime.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  En SkyFallDB
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {filteredLocalAnime.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </div>
              </div>
            )}

            {anilistAnime.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  Not Yet Discovered
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {anilistAnime.map((anime) => (
                    <AnilistCard key={anime.id} anime={anime} />
                  ))}
                </div>
              </div>
            )}

            {filteredLocalAnime.length === 0 && anilistAnime.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48">
                <p className="text-white font-semibold mb-1">Sin resultados</p>
                <p className="text-sm text-white/30">
                  No se encontró &quot;{query}&quot; en SkyFallDB ni en AniList
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          // MODO RANKING
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* TOP 20 */}
            {topAnime.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/30">
                    TOP 20 SKYFALL
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {topAnime.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} badge="top" />
                  ))}
                </div>
              </div>
            )}

            {/* UNDER THE RADAR */}
            {displayedUtr.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/30">
                    UNDER THE RADAR
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {displayedUtr.map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      badge="utr"
                      utrInfo={{ score: anime.single_score, username: anime.voter_username }}
                    />
                  ))}
                </div>

                {/* Botón "Ver más" para UTR */}
                {hasMoreUtr && displayedUtr.length < utrAnime.length && (
                  <motion.button
                    onClick={loadMoreUtr}
                    className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:border-white/20 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-medium">Mostrar más</span>
                    <ChevronDown size={16} />
                  </motion.button>
                )}
              </div>
            )}

            {/* Mensaje si no hay animes */}
            {topAnime.length === 0 && utrAnime.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <Film size={48} className="text-white/20 mb-4" strokeWidth={1} />
                <p className="text-white font-semibold mb-2">
                  Sin anime en el ranking
                </p>
                <p className="text-sm text-center max-w-sm text-white/30">
                  Busca un anime arriba para añadirlo a SkyFallDB
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}