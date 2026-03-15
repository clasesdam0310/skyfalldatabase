import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'

function buildFeedAction(
  status: string,
  score: number | null,
  review: string,
  prevStatus: string | null,
  prevScore: number | null,
  prevReview: string | null,
): { eventType: string; action: string } {
  const STATUS_ACTIONS: Record<string, string> = {
    completed:       'ha completado',
    in_progress:     'está jugando/viendo/leyendo',
    on_hold:         'ha puesto en pausa',
    dropped:         'ha abandonado',
    plan_to_consume: 'ha marcado como pendiente',
    rewatching:      'está reviendo/releyendo',
  }
  const STATUS_LABELS: Record<string, string> = {
    completed:       'completado',
    in_progress:     'en progreso',
    on_hold:         'en pausa',
    dropped:         'abandonado',
    plan_to_consume: 'pendiente',
    rewatching:      'reviendo',
  }

  const statusChanged = status !== (prevStatus ?? '')
  const scoreChanged  = score !== prevScore
  const reviewChanged = review !== (prevReview ?? '')

  // Prioridad 1: Review nueva o editada
  if (review && reviewChanged) {
    return {
      eventType: 'reviewed',
      action: prevReview ? 'ha editado su reseña' : 'ha escrito una reseña',
    }
  }

  // Prioridad 2: Estado
  if (status) {
    const isNew = !prevStatus
    return {
      eventType: status === 'rewatching' ? 'rewatched' : 'status_changed',
      action: isNew
        ? STATUS_ACTIONS[status] ?? `ha marcado como ${STATUS_LABELS[status]}`
        : `ha actualizado a ${STATUS_LABELS[status]}`,
    }
  }

  // Prioridad 3: Nota
  if (scoreChanged && score !== null) {
    return {
      eventType: 'rated',
      action: prevScore ? 'ha actualizado la nota' : 'ha puntuado',
    }
  }

  // Fallback
  return {
    eventType: 'updated',
    action: 'ha actualizado',
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const body = await req.json()
    const { media_id, score, status, review, review_is_spoiler } = body

    // Validar que media_id existe
    if (!media_id) {
      return NextResponse.json({ error: 'media_id requerido' }, { status: 400 })
    }

    // Obtener información del media para el payload
    const { data: mediaData } = await supabaseAdmin
      .from('media_items')
      .select('title, type')
      .eq('id', media_id)
      .single()

    // 1. Obtener rating anterior para comparar
    const { data: prevRating } = await supabaseAdmin
      .from('ratings')
      .select('score, status, review')
      .eq('user_id', currentUserId)
      .eq('media_id', media_id)
      .single()

    // 2. Upsert rating
    const { error: ratingError } = await supabaseAdmin
      .from('ratings')
      .upsert({
        user_id:           currentUserId,
        media_id,
        score,
        status,
        review:            review?.trim() || null,
        review_is_spoiler,
      }, { onConflict: 'user_id,media_id' })

    if (ratingError) {
      console.error('Error upserting rating:', ratingError)
      throw new Error(ratingError.message)
    }

    // 3. Determinar acción
    const { eventType, action } = buildFeedAction(
      status,
      score,
      review ?? '',
      prevRating?.status ?? null,
      prevRating?.score ?? null,
      prevRating?.review ?? null,
    )

    // 4. Construir payload completo
    const payload: { [key: string]: string | number | boolean | null } = {
      score,
      status,
      action,
      mediaType: mediaData?.type || null,
      mediaTitle: mediaData?.title || null,
    }
    
    if (review?.trim().length > 0) {
      payload.review = review.trim()
      payload.review_is_spoiler = review_is_spoiler
    }

    // 5. Insert feed event
    const { error: feedError } = await supabaseAdmin
      .from('feed_events')
      .insert({
        user_id:    currentUserId,
        media_id,
        event_type: eventType,
        payload:    payload as never,
      })

    if (feedError) {
      console.error('Feed event insert failed:', feedError.message)
      // No lanzamos error porque el rating ya se guardó
    } else {
      console.log('✅ Feed event created:', eventType, action)
    }

    return NextResponse.json({ ok: true })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error en ratings/save:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}