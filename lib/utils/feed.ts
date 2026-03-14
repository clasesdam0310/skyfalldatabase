import { STATUS_ACTIONS, STATUS_LABELS } from '@/lib/constants/status'

export function buildFeedAction(
  status: string,
  score: number | null,
  review: string,
  prevStatus: string | null,
  prevScore: number | null,
  prevReview: string | null,
): { eventType: string; action: string } {
  const statusChanged = status !== (prevStatus ?? '')
  const scoreChanged  = score !== prevScore
  const reviewChanged = review.trim() !== (prevReview ?? '').trim() && review.trim().length > 0

  if (reviewChanged) {
    const isNew = !prevReview || prevReview.trim().length === 0
    return {
      eventType: 'reviewed',
      action: isNew ? 'ha escrito una reseña' : 'ha actualizado su reseña',
    }
  }

  if (statusChanged && status) {
    const isNew = !prevStatus
    return {
      eventType: status === 'rewatching' ? 'rewatched' : 'status_changed',
      action: isNew
        ? STATUS_ACTIONS[status] ?? `ha marcado como ${STATUS_LABELS[status]?.toLowerCase()}`
        : `ha actualizado a ${STATUS_LABELS[status]?.toLowerCase()}`,
    }
  }

  if (scoreChanged && score !== null) {
    return {
      eventType: 'rated',
      action: prevScore ? 'ha actualizado la nota' : 'ha puntuado',
    }
  }

  return {
    eventType: 'rated',
    action: STATUS_ACTIONS[status] ?? 'ha actualizado',
  }
}