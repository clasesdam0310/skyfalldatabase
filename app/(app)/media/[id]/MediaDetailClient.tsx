'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import StarRating from '@/components/media/StarRating'
import ReviewSection from '@/components/media/ReviewSection'
import UserAvatar from '@/components/users/UserAvatar'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import UniverseSection from '@/components/media/UniverseSection'
import type { Character } from '@/components/media/CharacterScroll'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants/status'
import { TYPE_ICONS, TYPE_COLORS, EMOJIS } from '@/lib/constants/media'
import { buildFeedAction } from '@/lib/utils/feed'
import type { GameDetails } from '@/lib/api/rawg'

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
  api_id: string | null
}

type Rating = {
  id: string
  user_id: string
  score: number | null
  status: string | null
  review: string | null
  review_is_spoiler: boolean | null
  created_at: string | null
  users: { id: string; username: string; avatar_url: string | null } | null
}

type User = {
  id: string
  username: string
  avatar_url: string | null
}

type Reaction = {
  emoji: string
  count: number
  user_reacted: boolean
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
  const isSavingRef = useRef(false)

  const [score, setScore]         = useState<number | null>(myRating?.score ?? null)
  const [status, setStatus]       = useState<string>(myRating?.status ?? '')
  const [review, setReview]       = useState(myRating?.review ?? '')
  const [isSpoiler, setIsSpoiler] = useState(myRating?.review_is_spoiler ?? false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  
  // Estados para personajes
  const [characters, setCharacters] = useState<Character[]>([])
  const [loadingCharacters, setLoadingCharacters] = useState(true)

  // Estados para datos de RAWG
  const [rawgData, setRawgData] = useState<GameDetails | null>(null)
  const [loadingRawg, setLoadingRawg] = useState(false)

  const scores = ratings.map((r) => r.score).filter((s): s is number => s !== null)
  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : null

  const canSave = status.trim().length > 0

  // Sincronizar con myRating cuando cambien los ratings
  useEffect(() => {
    setScore(myRating?.score ?? null)
    setStatus(myRating?.status ?? '')
    setReview(myRating?.review ?? '')
    setIsSpoiler(myRating?.review_is_spoiler ?? false)
  }, [myRating])

  // Cargar reacciones para cada review
  useEffect(() => {
    async function loadReactions() {
      const reviewsWithReactions = ratings.filter(r => r.review)
      
      const initialReactions: Record<string, Reaction[]> = {}
      reviewsWithReactions.forEach(review => {
        initialReactions[review.id] = EMOJIS.map(emoji => ({
          emoji,
          count: 0,
          user_reacted: false
        }))
      })
      setReactions(initialReactions)
      
      for (const review of reviewsWithReactions) {
        const { data: reactionData } = await supabase
          .from('reactions')
          .select('emoji, user_id')
          .eq('target_type', 'review')
          .eq('target_id', review.id)

        if (reactionData && reactionData.length > 0) {
          const counts: Record<string, number> = {}
          reactionData.forEach(r => {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1
          })

          const userReactions = new Set(
            reactionData.filter(r => r.user_id === currentUserId).map(r => r.emoji)
          )

          const reviewReactions = EMOJIS.map(emoji => ({
            emoji,
            count: counts[emoji] || 0,
            user_reacted: userReactions.has(emoji)
          }))

          setReactions(prev => ({
            ...prev,
            [review.id]: reviewReactions
          }))
        }
      }
    }

    if (currentUserId) {
      loadReactions()
    }
  }, [ratings, currentUserId])

  // Cargar personajes destacados
  useEffect(() => {
    async function loadCharacters() {
      if (!media?.id) return
      setLoadingCharacters(true)

      const { data: characterMedia, error: relError } = await supabase
        .from('character_media')
        .select('character_id, role')
        .eq('media_id', media.id)

      if (relError || !characterMedia?.length) {
        setLoadingCharacters(false)
        return
      }

      const characterIds = characterMedia.map(cm => cm.character_id)
      const { data: charsData, error: charsError } = await supabase
        .from('characters')
        .select('id, name, image_url, lore')
        .in('id', characterIds)

      if (charsError || !charsData) {
        setLoadingCharacters(false)
        return
      }

      const enriched = charsData.map(char => ({
        ...char,
        role: characterMedia.find(cm => cm.character_id === char.id)?.role || 'Personaje'
      }))

      setCharacters(enriched)
      setLoadingCharacters(false)
    }

    loadCharacters()
  }, [media?.id])

  // Cargar datos adicionales de IGDB (solo para juegos)
useEffect(() => {
  async function loadIgdbData() {
    if (media.type !== 'game') {
      setLoadingRawg(false)
      return
    }

    setLoadingRawg(true)
    try {
      // Buscar en IGDB por nombre del juego
      const searchRes = await fetch(`/api/igdb/search?q=${encodeURIComponent(media.title)}`)
      if (!searchRes.ok) throw new Error('Error searching IGDB')
      const searchData = await searchRes.json()

      // Tomar el primer resultado que coincida exactamente o el primero
      const results = searchData.results ?? []
      const match = results.find(
        (g: { name: string }) => g.name.toLowerCase() === media.title.toLowerCase()
      ) ?? results[0]

      if (!match) {
        setLoadingRawg(false)
        return
      }

      // Obtener detalles completos con personajes
      const detailRes = await fetch(`/api/igdb/game/${match.id}`)
      if (!detailRes.ok) throw new Error('Error fetching IGDB details')
      const data = await detailRes.json()

      setRawgData({
        description: data.summary ?? null,
        developers: data.developer ? [data.developer] : [],
        publishers: [],
        website: '',
        metacritic: null,
        platforms: [],
        released: data.year ? String(data.year) : null,
        rating: 0,
        ratings_count: 0,
      })

      if (data.characters?.length > 0) {
        setCharacters(data.characters)
      }

    } catch (error) {
      console.error('Error cargando datos de IGDB:', error)
      setRawgData(null)
    } finally {
      setLoadingRawg(false)
    }
  }

  loadIgdbData()
}, [media.type, media.title])

  async function handleReaction(reviewId: string, emoji: string) {
    if (!currentUserId) return

    const currentReactions = reactions[reviewId] || []
    const targetReaction = currentReactions.find(r => r.emoji === emoji)
    const userReacted = targetReaction?.user_reacted || false

    if (userReacted) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('target_type', 'review')
        .eq('target_id', reviewId)
        .eq('user_id', currentUserId)
        .eq('emoji', emoji)

      if (!error) {
        setReactions(prev => ({
          ...prev,
          [reviewId]: prev[reviewId].map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count - 1, user_reacted: false }
              : r
          )
        }))
      }
    } else {
      const { error } = await supabase
        .from('reactions')
        .insert({
          target_type: 'review',
          target_id: reviewId,
          user_id: currentUserId,
          emoji: emoji
        })

      if (!error) {
        setReactions(prev => ({
          ...prev,
          [reviewId]: prev[reviewId].map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count + 1, user_reacted: true }
              : r
          )
        }))
      }
    }
  }

  async function handleSave() {
    if (!currentUserId || !canSave || isSavingRef.current) return
    isSavingRef.current = true
    setSaving(true)

    try {
      const res = await fetch('/api/ratings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id:          media.id,
          score,
          status,
          review:            review.trim() || null,
          review_is_spoiler: isSpoiler,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      
      setReview('')
      setIsSpoiler(false)
      
      router.refresh()

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      alert(`No se pudo guardar: ${message}`)
    } finally {
      setSaving(false)
      isSavingRef.current = false
    }
  }

  async function handleDeleteReview() {
    if (!currentUserId || !myRating?.review || isSavingRef.current) return
    
    if (!confirm('¿Estás seguro de que quieres eliminar tu reseña? Esta acción no se puede deshacer.')) {
      return
    }

    isSavingRef.current = true
    setSaving(true)

    try {
      const { error: ratingError } = await supabase
        .from('ratings')
        .update({
          review: null,
          review_is_spoiler: false
        })
        .eq('user_id', currentUserId)
        .eq('media_id', media.id)

      if (ratingError) throw new Error(ratingError.message)

      await supabase
        .from('feed_events')
        .insert({
          user_id: currentUserId,
          media_id: media.id,
          event_type: 'review_deleted',
          payload: { action: 'ha eliminado su reseña' }
        })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      
      setReview('')
      setIsSpoiler(false)
      
      router.refresh()

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      alert(`No se pudo eliminar: ${message}`)
    } finally {
      setSaving(false)
      isSavingRef.current = false
    }
  }

  const pendingUsers = ratings
    .filter((r) => r.status === 'plan_to_consume')
    .map((r) => r.users)
    .filter(Boolean)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050507' }}>

      {/* HERO SECTION */}
      <div className="relative w-full" style={{ height: '400px' }}>
        {media.banner_image || media.cover_image ? (
          <Image
            src={media.banner_image || media.cover_image!}
            alt={media.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'rgba(16,56,130,0.2)' }}>
            <span className="text-8xl opacity-20">{TYPE_ICONS[media.type]}</span>
          </div>
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #050507 0%, rgba(5,5,7,0.6) 50%, transparent 100%)' }} />

        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: '#103882', color: '#ffffff' }}>
              {TYPE_ICONS[media.type]} {media.type.toUpperCase()}
            </span>
            {media.year && (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {media.year}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">
            {media.title}
          </h1>
          {media.creator && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {media.creator}
            </p>
          )}
        </div>

        {/* AVG RATING */}
        {avgScore !== null && (
          <div className="absolute bottom-8 right-8 text-right">
            <div className="flex items-end gap-3">
              <div className="text-right">
                <p className="text-xs font-mono tracking-wider text-white/30 mb-1">SKYFALL AVG</p>
                <div className="flex items-center gap-2">
                  <span className="text-5xl font-black text-[#FA4D5F] tabular-nums">
                    {avgScore.toFixed(1)}
                  </span>
                  <span className="text-2xl text-[#FA4D5F]/50">★</span>
                </div>
              </div>
              <div className="h-12 w-px bg-white/10 mx-2" />
              <div className="text-left">
                <p className="text-xs font-mono text-white/30 mb-1">VOTOS</p>
                <p className="text-2xl font-bold text-white/60 tabular-nums">
                  {scores.length}
                </p>
              </div>
            </div>
            <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-[#FA4D5F]/20 to-transparent" />
          </div>
        )}
      </div>

      <div className="px-8 py-8 space-y-10">

        {/* 1. UNIVERSO DE LA OBRA - AHORA PRIMERO */}
        <UniverseSection
          description={rawgData?.description || media.description}
          creator={rawgData?.developers?.[0] || media.creator}
          mediaType={media.type}
          characters={characters}
          typeIcons={TYPE_ICONS}
          typeColors={TYPE_COLORS}
          isLoading={loadingRawg}
        />

        {/* 2. SKYFALL USERS */}
        <section>
          <h2 className="text-xs tracking-[0.2em] uppercase font-semibold mb-4"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            SkyFallUsers
          </h2>
          <div className="flex gap-4 flex-wrap">
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
                    size="md"
                    hasInteracted={hasInteracted}
                    score={userRating?.score}
                    isRewatching={userRating?.status === 'rewatching'}
                  />
                  <p className="text-xs transition-colors group-hover:text-white/60"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {user.username}
                  </p>
                  {userRating?.status && (
                    <UserStatusBadge status={userRating.status} size="sm" />
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. PENDIENTES */}
        {pendingUsers.length > 0 && (
          <section>
            <div className="flex gap-2 flex-wrap">
              {pendingUsers.map((user) => user && (
                <span key={user.id} className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  ⏳ {user.username} tiene esto pendiente
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 4. MI VALORACIÓN */}
        <section className="max-w-2xl">
          <h2 className="text-xs tracking-[0.2em] uppercase font-semibold mb-6"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Mi valoración
          </h2>

          <div className="mb-6">
            <StarRating value={score} onChange={setScore} />
          </div>

          <div className="flex gap-2 flex-wrap mb-2">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatus(status === key ? '' : key)}
                className="text-xs px-3 py-1.5 rounded-full transition-all border hover:scale-105"
                style={{
                  background: status === key ? STATUS_COLORS[key] : 'transparent',
                  borderColor: status === key ? STATUS_COLORS[key] : 'rgba(255,255,255,0.1)',
                  color: status === key ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {!canSave && (
            <p className="text-xs mb-4" style={{ color: 'rgba(250,77,95,0.7)' }}>
              Selecciona un estado para guardar
            </p>
          )}
          {canSave && <div className="mb-4" />}

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-white/30">
                {myRating?.review ? '✏️ Editando tu reseña' : '📝 Escribe una reseña (opcional)'}
              </span>
              {myRating?.review && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#103882]/20 text-[#103882] border border-[#103882]/30">
                  Ya tienes una reseña
                </span>
              )}
            </div>
            
            <textarea
              placeholder={myRating?.review ? "Edita tu reseña..." : "¿Qué te ha parecido? (opcional)"}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none transition-all mb-2 hover:ring-1 hover:ring-white/10 focus:ring-1 focus:ring-[#103882]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: myRating?.review ? '1px solid rgba(16,56,130,0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          <div
            className="flex items-center gap-2 mb-6 cursor-pointer group"
            onClick={() => setIsSpoiler(!isSpoiler)}
          >
            <div className="w-4 h-4 rounded border flex items-center justify-center transition-all group-hover:scale-110"
              style={{
                border: `1px solid ${isSpoiler ? '#FA4D5F' : 'rgba(255,255,255,0.2)'}`,
                background: isSpoiler ? '#FA4D5F' : 'transparent',
              }}>
              {isSpoiler && <span className="text-white text-[10px]">✓</span>}
            </div>
            <span className="text-xs transition-colors group-hover:text-white/60" style={{ color: 'rgba(255,255,255,0.4)' }}>
              ⚠ Contiene spoilers
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="flex-1 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-30 hover:scale-105 hover:shadow-lg hover:shadow-[#103882]/20"
              style={{ background: saved ? '#22c55e' : '#103882' }}
            >
              {saving ? 'Guardando...' : saved ? '✓ Guardado' : myRating?.review ? 'Actualizar reseña' : 'Guardar valoración'}
            </button>

            {myRating?.review && (
              <button
                onClick={handleDeleteReview}
                disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-lg flex items-center gap-2"
                style={{ 
                  background: 'rgba(250,77,95,0.1)',
                  border: '1px solid rgba(250,77,95,0.3)',
                  color: '#FA4D5F'
                }}
                title="Eliminar reseña"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}
          </div>
        </section>

        {/* 5. REVIEWS DEL GRUPO */}
        <ReviewSection
          ratings={ratings}
          reactions={reactions}
          currentUserId={currentUserId}
          onReaction={handleReaction}
        />

      </div>
    </div>
  )
}