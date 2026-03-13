import { NextRequest, NextResponse } from 'next/server'
import { searchGames } from '@/lib/api/rawg'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  const results = await searchGames(q)
  return NextResponse.json({ results })
}