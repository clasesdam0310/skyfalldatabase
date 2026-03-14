'use client'

import Image from 'next/image'

interface UserAvatarProps {
  username: string
  avatar_url: string | null
  size?: 'sm' | 'md' | 'lg'
  hasInteracted?: boolean
  score?: number | null
  isRewatching?: boolean
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs', score: 'text-[8px]' },
  md: { container: 'w-12 h-12', text: 'text-sm', score: 'text-[10px]' },
  lg: { container: 'w-16 h-16', text: 'text-lg', score: 'text-xs' },
}

export default function UserAvatar({ 
  username, 
  avatar_url, 
  size = 'md',
  hasInteracted = false,
  score,
  isRewatching = false
}: UserAvatarProps) {
  return (
    <div className="relative group">
      {/* Efecto glow en hover */}
      <div className="absolute inset-0 rounded-full bg-[#103882] blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
      
      <div
        className={`relative ${sizeMap[size].container} rounded-full flex items-center justify-center
          ${sizeMap[size].text} font-bold text-white overflow-hidden transition-all duration-300 
          group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#103882] 
          group-hover:ring-offset-2 group-hover:ring-offset-[#050507]`}
        style={{
          background: hasInteracted ? '#103882' : 'rgba(255,255,255,0.05)',
          border: `2px solid ${hasInteracted ? '#103882' : 'rgba(255,255,255,0.08)'}`,
          opacity: hasInteracted ? 1 : 0.4,
        }}
      >
        {avatar_url ? (
          <Image 
            src={avatar_url} 
            alt={username} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 48px, 64px"
          />
        ) : (
          <span>{username[0].toUpperCase()}</span>
        )}
      </div>
      
      {score && (
        <div className={`absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 
          ${sizeMap[size].score} font-bold z-10 transition-all duration-300 group-hover:scale-110`}
          style={{ background: '#FA4D5F', color: '#fff' }}>
          {score}
        </div>
      )}
      
      {isRewatching && (
        <div className="absolute -top-1 -right-1 rounded-full w-4 h-4
          flex items-center justify-center text-xs transition-all duration-300 group-hover:scale-110"
          style={{ background: '#8b5cf6' }}>
          ↺
        </div>
      )}
    </div>
  )
}