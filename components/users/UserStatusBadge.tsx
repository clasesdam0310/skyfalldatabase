'use client'

const STATUS_LABELS: Record<string, string> = {
  completed:       'Completado',
  in_progress:     'En progreso',
  on_hold:         'En pausa',
  dropped:         'Abandonado',
  plan_to_consume: 'Pendiente',
  rewatching:      'Reviendo',
}

const STATUS_COLORS: Record<string, string> = {
  completed:       '#103882',
  in_progress:     '#22c55e',
  on_hold:         '#f59e0b',
  dropped:         '#FA4D5F',
  plan_to_consume: 'rgba(255,255,255,0.2)',
  rewatching:      '#8b5cf6',
}

interface UserStatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export default function UserStatusBadge({ status, size = 'md' }: UserStatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[8px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'
  
  return (
    <span className={`${sizeClass} rounded-full transition-all group-hover:scale-105`}
      style={{
        background: `${STATUS_COLORS[status]}20`,
        color: STATUS_COLORS[status],
      }}>
      {STATUS_LABELS[status]}
    </span>
  )
}