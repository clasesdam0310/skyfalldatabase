import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      api_id,
      api_source,
      type,
      title,
      cover_image,
      year,
      genres,
      creator,
    } = body

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('media_items')
      .select('id')
      .eq('api_id', api_id)
      .eq('api_source', api_source)
      .single()

    if (existing) {
      return NextResponse.json({ id: existing.id })
    }

    // Registrar nuevo
    const { data, error } = await supabaseAdmin
      .from('media_items')
      .insert({
        api_id,
        api_source,
        type,
        title,
        cover_image,
        year,
        genres,
        creator,
      })
      .select('id')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}