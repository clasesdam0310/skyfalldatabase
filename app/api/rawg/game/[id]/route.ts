import { NextRequest, NextResponse } from 'next/server'
import { getGameDetails } from '@/lib/api/rawg'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  try {
    const gameData = await getGameDetails(id)
    
    if (!gameData) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(gameData)
  } catch (error) {
    console.error('Error in game details API:', error)
    return NextResponse.json(
      { error: 'Error fetching game data' },
      { status: 500 }
    )
  }
}