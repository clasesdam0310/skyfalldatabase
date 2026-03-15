export type MediaType = 'game' | 'film' | 'anime' | 'manga' | 'vn'

export function getStatusVerb(mediaType: MediaType, status: string): string {
  const verbMap: Record<MediaType, Record<string, string>> = {
    game: {
      completed: 'Completado',
      in_progress: 'Jugando',
      on_hold: 'En pausa',
      dropped: 'Abandonado',
      plan_to_consume: 'Pendiente',
      rewatching: 'Rejugando',
    },
    film: {
      completed: 'Vista',
      in_progress: 'Viendo',
      on_hold: 'En pausa',
      dropped: 'Abandonada',
      plan_to_consume: 'Pendiente',
      rewatching: 'Reviendo',
    },
    anime: {
      completed: 'Visto',
      in_progress: 'Viendo',
      on_hold: 'En pausa',
      dropped: 'Abandonado',
      plan_to_consume: 'Pendiente',
      rewatching: 'Reviendo',
    },
    manga: {
      completed: 'Leído',
      in_progress: 'Leyendo',
      on_hold: 'En pausa',
      dropped: 'Abandonado',
      plan_to_consume: 'Pendiente',
      rewatching: 'Releyendo',
    },
    vn: {
      completed: 'Leída',
      in_progress: 'Leyendo',
      on_hold: 'En pausa',
      dropped: 'Abandonada',
      plan_to_consume: 'Pendiente',
      rewatching: 'Releyendo',
    },
  }

  return verbMap[mediaType]?.[status] ?? status
}

export function getActionVerb(mediaType: MediaType, status: string, isNew: boolean): string {
  const baseVerb = getStatusVerb(mediaType, status).toLowerCase()
  
  if (isNew) {
    switch (mediaType) {
      case 'game': return `ha empezado a ${baseVerb}`
      case 'film':
      case 'anime': return `ha empezado a ${baseVerb}`
      case 'manga':
      case 'vn': return `ha empezado a ${baseVerb}`
      default: return `ha marcado como ${baseVerb}`
    }
  } else {
    switch (mediaType) {
      case 'game': return `ha actualizado a ${baseVerb}`
      case 'film':
      case 'anime': return `ha actualizado a ${baseVerb}`
      case 'manga':
      case 'vn': return `ha actualizado a ${baseVerb}`
      default: return `ha cambiado a ${baseVerb}`
    }
  }
}