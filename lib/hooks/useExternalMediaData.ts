'use client'

import { useState, useEffect } from 'react'
import type { Character } from '@/components/media/CharacterScroll'

// Tipos para IGDB (juegos)
interface IgdbSearchResult {
  id: number
  name: string
  cover_url: string | null
  year: number | null
  genres: string[]
  developer: string | null
  summary: string | null
}

interface IgdbSearchResponse {
  results: IgdbSearchResult[]
}

interface IgdbGameDetails {
  id: number
  name: string
  summary: string | null
  cover_url: string | null
  year: number | null
  genres: string[]
  developer: string | null
  developers: string[]
  publishers: string[]
  website: string
  metacritic: number | null
  platforms: string[]
  released: string | null
  rating: number
  ratings_count: number
}

// Tipos para TMDB (películas)
interface TmdbSearchResult {
  id: number
  title: string
  poster_url: string | null
  year: number | null
  overview: string | null
  vote_average: number
  vote_count: number
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[]
}

interface TmdbCast {
  id: string
  name: string
  character: string
  profile_path: string | null
}

interface TmdbMovieDetails {
  id: number
  title: string
  overview: string | null
  poster_url: string | null
  backdrop_url: string | null
  year: number | null
  runtime: number | null
  genres: string[]
  director: string | null
  vote_average: number
  vote_count: number
  cast?: TmdbCast[]
}

interface UseExternalMediaDataProps {
  mediaType: string
  title: string
  apiSource: string | null
  apiId: string | null
}

// Caches fuera del componente para que persistan entre renders
const igdbCache = new Map<string, IgdbGameDetails>()
const tmdbCache = new Map<string, TmdbMovieDetails>()

export function useExternalMediaData({
  mediaType,
  title,
  apiSource,
  apiId,
}: UseExternalMediaDataProps) {
  const [igdbData, setIgdbData] = useState<IgdbGameDetails | null>(null)
  const [tmdbData, setTmdbData] = useState<TmdbMovieDetails | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadIgdb() {
      setLoading(true)
      try {
        const cacheKey = `igdb_${title}`
        if (igdbCache.has(cacheKey)) {
          setIgdbData(igdbCache.get(cacheKey) || null)
          setLoading(false)
          return
        }
        const searchRes = await fetch(`/api/igdb/search?q=${encodeURIComponent(title)}`)
        if (!searchRes.ok) throw new Error('Error en búsqueda IGDB')
        const searchData: IgdbSearchResponse = await searchRes.json()
        const results = searchData.results ?? []
        const match = results.find(
          (g: IgdbSearchResult) => g.name.toLowerCase() === title.toLowerCase()
        ) ?? results[0]
        if (match) {
          const detailRes = await fetch(`/api/igdb/game/${match.id}`)
          if (detailRes.ok) {
            const data: IgdbGameDetails = await detailRes.json()
            igdbCache.set(cacheKey, data)
            setIgdbData(data)
          } else {
            setIgdbData(null)
          }
        } else {
          setIgdbData(null)
        }
      } catch (error) {
        console.error('Error cargando datos de IGDB:', error)
        setIgdbData(null)
      } finally {
        setLoading(false)
      }
    }

    async function loadTmdb() {
      setLoading(true)
      try {
        if (apiSource === 'tmdb' && apiId) {
          const detailRes = await fetch(`/api/tmdb/movie/${apiId}`)
          if (detailRes.ok) {
            const data: TmdbMovieDetails = await detailRes.json()
            setTmdbData(data)
            if (data.cast && data.cast.length > 0) {
              const castCharacters: Character[] = data.cast.map((actor) => ({
                id: `tmdb-${actor.id}`,
                name: actor.name,
                image_url: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
                lore: null,
                role: actor.character || 'Personaje',
              }))
              setCharacters(castCharacters)
            } else {
              setCharacters([])
            }
            setLoading(false)
            return
          }
        }
        const cacheKey = `tmdb_${title}`
        if (tmdbCache.has(cacheKey)) {
          const cached = tmdbCache.get(cacheKey)!
          setTmdbData(cached)
          if (cached.cast && cached.cast.length > 0) {
            const castCharacters: Character[] = cached.cast.map((actor) => ({
              id: `tmdb-${actor.id}`,
              name: actor.name,
              image_url: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
              lore: null,
              role: actor.character || 'Personaje',
            }))
            setCharacters(castCharacters)
          } else {
            setCharacters([])
          }
          setLoading(false)
          return
        }
        const searchRes = await fetch(`/api/tmdb/search?q=${encodeURIComponent(title)}`)
        if (!searchRes.ok) throw new Error('Error en búsqueda TMDB')
        const searchData: TmdbSearchResponse = await searchRes.json()
        const results = searchData.results ?? []
        const match = results.find(
          (m: TmdbSearchResult) => m.title.toLowerCase() === title.toLowerCase()
        ) ?? results[0]
        if (match) {
          const detailRes = await fetch(`/api/tmdb/movie/${match.id}`)
          if (detailRes.ok) {
            const data: TmdbMovieDetails = await detailRes.json()
            tmdbCache.set(cacheKey, data)
            setTmdbData(data)
            if (data.cast && data.cast.length > 0) {
              const castCharacters: Character[] = data.cast.map((actor) => ({
                id: `tmdb-${actor.id}`,
                name: actor.name,
                image_url: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
                lore: null,
                role: actor.character || 'Personaje',
              }))
              setCharacters(castCharacters)
            } else {
              setCharacters([])
            }
          } else {
            setTmdbData(null)
            setCharacters([])
          }
        } else {
          setTmdbData(null)
          setCharacters([])
        }
      } catch (error) {
        console.error('Error cargando datos de TMDB:', error)
        setTmdbData(null)
        setCharacters([])
      } finally {
        setLoading(false)
      }
    }

    if (mediaType === 'game') {
      loadIgdb()
    } else if (mediaType === 'film') {
      loadTmdb()
    } else {
      setIgdbData(null)
      setTmdbData(null)
      setCharacters([])
      setLoading(false)
    }
  }, [mediaType, title, apiSource, apiId])

  return {
    igdbData,
    tmdbData,
    externalCharacters: characters,
    loadingExternal: loading,
  }
}