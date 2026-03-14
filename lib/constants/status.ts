export const STATUS_LABELS: Record<string, string> = {
  completed:       'Completado',
  in_progress:     'En progreso',
  on_hold:         'En pausa',
  dropped:         'Abandonado',
  plan_to_consume: 'Pendiente',
  rewatching:      'Reviendo',
}

export const STATUS_ACTIONS: Record<string, string> = {
  completed:       'ha completado',
  in_progress:     'está jugando',
  on_hold:         'ha puesto en pausa',
  dropped:         'ha abandonado',
  plan_to_consume: 'ha marcado como pendiente',
  rewatching:      'está reviendo',
}

export const STATUS_COLORS: Record<string, string> = {
  completed:       '#103882',
  in_progress:     '#22c55e',
  on_hold:         '#f59e0b',
  dropped:         '#FA4D5F',
  plan_to_consume: 'rgba(255,255,255,0.2)',
  rewatching:      '#8b5cf6',
}