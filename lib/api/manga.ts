// lib/api/manga.ts
const ANILIST_API_URL = 'https://graphql.anilist.co'

// Headers para forzar inglés
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

// Tipos para las respuestas de AniList (Manga)
interface AniListStaffName {
  full: string
}

interface AniListStaffNode {
  name: AniListStaffName
}

interface AniListStaffEdge {
  node: AniListStaffNode
  role: string
}

interface AniListStaff {
  edges: AniListStaffEdge[]
}

interface AniListMedia {
  id: number
  title: {
    romaji: string
    english: string | null
  }
  coverImage: {
    large: string | null
  }
  startDate: {
    year: number | null
  }
  genres: string[]
  staff?: AniListStaff
  averageScore: number | null
  description: string | null
  chapters: number | null
  volumes: number | null
  status: string | null
  format: string | null
  siteUrl: string | null
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

// Tipo para la búsqueda
export interface MangaSearchResult {
  id: number
  name: string
  background_image: string | null
  released: string | null // año como string
  genres: string[]
  authors: string[]
  averageScore: number | null
}

// Tipo para los detalles
export interface MangaDetails {
  description: string
  chapters: number | null
  volumes: number | null
  authors: string[]
  status: string | null
  format: string | null
  siteUrl: string | null
  averageScore: number | null
  genres: string[]
  year: number | null
}

/**
 * Busca manga por nombre en AniList
 */
export async function searchManga(query: string): Promise<MangaSearchResult[]> {
  console.log('🔍 Buscando en AniList (manga):', query)
  
  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
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
          staff {
            edges {
              node {
                name {
                  full
                }
              }
              role
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

    return mediaList.map((media) => {
      // Extraer autores (staff con rol de Story/Art)
      const authors = media.staff?.edges
        ?.filter((edge: AniListStaffEdge) => 
          edge.role?.includes('Story') || 
          edge.role?.includes('Art') || 
          edge.role?.includes('Author')
        )
        .map((edge: AniListStaffEdge) => edge.node.name.full) || []

      return {
        id: media.id,
        name: media.title.english || media.title.romaji,
        background_image: media.coverImage.large,
        released: media.startDate.year?.toString() || null,
        genres: media.genres || [],
        authors: authors,
        averageScore: media.averageScore,
      }
    })
  } catch (error) {
    console.error('Error searching manga:', error)
    return []
  }
}

/**
 * Obtiene detalles completos de un manga por ID
 */
export async function getMangaDetails(id: string): Promise<MangaDetails | null> {
  console.log('🎯 getMangaDetails llamado con ID:', id)
  
  const graphqlQuery = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        description(asHtml: false)
        chapters
        volumes
        staff {
          edges {
            node {
              name {
                full
              }
            }
            role
          }
        }
        status
        format
        siteUrl
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

    const res = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { id: idNum }
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Error response:', errorText)
      return null
    }

    const data: AniListMediaResponse = await res.json()
    const media = data.data?.Media
    if (!media) return null

    // Extraer autores
    const authors = media.staff?.edges
      ?.filter((edge: AniListStaffEdge) => 
        edge.role?.includes('Story') || 
        edge.role?.includes('Art') || 
        edge.role?.includes('Author')
      )
      .map((edge: AniListStaffEdge) => edge.node.name.full) || []

    return {
      description: media.description || '',
      chapters: media.chapters,
      volumes: media.volumes,
      authors: authors,
      status: media.status,
      format: media.format,
      siteUrl: media.siteUrl,
      averageScore: media.averageScore,
      genres: media.genres,
      year: media.startDate.year,
    }
  } catch (error) {
    console.error('❌ Error fetching manga details:', error)
    return null
  }
}