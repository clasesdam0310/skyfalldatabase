'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { Search, Book, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Database } from '@/types/database'
import { TYPE_ICONS, TYPE_COLORS, LOADING_TEXTS } from '@/lib/constants/media'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Tipos de Supabase
type Tables = Database['public']['Tables']
type MediaItem = Tables['media_items']['Row']
type Rating = Tables['ratings']['Row']
type User = Tables['users']['Row']

// Tipo para mangas procesados
type Manga = {
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

// Tipo para mangas UTR con información del usuario
type UtrManga = Manga & {
  single_score: number
  voter_username: string
}

// Tipo para mangas de AniList
type AnilistManga = {
  id: number
  name: string
  background_image: string | null
  released: string | null
  genres: string[]
  authors: string[]
  averageScore: number | null
  source: 'anilist'
}

// Tipo para la respuesta de media_items con ratings
type MediaItemWithRatings = MediaItem & {
  ratings: (Pick<Rating, 'score' | 'user_id'> & {
    users: Pick<User, 'username'> | null
  })[]
}

// Componente de tarjeta reutilizable
function MangaCard({ manga, badge, utrInfo }: { 
  manga: Manga; 
  badge?: 'top' | 'utr' | 'nyd';
  utrInfo?: { score: number; username: string };
}) {
  const router = useRouter()
  
  const badgeStyles = {
    top: {
      bg: 'bg-[#ff8c42]/20',
      text: 'text-[#ff8c42]',
      border: 'border-[#ff8c42]/30',
      label: `#${manga.avg_score.toFixed(1)}`
    },
    utr: {
      bg: 'bg-black/60',
      text: 'text-white/80',
      border: 'border-white/10',
      label: 'UTR'
    },
    nyd: {
      bg: 'bg-[#ff8c42]',
      text: 'text-white',
      border: 'border-[#ff8c42]/50',
      label: 'NYD'
    }
  }

  const style = badge ? badgeStyles[badge] : null

  // Determinar qué nota mostrar en la esquina superior izquierda
  const displayScore = badge === 'utr' && utrInfo?.score !== undefined 
    ? utrInfo.score 
    : manga.avg_score

  return (
    <motion.div
      onClick={() => router.push(`/media/${manga.id}`)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 bg-white/5 border border-white/10"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="relative aspect-[2/3]">
        {manga.cover_image ? (
          <Image src={manga.cover_image} alt={manga.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#ff8c42]/10">
            <Book size={32} className="text-white/30" strokeWidth={1} />
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
            <span className="text-xs font-bold text-[#ff8c42]">
              {displayScore.toFixed(1)}★
            </span>
          </div>
        )}
      </div>
      
      <div className="p-2">
        <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
          {manga.title}
        </p>
        <p className="text-xs truncate text-white/30">
          {manga.creator ?? manga.genres?.[0] ?? ''}
        </p>
        
        {/* Para UTR: mostrar quién lo votó */}
        {badge === 'utr' && utrInfo?.username && (
          <p className="text-[10px] text-[#ff8c42] mt-1 truncate">
            @{utrInfo.username}
          </p>
        )}
        
        {/* Para Top: mostrar número de votos */}
        {badge === 'top' && (
          <p className="text-[10px] text-white/40 mt-1">
            {manga.vote_count} {manga.vote_count === 1 ? 'voto' : 'votos'}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function AnilistMangaCard({ manga }: { manga: AnilistManga }) {
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
          api_id: String(manga.id),
          api_source: 'anilist',
          type: 'manga',
          title: manga.name,
          cover_image: manga.background_image,
          year: manga.released ? parseInt(manga.released) : null,
          genres: manga.genres ?? [],
          creator: manga.authors?.[0] ?? null,
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
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 bg-white/5 border border-[#ff8c42]/30"
    >
      <div className="relative aspect-[2/3]">
        {manga.background_image ? (
          <Image src={manga.background_image} alt={manga.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#ff8c42]/10">
            <Book size={32} className="text-white/30" strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          {registering ? (
            <div className="w-4 h-4 rounded-full border-2 border-[#ff8c42]/30 border-t-[#ff8c42] animate-spin" />
          ) : (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#ff8c42] text-white font-semibold">
              NYD
            </span>
          )}
        </div>
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
          {manga.name}
        </p>
        <p className="text-xs truncate text-white/30">
          {manga.released ?? ''}{manga.genres?.[0] ? ` · ${manga.genres[0]}` : ''}
        </p>
      </div>
    </div>
  )
}

export default function MangaPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [topManga, setTopManga] = useState<Manga[]>([])
  const [utrManga, setUtrManga] = useState<UtrManga[]>([])
  const [utrPage, setUtrPage] = useState(1)
  const [hasMoreUtr, setHasMoreUtr] = useState(false)
  const [allLocalManga, setAllLocalManga] = useState<Manga[]>([])
  const [filteredLocalManga, setFilteredLocalManga] = useState<Manga[]>([])
  const [anilistManga, setAnilistManga] = useState<AnilistManga[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const loadingText = LOADING_TEXTS.manga[0]

  const UTR_PAGE_SIZE = 10

  // Cargar todos los mangas con sus ratings
  useEffect(() => {
    async function loadManga() {
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
        .eq('type', 'manga')

      if (error || !data) {
        console.error('Error loading manga:', error)
        setLoading(false)
        return
      }

      const mangaWithRatings = data as unknown as MediaItemWithRatings[]

      // Procesar los datos para cálculos generales
      const processedManga: Manga[] = mangaWithRatings.map((manga) => {
        const scores = manga.ratings
          .map((r) => r.score)
          .filter((score): score is number => score !== null)
        
        const voteCount = scores.length
        const avgScore = voteCount > 0 
          ? scores.reduce((a, b) => a + b, 0) / voteCount 
          : 0

        return {
          id: manga.id,
          title: manga.title,
          cover_image: manga.cover_image,
          year: manga.year,
          genres: manga.genres,
          creator: manga.creator,
          avg_score: avgScore,
          vote_count: voteCount,
          api_id: manga.api_id,
        }
      })

      setAllLocalManga(processedManga)

      // Top 20: mínimo 2 votos
      const top = processedManga
        .filter(m => m.vote_count >= 2)
        .sort((a, b) => {
          if (a.avg_score !== b.avg_score) {
            return b.avg_score - a.avg_score
          }
          return b.vote_count - a.vote_count
        })
        .slice(0, 20)

      setTopManga(top)

      // UTR: exactamente 1 voto, con info del usuario
      const utr: UtrManga[] = mangaWithRatings
        .filter(manga => {
          const validRatings = manga.ratings.filter(r => r.score !== null)
          return validRatings.length === 1
        })
        .map(manga => {
          const singleRating = manga.ratings.find(r => r.score !== null)!
          const baseManga = processedManga.find(m => m.id === manga.id)!
          
          return {
            ...baseManga,
            single_score: singleRating.score!,
            voter_username: singleRating.users?.username ?? 'usuario'
          }
        })
        .sort((a, b) => b.single_score - a.single_score)

      setUtrManga(utr)
      setHasMoreUtr(utr.length > UTR_PAGE_SIZE)
      setLoading(false)
    }

    loadManga()
  }, [])

  // Cargar más UTR
  const loadMoreUtr = useCallback(() => {
    setUtrPage(prev => prev + 1)
  }, [])

  // UTR paginado
  const displayedUtr = utrManga.slice(0, utrPage * UTR_PAGE_SIZE)

  // Función de búsqueda con debounce
  const handleSearch = useCallback((input: string) => {
    const trimmedQuery = input.trim().replace(/\s+/g, ' ')
    setQuery(input)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (trimmedQuery.length < 2) {
      setFilteredLocalManga([])
      setAnilistManga([])
      return
    }

    setSearching(true)
    debounceTimer.current = setTimeout(async () => {
      const searchTerm = trimmedQuery.toLowerCase()

      // 1. FILTRADO LOCAL
      const filtered = allLocalManga.filter(manga => 
        manga.title.toLowerCase().includes(searchTerm)
      )
      setFilteredLocalManga(filtered)

      // 2. BUSCAR EN ANILIST
      try {
        const res = await fetch(`/api/manga/search?q=${encodeURIComponent(trimmedQuery)}`)
        const data = await res.json()
        
        const localApiIds = new Set(
          allLocalManga
            .map(m => m.api_id)
            .filter((id): id is string => id !== null)
        )

        const filteredAnilist = (data.results ?? [])
          .filter((m: AnilistManga) => !localApiIds.has(String(m.id)))
          .slice(0, 8)

        setAnilistManga(filteredAnilist)
      } catch {
        setAnilistManga([])
      }

      setSearching(false)
    }, 300)
  }, [allLocalManga])

  const isSearching = query.trim().length >= 2

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Book size={28} className="text-[#ff8c42]" strokeWidth={1.5} />
          <h1 className="text-3xl font-black text-white tracking-tight">
            Manga
          </h1>
        </div>
        <p className="text-sm text-white/30">{loadingText}</p>
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Buscar manga..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-5 py-4 rounded-2xl text-white text-sm outline-none transition-all bg-white/5 border border-white/10 focus:border-[#ff8c42]/30 focus:ring-2 focus:ring-[#ff8c42]/20"
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-[#ff8c42]/30 border-t-[#ff8c42] animate-spin" />
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
            <div className="w-6 h-6 rounded-full border-2 border-[#ff8c42]/30 border-t-[#ff8c42] animate-spin mb-4" />
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
            {filteredLocalManga.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  En SkyFallDB
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {filteredLocalManga.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))}
                </div>
              </div>
            )}

            {anilistManga.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  Not Yet Discovered
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {anilistManga.map((manga) => (
                    <AnilistMangaCard key={manga.id} manga={manga} />
                  ))}
                </div>
              </div>
            )}

            {filteredLocalManga.length === 0 && anilistManga.length === 0 && (
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
            {topManga.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/30">
                    TOP 20 SKYFALL
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {topManga.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} badge="top" />
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
                  {displayedUtr.map((manga) => (
                    <MangaCard 
                      key={manga.id} 
                      manga={manga} 
                      badge="utr"
                      utrInfo={{ score: manga.single_score, username: manga.voter_username }}
                    />
                  ))}
                </div>
                
                {/* Botón "Ver más" para UTR */}
                {hasMoreUtr && displayedUtr.length < utrManga.length && (
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

            {/* Mensaje si no hay mangas */}
            {topManga.length === 0 && utrManga.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <Book size={48} className="text-white/20 mb-4" strokeWidth={1} />
                <p className="text-white font-semibold mb-2">
                  Sin manga en el ranking
                </p>
                <p className="text-sm text-center max-w-sm text-white/30">
                  Busca un manga arriba para añadirlo a SkyFallDB
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}