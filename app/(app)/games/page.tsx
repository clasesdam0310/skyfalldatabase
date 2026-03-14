'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabaseBrowser } from '@/lib/supabase/client'

const supabase = supabaseBrowser

type LocalGame = {
  id: string
  title: string
  cover_image: string | null
  year: number | null
  genres: string[] | null
  creator: string | null
  source: 'local'
  avg_score?: number
  vote_count?: number
}

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

const LOADING_TEXT = 'Cargando partida guardada...'

export default function GamesPage() {
  const [query, setQuery] = useState('')
  const [localGames, setLocalGames] = useState<LocalGame[]>([])
  const [rawgGames, setRawgGames] = useState<RawgGame[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function loadLocalGames() {
      setLoading(true)

      // Solo juegos con al menos un rating con estado registrado
      const { data } = await supabase
        .from('universal_mix')
        .select('*')
        .eq('type', 'game')
        .order('rank', { ascending: true })

      setLocalGames(
        (data ?? []).map((item) => ({
          id: item.id ?? '',
          title: item.title ?? '',
          cover_image: item.cover_image,
          year: item.year,
          genres: item.genres,
          creator: item.creator,
          source: 'local' as const,
          avg_score: Number(item.skyfall_avg),
          vote_count: Number(item.vote_count),
        }))
      )
      setLoading(false)
    }
    loadLocalGames()
  }, [])

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) {
      setRawgGames([])
      return
    }

    setSearching(true)

    // Búsqueda local — solo juegos con al menos un status registrado
    const { data: localResults } = await supabase
      .from('media_items')
      .select('id, title, cover_image, year, genres, creator, ratings!inner(status)')
      .eq('type', 'game')
      .ilike('title', `%${q}%`)
      .not('ratings.status', 'is', null)
      .limit(5)

    setLocalGames(
      (localResults ?? []).map((item) => ({
        id: item.id ?? '',
        title: item.title ?? '',
        cover_image: item.cover_image,
        year: item.year,
        genres: item.genres,
        creator: item.creator,
        source: 'local' as const,
      }))
    )

    try {
      const res = await fetch(`/api/rawg/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const localTitles = new Set(
        (localResults ?? []).map((g) => g.title.toLowerCase())
      )
      setRawgGames(
        (data.results ?? [])
          .filter((g: RawgGame) => !localTitles.has(g.name.toLowerCase()))
          .slice(0, 8)
      )
    } catch {
      setRawgGames([])
    }

    setSearching(false)
  }, [])

  const isSearching = query.trim().length >= 2

  return (
    <div className="px-8 py-8">

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">⊞</span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Videojuegos
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {LOADING_TEXT}
        </p>
      </div>

      <div className="relative mb-10">
        <input
          type="text"
          placeholder="Buscar videojuego..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-5 py-4 rounded-2xl text-white text-sm outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin mb-4" />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {LOADING_TEXT}
          </p>
        </div>
      )}

      {!loading && isSearching && (
        <div className="space-y-6">
          {localGames.length > 0 && (
            <div>
              <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                En SkyFallDB
              </p>
              <div className="grid grid-cols-5 gap-3">
                {localGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {rawgGames.length > 0 && (
            <div>
              <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Not Yet Discovered
              </p>
              <div className="grid grid-cols-5 gap-3">
                {rawgGames.map((game) => (
                  <RawgGameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {!searching && localGames.length === 0 && rawgGames.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48">
              <p className="text-white font-semibold mb-1">Sin resultados</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                No se encontró &quot;{query}&quot; en SkyFallDB ni en RAWG
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && !isSearching && (
        <div>
          {localGames.length > 0 ? (
            <>
              <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Ranking del grupo
              </p>
              <div className="grid grid-cols-5 gap-3">
                {localGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <span className="text-5xl mb-4 opacity-20">⊞</span>
              <p className="text-white font-semibold mb-2">
                Sin videojuegos en el ranking
              </p>
              <p className="text-sm text-center max-w-sm"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Busca un juego arriba para añadirlo a SkyFallDB
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

function GameCard({ game }: { game: LocalGame }) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/media/${game.id}`)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="relative" style={{ aspectRatio: '2/3' }}>
        {game.cover_image ? (
          <Image src={game.cover_image} alt={game.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'rgba(16,56,130,0.15)' }}>
            <span className="text-3xl opacity-30">⊞</span>
          </div>
        )}
        {game.avg_score !== undefined && game.avg_score > 0 && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(5,5,7,0.85)', color: '#FA4D5F' }}>
              {game.avg_score.toFixed(1)}★
            </span>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
          {game.title}
        </p>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {game.creator ?? game.genres?.[0] ?? ''}
        </p>
      </div>
    </div>
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
          api_id:     String(game.id),
          api_source: 'rawg',
          type:       'game',
          title:      game.name,
          cover_image: game.background_image,
          year:       game.released ? parseInt(game.released.slice(0, 4)) : null,
          genres:     game.genres?.map((g) => g.name) ?? [],
          creator:    game.developers?.[0]?.name ?? null,
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
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(250,77,95,0.2)',
        opacity: registering ? 0.5 : 1,
      }}
    >
      <div className="relative" style={{ aspectRatio: '2/3' }}>
        {game.background_image ? (
          <Image src={game.background_image} alt={game.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'rgba(16,56,130,0.15)' }}>
            <span className="text-3xl opacity-30">⊞</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          {registering ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          ) : (
            <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
              style={{ background: 'rgba(250,77,95,0.9)', color: '#ffffff' }}>
              NYD
            </span>
          )}
        </div>
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
          {game.name}
        </p>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {game.released?.slice(0, 4) ?? ''}{game.genres?.[0] ? ` · ${game.genres[0].name}` : ''}
        </p>
      </div>
    </div>
  )
}