import { NextRequest, NextResponse } from 'next/server'
import { getIgdbGame, getIgdbCharactersByGame, igdbImageUrl } from '@/lib/api/igdb'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const [game, characters] = await Promise.all([
      getIgdbGame(id),
      getIgdbCharactersByGame(id),
    ])

    if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const developer = game.involved_companies
      ?.find((c) => c.developer)?.company.name ?? null

    const mappedCharacters = characters.map((char) => ({
      id: String(char.id),
      name: char.name,
      description: char.description ?? null,
      image_url: char.mug_shot?.url
        ? igdbImageUrl(char.mug_shot.url, 't_cover_big')
        : null,
      role: 'Personaje',
    }))

    return NextResponse.json({
      id: game.id,
      name: game.name,
      summary: game.summary ?? null,
      cover_url: game.cover?.url
        ? igdbImageUrl(game.cover.url, 't_720p')
        : null,
      year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null,
      genres: game.genres?.map((g) => g.name) ?? [],
      developer,
      characters: mappedCharacters,
    })
  } catch (error) {
    console.error('IGDB game error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}