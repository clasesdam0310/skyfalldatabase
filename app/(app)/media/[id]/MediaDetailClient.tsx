// app/(app)/media/[id]/MediaDetailClient.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabaseBrowser } from '@/lib/supabase/client'
import ReviewSection from '@/components/media/ReviewSection'
import UniverseSection from '@/components/media/UniverseSection'
import MediaHero from '@/components/media/sections/MediaHero'
import MediaUsersSection from '@/components/media/sections/MediaUsersSection'
import MediaRatingSectionWrapper from '@/components/media/sections/MediaRatingSectionWrapper'
import TechSpecs from '@/components/media/TechSpecs'
import { TYPE_ICONS, TYPE_COLORS } from '@/lib/constants/media'
import { useMediaData } from '@/hooks/useMediaData'
import { useReactions } from '@/hooks/useReactions'
import type { MediaItem, Rating, User, UserRating } from '@/types/local'

const supabase = supabaseBrowser

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

  const [score, setScore] = useState<number | null>(myRating?.score ?? null)
  const [status, setStatus] = useState<string>(myRating?.status ?? '')
  const [review, setReview] = useState(myRating?.review ?? '')
  const [isSpoiler, setIsSpoiler] = useState(myRating?.review_is_spoiler ?? false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Estado local para forzar actualización cuando lleguen datos externos
  const [externalDataReady, setExternalDataReady] = useState(false)

  const { igdbData, tmdbData, anilistData, mangaData, characters, loading: loadingExternal } = useMediaData({
    type: media.type,
    title: media.title,
    api_source: media.api_source,
    api_id: media.api_id,
  })

  // Efecto para detectar cuando los datos externos están listos
  useEffect(() => {
    if (media.type === 'anime' && anilistData) {
      console.log('✅ Datos de AniList (anime) recibidos')
      setExternalDataReady(true)
    } else if (media.type === 'manga' && mangaData) {
      console.log('✅ Datos de AniList (manga) recibidos:', mangaData)
      setExternalDataReady(true)
    } else if (media.type === 'game' && igdbData) {
      console.log('✅ Datos de IGDB recibidos')
      setExternalDataReady(true)
    } else if (media.type === 'film' && tmdbData) {
      console.log('✅ Datos de TMDB recibidos')
      setExternalDataReady(true)
    }
  }, [media.type, anilistData, mangaData, igdbData, tmdbData])

  const { reactions, loadReactions, handleReaction } = useReactions(ratings, currentUserId)

  const scores = ratings.map((r) => r.score).filter((s): s is number => s !== null)
  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : null

  // Sincronizar con myRating
  useEffect(() => {
    setScore(myRating?.score ?? null)
    setStatus(myRating?.status ?? '')
    setReview(myRating?.review ?? '')
    setIsSpoiler(myRating?.review_is_spoiler ?? false)
  }, [myRating])

  // Cargar reacciones
  useEffect(() => {
    if (currentUserId) {
      loadReactions()
    }
  }, [currentUserId, loadReactions])

  const handleSave = async ({ score, status, review, isSpoiler }: {
    score: number | null
    status: string
    review: string
    isSpoiler: boolean
  }) => {
    if (!currentUserId || !status || isSavingRef.current) return
    isSavingRef.current = true
    setSaving(true)
    try {
      const res = await fetch('/api/ratings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: media.id,
          score,
          status,
          review: review.trim() || null,
          review_is_spoiler: isSpoiler,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      alert(`No se pudo guardar: ${message}`)
    } finally {
      setSaving(false)
      isSavingRef.current = false
    }
  }

  const handleDeleteReview = async () => {
    if (!currentUserId || !myRating?.review || isSavingRef.current) return
    if (!confirm('¿Estás seguro de que quieres eliminar tu reseña? Esta acción no se puede deshacer.')) return
    isSavingRef.current = true
    setSaving(true)
    try {
      const { error: ratingError } = await supabase
        .from('ratings')
        .update({ review: null, review_is_spoiler: false })
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
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      alert(`No se pudo eliminar: ${message}`)
    } finally {
      setSaving(false)
      isSavingRef.current = false
    }
  }

  // Determinar descripción según el tipo de medio
  const universeDescription = 
    media.type === 'game' 
      ? igdbData?.summary || media.description
      : media.type === 'film'
      ? tmdbData?.overview || media.description
      : media.type === 'anime'
      ? anilistData?.description || media.description
      : media.type === 'manga'
      ? mangaData?.description || media.description
      : media.description

  // Determinar creador según el tipo de medio
  const universeCreator = 
    media.type === 'game'
      ? igdbData?.developer || media.creator
      : media.type === 'film'
      ? tmdbData?.director || media.creator
      : media.type === 'anime'
      ? anilistData?.studios?.[0] || media.creator
      : media.type === 'manga'
      ? mangaData?.authors?.[0] || media.creator
      : media.creator

  // Determinar duración según el tipo de medio (siempre número o null)
  const durationValue = 
    media.type === 'film'
      ? tmdbData?.runtime ?? null
      : media.type === 'anime'
      ? anilistData?.episodes ?? null
      : media.type === 'manga'
      ? mangaData?.chapters ?? null
      : null

  const userRating: UserRating | null = myRating ? {
    score: myRating.score,
    status: myRating.status || '',
    review: myRating.review || '',
    review_is_spoiler: myRating.review_is_spoiler || false,
  } : null

  const techSpecsProps = {
    mediaType: media.type,
    creator: universeCreator,
    year: media.year,
    genres: media.genres,
    duration: durationValue,
  }

  // Determinar si estamos cargando
  const isLoading = loadingExternal || 
    (media.type === 'anime' && !externalDataReady && anilistData === null) ||
    (media.type === 'manga' && !externalDataReady && mangaData === null)

  return (
    <div className="min-h-screen">
      <MediaHero media={media} avgScore={avgScore} scoresLength={scores.length} />

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna izquierda - 8/12 con animación */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 space-y-8"
          >
            <UniverseSection
              description={universeDescription}
              creator={universeCreator}
              mediaType={media.type}
              characters={characters}
              typeIcons={TYPE_ICONS}
              typeColors={TYPE_COLORS}
              isLoading={isLoading}
            />
            
            <ReviewSection
              ratings={ratings}
              mediaType={media.type}
              reactions={reactions}
              currentUserId={currentUserId}
              onReaction={handleReaction}
            />
          </motion.div>

          {/* Columna derecha - 4/12 con animación */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="sticky top-24 space-y-8">
              <MediaUsersSection allUsers={allUsers} ratings={ratings} mediaType={media.type} />
              <TechSpecs {...techSpecsProps} />
              
              <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl p-6 border-t border-l border-white/5">
                <MediaRatingSectionWrapper
                  myRating={userRating}
                  onSave={handleSave}
                  onDelete={myRating?.review ? handleDeleteReview : undefined}
                  hasExistingReview={!!myRating?.review}
                  mediaType={media.type}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}