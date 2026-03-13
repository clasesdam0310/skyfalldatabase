const RAWG_BASE = 'https://api.rawg.io/api'
const RAWG_KEY = process.env.RAWG_API_KEY!

export type RawgGame = {
  id: number
  name: string
  background_image: string | null
  released: string | null
  rating: number
  ratings_count: number
  genres: { id: number; name: string }[]
  developers: { id: number; name: string }[]
  platforms: { platform: { id: number; name: string } }[]
  description_raw?: string
  playtime?: number
}

export async function searchGames(query: string): Promise<RawgGame[]> {
  const url = `${RAWG_BASE}/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=10&search_precise=true`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.results ?? []
}

export async function getGameById(id: number): Promise<RawgGame | null> {
  const url = `${RAWG_BASE}/games/${id}?key=${RAWG_KEY}`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return null
  return res.json()
}

export async function getPopularGames(): Promise<RawgGame[]> {
  const url = `${RAWG_BASE}/games?key=${RAWG_KEY}&ordering=-rating&page_size=20&metacritic=80,100`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.results ?? []
}