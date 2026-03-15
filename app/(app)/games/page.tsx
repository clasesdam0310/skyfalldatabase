'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { Search, Gamepad2, ChevronDown } from 'lucide-react'
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

// Tipo para juegos procesados
type Game = {
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

// Tipo para juegos UTR con información del usuario
type UtrGame = Game & {
  single_score: number
  voter_username: string
}

// Tipo para juegos de RAWG
type RawgGame = {
  id: number
  name: string
  background_image: string | null
  released: string | null
  genres: { name: string }[]
  developers?: { name: string }[]
  rating: number
  source: 'rawg'
}

// Tipo para la respuesta de media_items con ratings
type MediaItemWithRatings = MediaItem & {
  ratings: (Pick<Rating, 'score' | 'user_id'> & {
    users: Pick<User, 'username'> | null
  })[]
}

const LOADING_TEXTS = [
  'Cargando partida guardada...',
  'Inicializando nivel...',
  'Conectando con el servidor...',
]

// Componente de tarjeta reutilizable
function GameCard({ game, badge, utrInfo }: { 
  game: Game; 
  badge?: 'top' | 'utr' | 'nyd';
  utrInfo?: { score: number; username: string };
}) {
  const router = useRouter()
  
  const badgeStyles = {
    top: {
      bg: 'bg-[#00d4ff]/20',
      text: 'text-[#00d4ff]',
      border: 'border-[#00d4ff]/30',
      label: `#${game.avg_score.toFixed(1)}`
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
    : game.avg_score

  return (
    <motion.div
      onClick={() => router.push(`/media/${game.id}`)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 bg-white/5 border border-white/10"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="relative aspect-[2/3]">
        {game.cover_image ? (
          <Image src={game.cover_image} alt={game.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#00d4ff]/10">
            <Gamepad2 size={32} className="text-white/30" strokeWidth={1} />
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
            <span className="text-xs font-bold text-[#00d4ff]">
              {displayScore.toFixed(1)}★
            </span>
          </div>
        )}
      </div>
      
      <div className="p-2">
        <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
          {game.title}
        </p>
        <p className="text-xs truncate text-white/30">
          {game.creator ?? game.genres?.[0] ?? ''}
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
            {game.vote_count} {game.vote_count === 1 ? 'voto' : 'votos'}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function RawgGameCard({ game }: { game: RawgGame }) {
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
          api_id: String(game.id),
          api_source: 'rawg',
          type: 'game',
          title: game.name,
          cover_image: game.background_image,
          year: game.released ? parseInt(game.released.slice(0, 4)) : null,
          genres: game.genres?.map((g) => g.name) ?? [],
          creator: game.developers?.[0]?.name ?? null,
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
        {game.background_image ? (
          <Image src={game.background_image} alt={game.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#ff6eb4]/10">
            <Gamepad2 size={32} className="text-white/30" strokeWidth={1} />
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
          {game.name}
        </p>
        <p className="text-xs truncate text-white/30">
          {game.released?.slice(0, 4) ?? ''}{game.genres?.[0] ? ` · ${game.genres[0].name}` : ''}
        </p>
      </div>
    </div>
  )
}

export default function GamesPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [topGames, setTopGames] = useState<Game[]>([])
  const [utrGames, setUtrGames] = useState<UtrGame[]>([])
  const [utrPage, setUtrPage] = useState(1)
  const [hasMoreUtr, setHasMoreUtr] = useState(false)
  const [allLocalGames, setAllLocalGames] = useState<Game[]>([])
  const [filteredLocalGames, setFilteredLocalGames] = useState<Game[]>([])
  const [rawgGames, setRawgGames] = useState<RawgGame[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const loadingText = LOADING_TEXTS[0]

  const UTR_PAGE_SIZE = 10

  // Cargar todos los juegos con sus ratings
  useEffect(() => {
    async function loadGames() {
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
        .eq('type', 'game')

      if (error || !data) {
        console.error('Error loading games:', error)
        setLoading(false)
        return
      }

      // Tipar los datos correctamente
      const gamesWithRatings = data as unknown as MediaItemWithRatings[]

      // Procesar los datos para cálculos generales
      const processedGames: Game[] = gamesWithRatings.map((game) => {
        const scores = game.ratings
          .map((r) => r.score)
          .filter((score): score is number => score !== null)
        
        const voteCount = scores.length
        const avgScore = voteCount > 0 
          ? scores.reduce((a, b) => a + b, 0) / voteCount 
          : 0

        return {
          id: game.id,
          title: game.title,
          cover_image: game.cover_image,
          year: game.year,
          genres: game.genres,
          creator: game.creator,
          avg_score: avgScore,
          vote_count: voteCount,
          api_id: game.api_id,
        }
      })

      setAllLocalGames(processedGames)

      // Top 20: mínimo 2 votos
      const top = processedGames
        .filter(g => g.vote_count >= 2)
        .sort((a, b) => {
          if (a.avg_score !== b.avg_score) {
            return b.avg_score - a.avg_score
          }
          return b.vote_count - a.vote_count
        })
        .slice(0, 20)

      setTopGames(top)

      // UTR: exactamente 1 voto, con info del usuario
      const utr: UtrGame[] = gamesWithRatings
        .filter(game => {
          const validRatings = game.ratings.filter(r => r.score !== null)
          return validRatings.length === 1
        })
        .map(game => {
          const singleRating = game.ratings.find(r => r.score !== null)!
          const baseGame = processedGames.find(g => g.id === game.id)!
          
          return {
            ...baseGame,
            single_score: singleRating.score!,
            voter_username: singleRating.users?.username ?? 'usuario'
          }
        })
        .sort((a, b) => b.single_score - a.single_score)

      setUtrGames(utr)
      setHasMoreUtr(utr.length > UTR_PAGE_SIZE)
      setLoading(false)
    }

    loadGames()
  }, [])

  // Cargar más UTR
  const loadMoreUtr = useCallback(() => {
    setUtrPage(prev => prev + 1)
  }, [])

  // UTR paginado
  const displayedUtr = utrGames.slice(0, utrPage * UTR_PAGE_SIZE)

  // Función de búsqueda con debounce
  const handleSearch = useCallback((input: string) => {
    const trimmedQuery = input.trim().replace(/\s+/g, ' ')
    setQuery(input)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (trimmedQuery.length < 2) {
      setFilteredLocalGames([])
      setRawgGames([])
      return
    }

    setSearching(true)
    debounceTimer.current = setTimeout(async () => {
      const searchTerm = trimmedQuery.toLowerCase()

      // 1. FILTRADO LOCAL
      const filtered = allLocalGames.filter(game => 
        game.title.toLowerCase().includes(searchTerm)
      )
      setFilteredLocalGames(filtered)

      // 2. BUSCAR EN RAWG
      try {
        const res = await fetch(`/api/rawg/search?q=${encodeURIComponent(trimmedQuery)}`)
        const data = await res.json()
        
        const localApiIds = new Set(
          allLocalGames
            .map(g => g.api_id)
            .filter((id): id is string => id !== null)
        )

        const filteredRawg = (data.results ?? [])
          .filter((g: RawgGame) => !localApiIds.has(String(g.id)))
          .slice(0, 8)

        setRawgGames(filteredRawg)
      } catch {
        setRawgGames([])
      }

      setSearching(false)
    }, 300)
  }, [allLocalGames])

  const isSearching = query.trim().length >= 2

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Gamepad2 size={28} className="text-[#00d4ff]" strokeWidth={1.5} />
          <h1 className="text-3xl font-black text-white tracking-tight">
            Videojuegos
          </h1>
        </div>
        <p className="text-sm text-white/30">{loadingText}</p>
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Buscar videojuego..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-5 py-4 rounded-2xl text-white text-sm outline-none transition-all bg-white/5 border border-white/10 focus:border-[#00d4ff]/30 focus:ring-2 focus:ring-[#00d4ff]/20"
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
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
            <div className="w-6 h-6 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin mb-4" />
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
            {filteredLocalGames.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  En SkyFallDB
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {filteredLocalGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            )}

            {rawgGames.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  Not Yet Discovered
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {rawgGames.map((game) => (
                    <RawgGameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            )}

            {filteredLocalGames.length === 0 && rawgGames.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48">
                <p className="text-white font-semibold mb-1">Sin resultados</p>
                <p className="text-sm text-white/30">
                  No se encontró &quot;{query}&quot; en SkyFallDB ni en RAWG
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
            {topGames.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/30">
                    TOP 20 SKYFALL
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {topGames.map((game) => (
                    <GameCard key={game.id} game={game} badge="top" />
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
                  {displayedUtr.map((game) => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      badge="utr"
                      utrInfo={{ score: game.single_score, username: game.voter_username }}
                    />
                  ))}
                </div>
                
                {/* Botón "Ver más" para UTR */}
                {hasMoreUtr && displayedUtr.length < utrGames.length && (
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

            {/* Mensaje si no hay juegos */}
            {topGames.length === 0 && utrGames.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <Gamepad2 size={48} className="text-white/20 mb-4" strokeWidth={1} />
                <p className="text-white font-semibold mb-2">
                  Sin videojuegos en el ranking
                </p>
                <p className="text-sm text-center max-w-sm text-white/30">
                  Busca un juego arriba para añadirlo a SkyFallDB
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}