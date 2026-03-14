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
    in_progress:     'está jugando',
    on_hold:         'ha puesto en pausa',
    dropped:         'ha abandonado',
    plan_to_consume: 'ha marcado como pendiente',
    rewatching:      'está reviendo',
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

  // Prioridad 1: Estado
  if (status) {
    const isNew = !prevStatus
    return {
      eventType: status === 'rewatching' ? 'rewatched' : 'status_changed',
      action: isNew
        ? STATUS_ACTIONS[status] ?? `ha marcado como ${STATUS_LABELS[status]}`
        : `ha actualizado a ${STATUS_LABELS[status]}`,
    }
  }

  // Prioridad 2: Nota
  if (scoreChanged && score !== null) {
    return {
      eventType: 'rated',
      action: prevScore ? 'ha actualizado la nota' : 'ha puntuado',
    }
  }

  // Fallback
  return {
    eventType: 'rated',
    action: STATUS_ACTIONS[status] ?? 'ha actualizado',
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

    if (ratingError) throw new Error(ratingError.message)

    // 3. Determinar acción — un solo evento
    const { eventType, action } = buildFeedAction(
      status,
      score,
      review ?? '',
      prevRating?.status ?? null,
      prevRating?.score ?? null,
      prevRating?.review ?? null,
    )

    // 4. Payload
    const payload: { [key: string]: string | number | boolean | null } = {
      score,
      status,
      action,
    }
    if (review?.trim().length > 0) {
      payload.review            = review.trim()
      payload.review_is_spoiler = review_is_spoiler
    }

    // 5. Insert feed event — atómico en el servidor
    const { error: feedError } = await supabaseAdmin
      .from('feed_events')
      .insert({
        user_id:    currentUserId,
        media_id,
        event_type: eventType,
        payload:    payload as never,
      })

    if (feedError) {
      console.warn('Feed event insert failed:', feedError.message)
    }

    return NextResponse.json({ ok: true })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}