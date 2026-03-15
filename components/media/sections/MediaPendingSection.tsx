'use client'

interface MediaPendingSectionProps {
  pendingUsers: Array<{ id: string; username: string } | null>
}

export default function MediaPendingSection({ pendingUsers }: MediaPendingSectionProps) {
  if (pendingUsers.length === 0) return null

  return (
    <section>
      <div className="flex gap-2 flex-wrap">
        {pendingUsers.map((user) => user && (
          <span key={user.id} className="crystal-panel px-2 py-1 rounded-full text-xs text-white/40">
            ⏳ {user.username} tiene esto pendiente
          </span>
        ))}
      </div>
    </section>
  )
}