'use client'

import { useRouter } from 'next/navigation'
import UserAvatar from '@/components/users/UserAvatar'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import type { Rating, User } from '@/types/local' // Definiremos estos tipos en un archivo compartido o los importamos de MediaDetailClient

interface MediaUsersSectionProps {
  allUsers: User[]
  ratings: Rating[]
  mediaType: string
  pendingUsers: Array<{ id: string; username: string } | null>
}

export default function MediaUsersSection({
  allUsers,
  ratings,
  mediaType,
  pendingUsers,
}: MediaUsersSectionProps) {
  const router = useRouter()

  return (
    <>
      {/* SKYFALL USERS */}
      <section>
        <h2 className="text-xs tracking-[0.2em] uppercase font-semibold mb-3 text-white/30">
          SKYFALL USERS
        </h2>
        <div className="flex gap-3 flex-wrap">
          {allUsers.map((user) => {
            const userRating = ratings.find((r) => r.user_id === user.id)
            const hasInteracted = !!userRating
            return (
              <div
                key={user.id}
                className="flex flex-col items-center gap-1 group cursor-pointer"
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
                <p className="text-xs transition-colors group-hover:text-white/60 text-white/40">
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
            )
          })}
        </div>
      </section>

      {/* PENDIENTES */}
      {pendingUsers.length > 0 && (
        <section>
          <div className="flex gap-2 flex-wrap">
            {pendingUsers.map((user) => user && (
              <span key={user.id} className="crystal-panel px-2 py-1 rounded-full text-xs text-white/40">
                ⏳ {user.username} tiene esto pendiente
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  )
}