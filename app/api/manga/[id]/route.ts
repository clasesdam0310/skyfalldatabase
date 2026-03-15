// app/api/manga/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getMangaDetails } from '@/lib/api/manga'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  console.log('🔍 API Route - Detalles Manga ID:', id)

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const idNum = parseInt(id)
  if (isNaN(idNum)) {
    return NextResponse.json({ error: 'ID debe ser un número' }, { status: 400 })
  }

  try {
    const details = await getMangaDetails(id)
    if (!details) {
      return NextResponse.json({ error: 'Manga no encontrado' }, { status: 404 })
    }
    return NextResponse.json(details)
  } catch (error) {
    console.error('❌ API Route - Error:', error)
    return NextResponse.json({ error: 'Failed to fetch manga details' }, { status: 500 })
  }
}