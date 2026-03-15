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

type Tables = Database['public']['Tables']
type MediaItem = Tables['media_items']['Row']
type Rating = Tables['ratings']['Row']
type User = Tables['users']['Row']

type Film = {
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

type UtrFilm = Film & {
  single_score: number
  voter_username: string
}

type TmdbMovie = {
  id: number
  title: string
  poster_url: string | null
  year: number | null
  overview: string | null
  vote_average: number
  vote_count: number
}

type MediaItemWithRatings = MediaItem & {
  ratings: (Pick<Rating, 'score' | 'user_id'> & {
    users: Pick<User, 'username'> | null
  })[]
}

const LOADING_TEXTS = [
  'Ajustando el proyector...',
  'Cargando la cartelera...',
  'Preparando la sala...',
]

// Componente de tarjeta reutilizable
function FilmCard({ film, badge, utrInfo }: {
  film: Film;
  badge?: 'top' | 'utr' | 'nyd';
  utrInfo?: { score: number; username: string };
}) {
  const router = useRouter()

  const badgeStyles = {
    top: {
      bg: 'bg-[#00d4ff]/20',
      text: 'text-[#00d4ff]',
      border: 'border-[#00d4ff]/30',
      label: `#${film.avg_score.toFixed(1)}`
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
  const displayScore = badge === 'utr' && utrInfo?.score !== undefined
    ? utrInfo.score
    : film.avg_score

  return (
    <motion.div
      onClick={() => router.push(`/media/${film.id}`)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 bg-white/5 border border-white/10"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="relative aspect-[2/3]">
        {film.cover_image ? (
          <Image src={film.cover_image} alt={film.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#00d4ff]/10">
            <Film size={32} className="text-white/30" strokeWidth={1} />
          </div>
        )}

        {style && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full border ${style.bg} ${style.border} backdrop-blur-sm`}>
            <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
          </div>
        )}

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
          {film.title}
        </p>
        <p className="text-xs truncate text-white/30">
          {film.creator ?? film.genres?.[0] ?? ''}
        </p>

        {badge === 'utr' && utrInfo?.username && (
          <p className="text-[10px] text-[#ff6eb4] mt-1 truncate">
            @{utrInfo.username}
          </p>
        )}

        {badge === 'top' && (
          <p className="text-[10px] text-white/40 mt-1">
            {film.vote_count} {film.vote_count === 1 ? 'voto' : 'votos'}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function TmdbMovieCard({ movie }: { movie: TmdbMovie }) {
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
          api_id: String(movie.id),
          api_source: 'tmdb',
          type: 'film',
          title: movie.title,
          cover_image: movie.poster_url,
          year: movie.year,
          genres: [],
          creator: null,
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
        {movie.poster_url ? (
          <Image src={movie.poster_url} alt={movie.title} fill className="object-cover" />
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
          {movie.title}
        </p>
        <p className="text-xs truncate text-white/30">
          {movie.year ?? ''}
        </p>
      </div>
    </div>
  )
}

export default function FilmsPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [topFilms, setTopFilms] = useState<Film[]>([])
  const [utrFilms, setUtrFilms] = useState<UtrFilm[]>([])
  const [utrPage, setUtrPage] = useState(1)
  const [hasMoreUtr, setHasMoreUtr] = useState(false)
  const [allLocalFilms, setAllLocalFilms] = useState<Film[]>([])
  const [filteredLocalFilms, setFilteredLocalFilms] = useState<Film[]>([])
  const [tmdbMovies, setTmdbMovies] = useState<TmdbMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const loadingText = LOADING_TEXTS[0]

  const UTR_PAGE_SIZE = 10

  useEffect(() => {
    async function loadFilms() {
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
        .eq('type', 'film')

      if (error || !data) {
        console.error('Error loading films:', error)
        setLoading(false)
        return
      }

      const filmsWithRatings = data as unknown as MediaItemWithRatings[]

      const processedFilms: Film[] = filmsWithRatings.map((film) => {
        const scores = film.ratings
          .map((r) => r.score)
          .filter((score): score is number => score !== null)

        const voteCount = scores.length
        const avgScore = voteCount > 0
          ? scores.reduce((a, b) => a + b, 0) / voteCount
          : 0

        return {
          id: film.id,
          title: film.title,
          cover_image: film.cover_image,
          year: film.year,
          genres: film.genres,
          creator: film.creator,
          avg_score: avgScore,
          vote_count: voteCount,
          api_id: film.api_id,
        }
      })

      setAllLocalFilms(processedFilms)

      const top = processedFilms
        .filter(f => f.vote_count >= 2)
        .sort((a, b) => {
          if (a.avg_score !== b.avg_score) return b.avg_score - a.avg_score
          return b.vote_count - a.vote_count
        })
        .slice(0, 20)

      setTopFilms(top)

      const utr = filmsWithRatings
        .filter(film => {
          const validRatings = film.ratings.filter(r => r.score !== null)
          return validRatings.length === 1
        })
        .map(film => {
          const singleRating = film.ratings.find(r => r.score !== null)!
          const baseFilm = processedFilms.find(f => f.id === film.id)!
          return {
            ...baseFilm,
            single_score: singleRating.score!,
            voter_username: singleRating.users?.username ?? 'usuario'
          }
        })
        .sort((a, b) => b.single_score - a.single_score)

      setUtrFilms(utr)
      setHasMoreUtr(utr.length > UTR_PAGE_SIZE)
      setLoading(false)
    }

    loadFilms()
  }, [])

  const loadMoreUtr = useCallback(() => {
    setUtrPage(prev => prev + 1)
  }, [])

  const displayedUtr = utrFilms.slice(0, utrPage * UTR_PAGE_SIZE)

  const handleSearch = useCallback((input: string) => {
    const trimmedQuery = input.trim().replace(/\s+/g, ' ')
    setQuery(input)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (trimmedQuery.length < 2) {
      setFilteredLocalFilms([])
      setTmdbMovies([])
      return
    }

    setSearching(true)
    debounceTimer.current = setTimeout(async () => {
      const searchTerm = trimmedQuery.toLowerCase()

      const filtered = allLocalFilms.filter(film =>
        film.title.toLowerCase().includes(searchTerm)
      )
      setFilteredLocalFilms(filtered)

      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(trimmedQuery)}`)
        const data = await res.json()

        const localApiIds = new Set(
          allLocalFilms
            .map(f => f.api_id)
            .filter((id): id is string => id !== null)
        )

        const filteredTmdb = (data.results ?? [])
          .filter((movie: TmdbMovie) => !localApiIds.has(String(movie.id)))
          .slice(0, 8)

        setTmdbMovies(filteredTmdb)
      } catch {
        setTmdbMovies([])
      }

      setSearching(false)
    }, 300)
  }, [allLocalFilms])

  const isSearching = query.trim().length >= 2

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Film size={28} className="text-[#00d4ff]" strokeWidth={1.5} />
          <h1 className="text-3xl font-black text-white tracking-tight">
            Películas
          </h1>
        </div>
        <p className="text-sm text-white/30">{loadingText}</p>
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Buscar película..."
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
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {filteredLocalFilms.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  En SkyFallDB
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {filteredLocalFilms.map((film) => (
                    <FilmCard key={film.id} film={film} />
                  ))}
                </div>
              </div>
            )}

            {tmdbMovies.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
                  Not Yet Discovered
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {tmdbMovies.map((movie) => (
                    <TmdbMovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}

            {filteredLocalFilms.length === 0 && tmdbMovies.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48">
                <p className="text-white font-semibold mb-1">Sin resultados</p>
                <p className="text-sm text-white/30">
                  No se encontró &quot;{query}&quot; en SkyFallDB ni en TMDB
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {topFilms.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/30">
                    TOP 20 SKYFALL
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {topFilms.map((film) => (
                    <FilmCard key={film.id} film={film} badge="top" />
                  ))}
                </div>
              </div>
            )}

            {displayedUtr.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/30">
                    UNDER THE RADAR
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {displayedUtr.map((film) => (
                    <FilmCard
                      key={film.id}
                      film={film}
                      badge="utr"
                      utrInfo={{ score: film.single_score, username: film.voter_username }}
                    />
                  ))}
                </div>

                {hasMoreUtr && displayedUtr.length < utrFilms.length && (
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

            {topFilms.length === 0 && utrFilms.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <Film size={48} className="text-white/20 mb-4" strokeWidth={1} />
                <p className="text-white font-semibold mb-2">
                  Sin películas en el ranking
                </p>
                <p className="text-sm text-center max-w-sm text-white/30">
                  Busca una película arriba para añadirla a SkyFallDB
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}