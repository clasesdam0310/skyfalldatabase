const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!
const BASE_URL = 'https://api.themoviedb.org/3'

export interface TmdbMovieSearchResult {
  id: number
  title: string
  poster_path: string | null
  release_date: string | null
  overview: string | null
  vote_average: number
  vote_count: number
}

export interface TmdbCast {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface TmdbCrew {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface TmdbCredits {
  cast: TmdbCast[]
  crew: TmdbCrew[]
}

export interface TmdbMovieDetails {
  id: number
  title: string
  overview: string | null
  poster_path: string | null
  backdrop_path: string | null
  release_date: string | null
  runtime: number | null
  genres: { id: number; name: string }[]
  vote_average: number
  vote_count: number
  credits?: TmdbCredits
}

export interface TmdbSearchResponse {
  page: number
  results: TmdbMovieSearchResult[]
  total_pages: number
  total_results: number
}

export async function searchTmdbMovies(query: string): Promise<TmdbMovieSearchResult[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES&page=1`
    )
    const data: TmdbSearchResponse = await res.json()
    return data.results || []
  } catch (error) {
    console.error('Error searching TMDB:', error)
    return []
  }
}

export async function getTmdbMovieDetails(id: string): Promise<TmdbMovieDetails | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=credits`
    )
    const data: TmdbMovieDetails = await res.json()
    return data
  } catch (error) {
    console.error('Error fetching TMDB movie details:', error)
    return null
  }
}

export function tmdbImageUrl(path: string | null, size: 'w185' | 'w500' | 'original' = 'w500'): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}