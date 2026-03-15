import { NextRequest, NextResponse } from 'next/server'
import { searchTmdbMovies, tmdbImageUrl } from '@/lib/api/tmdb'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const movies = await searchTmdbMovies(q)
    const results = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_url: tmdbImageUrl(movie.poster_path, 'w185'),
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      overview: movie.overview,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('TMDB search error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}