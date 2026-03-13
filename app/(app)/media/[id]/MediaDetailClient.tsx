'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Instancia del cliente de Supabase
import { supabaseBrowser } from '@/lib/supabase/client'

const supabase = supabaseBrowser

type MediaItem = {
  id: string
  title: string
  type: string
  cover_image: string | null
  banner_image: string | null
  description: string | null
  year: number | null
  genres: string[] | null
  creator: string | null
  duration_label: string | null
  episodes: number | null
  chapters: number | null
}

type Rating = {
  id: string
  user_id: string
  score: number | null
  status: string | null
  review: string | null
  review_is_spoiler: boolean | null
  users: { id: string; username: string; avatar_url: string | null } | null
}

type User = {
  id: string
  username: string
  avatar_url: string | null
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completado',
  in_progress: 'En progreso',
  on_hold: 'En pausa',
  dropped: 'Abandonado',
  plan_to_consume: 'Pendiente',
  rewatching: 'Reviendo',
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#103882',
  in_progress: '#22c55e',
  on_hold: '#f59e0b',
  dropped: '#FA4D5F',
  plan_to_consume: 'rgba(255,255,255,0.2)',
  rewatching: '#8b5cf6',
}

const TYPE_ICONS: Record<string, string> = {
  game: '⊞',
  film: '▶',
  anime: '⊡',
  manga: '≡',
  vn: '◇',
}

export default function MediaDetailClient({
  media,
  ratings,
  allUsers,
  currentUserId,
}: {
  media: MediaItem
  ratings: Rating[]
  allUsers: User[]
  currentUserId: string
  currentUsername: string
}) {
  const router = useRouter()
  const myRating = ratings.find((r) => r.user_id === currentUserId)

  const [score, setScore] = useState<number | null>(myRating?.score ?? null)
  const [status, setStatus] = useState<string>(myRating?.status ?? '')
  const [review, setReview] = useState(myRating?.review ?? '')
  const [isSpoiler, setIsSpoiler] = useState(myRating?.review_is_spoiler ?? false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const scores = ratings.map((r) => r.score).filter((s): s is number => s !== null)
  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : null

 async function handleSave() {
  if (!currentUserId) {
    alert("Debes estar logueado para valorar.")
    return
  }
  if (!status && score === null) return

  setSaving(true)

  try {
    // 1. Upsert rating
    const ratingPayload = {
      user_id:           currentUserId,
      media_id:          media.id,
      score:             score,
      status:            status || null,
      review:            review || null,
      review_is_spoiler: isSpoiler,
    }

    const { error: ratingError } = await supabase
      .from('ratings')
      .upsert(ratingPayload, { onConflict: 'user_id,media_id' })

    if (ratingError) throw new Error(ratingError.message)

    // 2. Determine event type
    const prevRating = myRating
    let eventType = 'rated'
    if (prevRating?.status && status !== prevRating.status) eventType = 'status_changed'
    if (review && review !== prevRating?.review) eventType = 'reviewed'
    if (status === 'rewatching') eventType = 'rewatched'

    // 3. Insert feed_event
    const { error: feedError } = await supabase
      .from('feed_events')
      .insert({
        user_id:    currentUserId,
        media_id:   media.id,
        event_type: eventType,
        payload:    { score, status },
      })

    if (feedError) {
      console.warn("Feed event insert failed (non-blocking):", feedError.message)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error("Error capturado:", message)
    alert(`No se pudo guardar: ${message}`)
  } finally {
    setSaving(false)
  }
}

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* HERO SECTION */}
      <div className="relative w-full h-[400px]">
        {media.banner_image || media.cover_image ? (
          <Image
            src={media.banner_image || media.cover_image!}
            alt={media.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sky-blue/20">
            <span className="text-8xl opacity-20">{TYPE_ICONS[media.type]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-blue text-white">
              {TYPE_ICONS[media.type]} {media.type.toUpperCase()}
            </span>
            {media.year && (
              <span className="text-xs text-white/50">{media.year}</span>
            )}
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">
            {media.title}
          </h1>
          {media.creator && (
            <p className="text-sm text-white/50">{media.creator}</p>
          )}
        </div>

        {avgScore !== null && (
          <div className="absolute top-6 right-8 text-center">
            <p className="text-4xl font-black text-fall-red">
              {avgScore.toFixed(1)}
            </p>
            <p className="text-xs text-white/40">SkyFall Avg</p>
            <p className="text-xs text-white/30">
              {scores.length} voto{scores.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <div className="px-8 py-8 space-y-10">
        {/* USERS SECTION */}
        <section>
          <h2 className="text-xs tracking-[0.2em] uppercase font-semibold mb-4 text-white/30">
            SkyFallUsers
          </h2>
          <div className="flex gap-4 flex-wrap">
            {allUsers.map((user) => {
              const userRating = ratings.find((r) => r.user_id === user.id)
              const hasInteracted = !!userRating
              return (
                <div key={user.id} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all overflow-hidden border-2 ${
                      hasInteracted ? 'bg-sky-blue border-sky-blue' : 'bg-white/5 border-white/10 opacity-40'
                    }`}>
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                      ) : (
                        user.username[0].toUpperCase()
                      )}
                    </div>
                    {userRating?.score && (
                      <div className="absolute -bottom-1 -right-1 rounded-full px-1 text-[10px] font-bold bg-fall-red text-white">
                        {userRating.score}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/40">{user.username}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* RATING FORM */}
        <section className="max-w-2xl">
          <h2 className="text-xs tracking-[0.2em] uppercase font-semibold mb-6 text-white/30">
            Mi valoración
          </h2>

          <div className="flex gap-1 mb-6">
            {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((val) => (
              <button key={val} onClick={() => setScore(score === val ? null : val)}
                className="text-2xl transition-all hover:scale-110"
                style={{ color: score !== null && score >= val ? '#FA4D5F' : 'rgba(255,255,255,0.15)' }}>
                {val % 1 === 0.5 ? '½' : '★'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => setStatus(status === key ? '' : key)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{
                  background: status === key ? STATUS_COLORS[key] : 'transparent',
                  borderColor: status === key ? STATUS_COLORS[key] : 'rgba(255,255,255,0.1)',
                  color: status === key ? 'white' : 'rgba(255,255,255,0.5)'
                }}>
                {label}
              </button>
            ))}
          </div>

          <textarea
            placeholder="¿Qué te ha parecido?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm mb-4 outline-none focus:border-sky-blue transition-all resize-none"
            rows={4}
          />

          <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setIsSpoiler(!isSpoiler)}>
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSpoiler ? 'bg-fall-red border-fall-red' : 'border-white/20'}`}>
              {isSpoiler && <span className="text-[10px]">✓</span>}
            </div>
            <span className="text-xs text-white/40">Contiene spoilers</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || (!status && score === null)}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 ${
              saved ? 'bg-green-500' : 'bg-sky-blue'
            }`}>
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar valoración'}
          </button>
        </section>
      </div>
    </div>
  )
}