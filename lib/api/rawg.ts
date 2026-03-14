const RAWG_API_KEY = process.env.RAWG_API_KEY
const BASE_URL = 'https://api.rawg.io/api'

// Headers para forzar inglés siempre
const headers = {
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent': 'SkyFallDB/1.0'
}

// Tipos para las respuestas de RAWG
interface RawgDeveloper {
  name: string
}

interface RawgPublisher {
  name: string
}

interface RawgPlatform {
  platform: {
    name: string
  }
}

interface RawgGameSearchResult {
  id: number
  name: string
  background_image: string | null
  released: string | null
  genres: { name: string }[]
  developers?: RawgDeveloper[]
  rating: number
}

interface RawgGameDetails {
  description_raw: string
  developers?: RawgDeveloper[]
  publishers?: RawgPublisher[]
  website: string
  metacritic: number | null
  platforms?: RawgPlatform[]
  released: string | null
  rating: number
  ratings_count: number
}

// Tipo para la respuesta de búsqueda
export interface GameSearchResult {
  id: number
  name: string
  background_image: string | null
  released: string | null
  genres: string[]
  developers?: string[]
  rating: number
}

// Tipo para los detalles del juego
export interface GameDetails {
  description: string
  developers: string[]
  publishers: string[]
  website: string
  metacritic: number | null
  platforms: string[]
  released: string | null
  rating: number
  ratings_count: number
}

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=10`,
      { headers }
    )
    const data = await res.json()
    
    return (data.results || []).map((game: RawgGameSearchResult) => ({
      id: game.id,
      name: game.name,
      background_image: game.background_image,
      released: game.released,
      genres: game.genres?.map(g => g.name) || [],
      developers: game.developers?.map(d => d.name) || [],
      rating: game.rating,
    }))
  } catch (error) {
    console.error('Error searching games:', error)
    return []
  }
}

export async function getGameDetails(id: string): Promise<GameDetails | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`,
      { headers }
    )
    const data: RawgGameDetails = await res.json()
    
    return {
      description: data.description_raw,
      developers: data.developers?.map((d: RawgDeveloper) => d.name) || [],
      publishers: data.publishers?.map((p: RawgPublisher) => p.name) || [],
      website: data.website,
      metacritic: data.metacritic,
      platforms: data.platforms?.map((p: RawgPlatform) => p.platform.name) || [],
      released: data.released,
      rating: data.rating,
      ratings_count: data.ratings_count,
    }
  } catch (error) {
    console.error('Error fetching game details:', error)
    return null
  }
}