// app/api/anilist/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchAnime } from '@/lib/api/anilist'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get('q')

  console.log('🔍 API Route - Búsqueda AniList:', query)

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await searchAnime(query)
    console.log('✅ API Route - Resultados:', results.length)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('❌ API Route - Error:', error)
    return NextResponse.json({ error: 'Failed to search anime' }, { status: 500 })
  }
}