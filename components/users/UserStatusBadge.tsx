'use client'

import { getStatusVerb, type MediaType } from '@/lib/utils/statusVerbs'

const STATUS_COLORS: Record<string, string> = {
  completed: '#00d4ff',
  in_progress: '#00d4ff',
  on_hold: '#00d4ff',
  dropped: '#ff6eb4',
  plan_to_consume: '#00d4ff',
  rewatching: '#ff8c42',
}

interface UserStatusBadgeProps {
  status: string
  mediaType: string
  size?: 'sm' | 'md'
}

export default function UserStatusBadge({ status, mediaType, size = 'md' }: UserStatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[8px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'
  const verb = getStatusVerb(mediaType as MediaType, status)
  
  return (
    <span className={`${sizeClass} rounded-full transition-all group-hover:scale-105`}
      style={{
        background: `${STATUS_COLORS[status]}20`,
        color: STATUS_COLORS[status],
      }}>
      {verb}
    </span>
  )
}