// lib/api/anilist.ts
const ANILIST_API_URL = 'https://graphql.anilist.co'

// Headers para forzar inglés
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

// Tipos para las respuestas de AniList
interface AniListMedia {
  id: number
  title: {
    romaji: string
    english: string | null
    native: string | null
  }
  coverImage: {
    large: string | null
  }
  startDate: {
    year: number | null
  }
  genres: string[]
  studios?: {
    nodes: { name: string }[]
  }
  averageScore: number | null
  description: string | null
  episodes: number | null
  status: string | null
  format: string | null
  source: string | null
  siteUrl: string | null
  trailer?: {
    id: string
    site: string
  } | null
}

interface AniListPageResponse {
  data: {
    Page: {
      media: AniListMedia[]
    }
  }
}

interface AniListMediaResponse {
  data: {
    Media: AniListMedia
  }
}

// Tipo para la búsqueda (simplificado)
export interface AnimeSearchResult {
  id: number
  name: string // usaremos title.romaji o english
  background_image: string | null
  released: string | null // año como string
  genres: string[]
  studios: string[]
  averageScore: number | null
}

// Tipo para los detalles
export interface AnimeDetails {
  description: string
  episodes: number | null
  studios: string[]
  status: string | null
  format: string | null
  source: string | null
  siteUrl: string | null
  trailer: { id: string; site: string } | null
  averageScore: number | null
  genres: string[]
  year: number | null
}

/**
 * Busca anime por nombre en AniList
 */
export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          startDate {
            year
          }
          genres
          studios {
            nodes {
              name
            }
          }
          averageScore
        }
      }
    }
  `

  try {
    const res = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { search: query }
      })
    })

    if (!res.ok) {
      console.error('AniList search error:', await res.text())
      return []
    }

    const data: AniListPageResponse = await res.json()
    const mediaList = data.data?.Page?.media || []

    return mediaList.map((media) => ({
      id: media.id,
      name: media.title.english || media.title.romaji,
      background_image: media.coverImage.large,
      released: media.startDate.year?.toString() || null,
      genres: media.genres || [],
      studios: media.studios?.nodes?.map(s => s.name) || [],
      averageScore: media.averageScore,
    }))
  } catch (error) {
    console.error('Error searching anime:', error)
    return []
  }
}

/**
 * Obtiene detalles completos de un anime por ID
 */
/**
 * Obtiene detalles completos de un anime por ID
 */
export async function getAnimeDetails(id: string): Promise<AnimeDetails | null> {
  console.log('🎯 getAnimeDetails llamado con ID:', id)
  
  const graphqlQuery = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        description(asHtml: false)
        episodes
        studios {
          nodes {
            name
          }
        }
        status
        format
        source
        siteUrl
        trailer {
          id
          site
        }
        averageScore
        genres
        startDate {
          year
        }
      }
    }
  `

  try {
    const idNum = parseInt(id)
    if (isNaN(idNum)) {
      console.error('❌ ID inválido:', id)
      return null
    }

    console.log('📤 Enviando query a AniList con ID:', idNum)
    const res = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { id: idNum }
      })
    })

    console.log('📥 Respuesta status:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Error response:', errorText)
      return null
    }

    const data: AniListMediaResponse = await res.json()
    
    const media = data.data?.Media
    if (!media) {
      console.log('⚠️ No media found for ID:', idNum)
      return null
    }

    console.log('✅ Datos obtenidos:', {
      hasDescription: !!media.description,
      episodes: media.episodes,
      studios: media.studios?.nodes?.length || 0
    })

    return {
      description: media.description || '',
      episodes: media.episodes,
      studios: media.studios?.nodes?.map(s => s.name) || [],
      status: media.status,
      format: media.format,
      source: media.source,
      siteUrl: media.siteUrl,
      trailer: media.trailer ?? null,
      averageScore: media.averageScore,
      genres: media.genres,
      year: media.startDate.year,
    }
  } catch (error) {
    console.error('❌ Error fetching anime details:', error)
    return null
  }
}