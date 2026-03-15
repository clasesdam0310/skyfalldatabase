// app/api/anilist/anime/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAnimeDetails } from '@/lib/api/anilist'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // En Next.js 15, params es una Promise que debemos resolver
  const { id } = await params

  console.log('🔍 API Route - Detalles AniList ID recibido:', id)

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  // Validar que sea un número
  const idNum = parseInt(id)
  if (isNaN(idNum)) {
    return NextResponse.json({ error: 'ID debe ser un número' }, { status: 400 })
  }

  try {
    console.log('📤 Llamando a getAnimeDetails con ID:', idNum)
    const details = await getAnimeDetails(id)
    
    if (!details) {
      console.log('❌ No se encontraron detalles para el ID:', idNum)
      return NextResponse.json({ error: 'Anime no encontrado' }, { status: 404 })
    }
    
    console.log('✅ API Route - Detalles obtenidos correctamente')
    return NextResponse.json(details)
  } catch (error) {
    console.error('❌ API Route - Error:', error)
    return NextResponse.json({ error: 'Failed to fetch anime details' }, { status: 500 })
  }
}