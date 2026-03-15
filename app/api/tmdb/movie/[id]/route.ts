import { NextRequest, NextResponse } from 'next/server'
import { getTmdbMovieDetails, tmdbImageUrl } from '@/lib/api/tmdb'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const movie = await getTmdbMovieDetails(id)
    if (!movie) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Buscar director en crew si existe
    const director = movie.credits?.crew?.find(person => person.job === 'Director')?.name ?? null

    // Mapear reparto
    const cast = (movie.credits?.cast ?? [])
      .filter(actor => actor.profile_path) // solo con foto
      .slice(0, 10) // limitar a 10
      .map(actor => ({
        id: String(actor.id),
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      }))

    return NextResponse.json({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_url: tmdbImageUrl(movie.poster_path, 'w500'),
      backdrop_url: tmdbImageUrl(movie.backdrop_path, 'original'),
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      runtime: movie.runtime,
      genres: movie.genres?.map(g => g.name) ?? [],
      director,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      cast,
    })
  } catch (error) {
    console.error('TMDB movie details error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}