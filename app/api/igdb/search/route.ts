import { NextRequest, NextResponse } from 'next/server'
import { searchIgdbGames, igdbImageUrl } from '@/lib/api/igdb'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const games = await searchIgdbGames(q)
    const results = games.map((game) => ({
      id: game.id,
      name: game.name,
      cover_url: game.cover?.url
        ? igdbImageUrl(game.cover.url, 't_cover_big')
        : null,
      year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null,
      genres: game.genres?.map((g) => g.name) ?? [],
      developer: game.involved_companies
        ?.find((c) => c.developer)?.company.name ?? null,
      summary: game.summary ?? null,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('IGDB search error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}