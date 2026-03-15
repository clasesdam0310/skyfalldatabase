// hooks/useMediaData.ts
'use client' 

import { useState, useEffect } from 'react'
import type { 
  IgdbGameDetails, 
  IgdbSearchResponse, 
  TmdbMovieDetails, 
  TmdbSearchResponse,
  AnimeDetails,
  AnilistSearchResult,
  MangaDetails,
  MangaSearchResult,
  Character 
} from '@/types/local'

const igdbCache = new Map<string, IgdbGameDetails>()
const tmdbCache = new Map<string, TmdbMovieDetails>()
const anilistCache = new Map<string, AnimeDetails>()
const mangaCache = new Map<string, MangaDetails>()

// Tipo para la respuesta de personajes de AniList (anime) con paginación
interface AnilistCharacter {
  id: number
  name: {
    full: string
  }
  image: {
    large: string | null
  }
  description: string | null
}

interface AnilistCharactersResponse {
  data: {
    Media: {
      characters: {
        pageInfo: {
          hasNextPage: boolean
        }
        edges: {
          node: AnilistCharacter
          role: string
        }[]
      }
    }
  }
}

// Tipo para la respuesta de personajes de Manga con paginación
interface AnilistMangaCharactersResponse {
  data: {
    Media: {
      characters: {
        pageInfo: {
          hasNextPage: boolean
        }
        edges: {
          node: {
            id: number
            name: {
              full: string
            }
            image: {
              large: string | null
            }
            description: string | null
          }
          role: string
        }[]
      }
    }
  }
}

export function useMediaData(media: { 
  type: string; 
  title: string; 
  api_source: string | null; 
  api_id: string | null 
}) {
  const [igdbData, setIgdbData] = useState<IgdbGameDetails | null>(null)
  const [tmdbData, setTmdbData] = useState<TmdbMovieDetails | null>(null)
  const [anilistData, setAnilistData] = useState<AnimeDetails | null>(null)
  const [mangaData, setMangaData] = useState<MangaDetails | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)

  // Función para cargar TODOS los personajes de AniList (anime)
  const loadAnilistCharacters = async (animeId: string) => {
    try {
      console.log('🎭 Cargando TODOS los personajes de AniList para ID:', animeId)
      
      let allCharacters: Character[] = []
      let page = 1
      let hasNextPage = true

      while (hasNextPage) {
        const graphqlQuery = `
          query ($id: Int, $page: Int) {
            Media(id: $id, type: ANIME) {
              characters(sort: ROLE, page: $page, perPage: 50) {
                pageInfo {
                  hasNextPage
                }
                edges {
                  node {
                    id
                    name {
                      full
                    }
                    image {
                      large
                    }
                    description
                  }
                  role
                }
              }
            }
          }
        `

        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: graphqlQuery,
            variables: { id: parseInt(animeId), page }
          })
        })

        if (!res.ok) {
          console.error('Error cargando personajes:', await res.text())
          break
        }

        const data: AnilistCharactersResponse = await res.json()
        const characterEdges = data.data?.Media?.characters?.edges || []
        hasNextPage = data.data?.Media?.characters?.pageInfo?.hasNextPage || false
        
        const pageCharacters: Character[] = characterEdges.map((edge) => ({
          id: `anilist-${edge.node.id}`,
          name: edge.node.name.full,
          image_url: edge.node.image.large,
          lore: edge.node.description,
          role: edge.role || 'Personaje',
        }))

        allCharacters = [...allCharacters, ...pageCharacters]
        console.log(`📄 Página ${page}: ${pageCharacters.length} personajes`)
        page++
      }

      console.log('✅ TOTAL personajes cargados:', allCharacters.length)
      setCharacters(allCharacters)
    } catch (error) {
      console.error('Error cargando personajes de AniList:', error)
    }
  }

  // Función para cargar TODOS los personajes de Manga
  const loadMangaCharacters = async (mangaId: string) => {
    try {
      console.log('🎭 Cargando TODOS los personajes de manga para ID:', mangaId)
      
      let allCharacters: Character[] = []
      let page = 1
      let hasNextPage = true

      while (hasNextPage) {
        const graphqlQuery = `
          query ($id: Int, $page: Int) {
            Media(id: $id, type: MANGA) {
              characters(sort: ROLE, page: $page, perPage: 50) {
                pageInfo {
                  hasNextPage
                }
                edges {
                  node {
                    id
                    name {
                      full
                    }
                    image {
                      large
                    }
                    description
                  }
                  role
                }
              }
            }
          }
        `

        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: graphqlQuery,
            variables: { id: parseInt(mangaId), page }
          })
        })

        if (!res.ok) {
          console.error('Error cargando personajes de manga:', await res.text())
          break
        }

        const data: AnilistMangaCharactersResponse = await res.json()
        const characterEdges = data.data?.Media?.characters?.edges || []
        hasNextPage = data.data?.Media?.characters?.pageInfo?.hasNextPage || false
        
        const pageCharacters: Character[] = characterEdges.map((edge) => ({
          id: `manga-${edge.node.id}`,
          name: edge.node.name.full,
          image_url: edge.node.image.large,
          lore: edge.node.description,
          role: edge.role || 'Personaje',
        }))

        allCharacters = [...allCharacters, ...pageCharacters]
        console.log(`📄 Página ${page}: ${pageCharacters.length} personajes`)
        page++
      }

      console.log('✅ TOTAL personajes de manga cargados:', allCharacters.length)
      setCharacters(allCharacters)
    } catch (error) {
      console.error('Error cargando personajes de manga:', error)
    }
  }

  useEffect(() => {
    async function loadIgdb() {
      setLoading(true)
      try {
        const cacheKey = `igdb_${media.title}`
        if (igdbCache.has(cacheKey)) {
          setIgdbData(igdbCache.get(cacheKey) || null)
          setLoading(false)
          return
        }
        const searchRes = await fetch(`/api/igdb/search?q=${encodeURIComponent(media.title)}`)
        if (!searchRes.ok) throw new Error('Error en búsqueda IGDB')
        const searchData: IgdbSearchResponse = await searchRes.json()
        const results = searchData.results ?? []
        const match = results.find(
          (g) => g.name.toLowerCase() === media.title.toLowerCase()
        ) ?? results[0]
        if (match) {
          const detailRes = await fetch(`/api/igdb/game/${match.id}`)
          if (detailRes.ok) {
            const data: IgdbGameDetails = await detailRes.json()
            igdbCache.set(cacheKey, data)
            setIgdbData(data)
            console.log('IGDB Data loaded:', data)
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
        if (media.api_source === 'tmdb' && media.api_id) {
          const detailRes = await fetch(`/api/tmdb/movie/${media.api_id}`)
          if (detailRes.ok) {
            const data: TmdbMovieDetails = await detailRes.json()
            setTmdbData(data)
            console.log('TMDB Data loaded:', data)
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
        const cacheKey = `tmdb_${media.title}`
        if (tmdbCache.has(cacheKey)) {
          const cached = tmdbCache.get(cacheKey)!
          setTmdbData(cached)
          console.log('TMDB Data from cache:', cached)
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
        const searchRes = await fetch(`/api/tmdb/search?q=${encodeURIComponent(media.title)}`)
        if (!searchRes.ok) throw new Error('Error en búsqueda TMDB')
        const searchData: TmdbSearchResponse = await searchRes.json()
        const results = searchData.results ?? []
        const match = results.find(
          (m) => m.title.toLowerCase() === media.title.toLowerCase()
        ) ?? results[0]
        if (match) {
          const detailRes = await fetch(`/api/tmdb/movie/${match.id}`)
          if (detailRes.ok) {
            const data: TmdbMovieDetails = await detailRes.json()
            tmdbCache.set(cacheKey, data)
            setTmdbData(data)
            console.log('TMDB Data loaded:', data)
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

    async function loadAnilist() {
      console.log('📺 Cargando datos de AniList para:', media.title)
      setLoading(true)
      try {
        if (media.api_source === 'anilist' && media.api_id) {
          console.log('🔍 Obteniendo por ID:', media.api_id)
          const detailRes = await fetch(`/api/anilist/anime/${media.api_id}`)
          console.log('📥 Respuesta detalles:', detailRes.status)
          
          if (detailRes.ok) {
            const data: AnimeDetails = await detailRes.json()
            console.log('✅ Datos recibidos:', data)
            setAnilistData(data)
            
            // Cargar TODOS los personajes
            await loadAnilistCharacters(media.api_id)
            
            setLoading(false)
            return
          } else {
            console.log('❌ Error en respuesta:', detailRes.status)
          }
        }

        const cacheKey = `anilist_${media.title}`
        if (anilistCache.has(cacheKey)) {
          const cached = anilistCache.get(cacheKey) || null
          setAnilistData(cached)
          console.log('AniList Data from cache:', cached)
          setLoading(false)
          return
        }

        const searchRes = await fetch(`/api/anilist/search?q=${encodeURIComponent(media.title)}`)
        if (!searchRes.ok) throw new Error('Error en búsqueda AniList')
        const searchData: { results: AnilistSearchResult[] } = await searchRes.json()
        const results = searchData.results ?? []
        
        const match = results.find(
          (a: AnilistSearchResult) => a.name.toLowerCase() === media.title.toLowerCase()
        ) ?? results[0]

        if (match) {
          const detailRes = await fetch(`/api/anilist/anime/${match.id}`)
          if (detailRes.ok) {
            const data: AnimeDetails = await detailRes.json()
            anilistCache.set(cacheKey, data)
            setAnilistData(data)
            console.log('AniList Data loaded:', data)
            
            // Cargar TODOS los personajes
            await loadAnilistCharacters(String(match.id))
          } else {
            setAnilistData(null)
          }
        } else {
          setAnilistData(null)
        }
      } catch (error) {
        console.error('Error cargando datos de AniList:', error)
        setAnilistData(null)
      } finally {
        setLoading(false)
      }
    }

    async function loadManga() {
      console.log('📚 Cargando datos de Manga para:', media.title)
      setLoading(true)
      try {
        if (media.api_source === 'anilist' && media.api_id) {
          console.log('🔍 Obteniendo manga por ID:', media.api_id)
          const detailRes = await fetch(`/api/manga/${media.api_id}`)
          console.log('📥 Respuesta detalles manga:', detailRes.status)
          
          if (detailRes.ok) {
            const data: MangaDetails = await detailRes.json()
            console.log('✅ Datos de manga recibidos:', data)
            setMangaData(data)
            
            // Cargar TODOS los personajes después de tener los detalles
            await loadMangaCharacters(media.api_id)
            
            setLoading(false)
            return
          }
        }

        const cacheKey = `manga_${media.title}`
        if (mangaCache.has(cacheKey)) {
          const cached = mangaCache.get(cacheKey) || null
          setMangaData(cached)
          console.log('Manga Data from cache:', cached)
          setLoading(false)
          return
        }

        const searchRes = await fetch(`/api/manga/search?q=${encodeURIComponent(media.title)}`)
        if (!searchRes.ok) throw new Error('Error en búsqueda de manga')
        const searchData: { results: MangaSearchResult[] } = await searchRes.json()
        const results = searchData.results ?? []
        
        const match = results.find(
          (m: MangaSearchResult) => m.name.toLowerCase() === media.title.toLowerCase()
        ) ?? results[0]

        if (match) {
          const detailRes = await fetch(`/api/manga/${match.id}`)
          if (detailRes.ok) {
            const data: MangaDetails = await detailRes.json()
            mangaCache.set(cacheKey, data)
            setMangaData(data)
            console.log('Manga Data loaded:', data)
            
            // Cargar TODOS los personajes
            await loadMangaCharacters(String(match.id))
          } else {
            setMangaData(null)
          }
        } else {
          setMangaData(null)
        }
      } catch (error) {
        console.error('Error cargando datos de manga:', error)
        setMangaData(null)
      } finally {
        setLoading(false)
      }
    }

    if (media.type === 'game') {
      loadIgdb()
    } else if (media.type === 'film') {
      loadTmdb()
    } else if (media.type === 'anime') {
      loadAnilist()
    } else if (media.type === 'manga') {
      loadManga()
    } else {
      setIgdbData(null)
      setTmdbData(null)
      setAnilistData(null)
      setMangaData(null)
      setLoading(false)
    }
  }, [media.type, media.title, media.api_source, media.api_id])

  return { igdbData, tmdbData, anilistData, mangaData, characters, loading }
}