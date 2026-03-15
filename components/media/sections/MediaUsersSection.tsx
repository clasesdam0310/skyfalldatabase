'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import UserAvatar from '@/components/users/UserAvatar'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import type { User, Rating } from '@/types/local'

interface MediaUsersSectionProps {
  allUsers: User[]
  ratings: Rating[]
  mediaType: string
}

export default function MediaUsersSection({ allUsers, ratings, mediaType }: MediaUsersSectionProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-6 border-t border-l border-white/5"
    >
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-xs font-display font-medium tracking-[0.2em] uppercase text-[#00d4ff]/70">
          USUARIOS
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-[#00d4ff]/20 to-transparent" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {allUsers.map((user) => {
          const userRating = ratings.find((r) => r.user_id === user.id)
          const hasInteracted = !!userRating
          return (
            <div 
              key={user.id} 
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onClick={() => router.push(`/profile/${user.username}`)}
            >
              <UserAvatar
                username={user.username}
                avatar_url={user.avatar_url}
                size="sm"
                hasInteracted={hasInteracted}
                score={userRating?.score}
                isRewatching={userRating?.status === 'rewatching'}
              />
              <div className="text-center">
                <p className="text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors truncate max-w-[80px]">
                  {user.username}
                </p>
                {userRating?.status && (
                  <UserStatusBadge 
                    status={userRating.status} 
                    mediaType={mediaType}
                    size="sm" 
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}