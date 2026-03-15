'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { supabaseBrowser } from '@/lib/supabase/client'
import FeedCard from './FeedCard'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type FeedEventRow = Tables['feed_events']['Row']
type Json = Database['public']['Tables']['feed_events']['Row']['payload']

interface FeedPayload {
  score?: number | string
  status?: string
  review?: string
  review_is_spoiler?: boolean
  action?: string
  [key: string]: unknown
}

interface FeedEvent {
  id: string
  event_type: string
  user_id: string
  media_id: string | null
  payload: FeedPayload | null
  created_at: string | null
  username: string
  media_title: string | null
  media_type: string | null
  media_cover: string | null
}

const TYPE_ICONS: Record<string, string> = {
  game:  '⊞',
  film:  '▶',
  anime: '⊡',
  manga: '≡',
  vn:    '◇',
}

const TYPE_COLORS: Record<string, string> = {
  game:  '#00d4ff',
  film:  '#1e6fa8',
  anime: '#ff6eb4',
  manga: '#ff8c42',
  vn:    '#4ae8ff',
}

const ANIMATION_SPEED = 30 // píxeles por segundo
const MAX_EVENTS = 30

type FeedEventWithRelations = {
  id: string
  event_type: string
  user_id: string
  media_id: string | null
  payload: Json | null
  created_at: string | null
  users: { username: string } | null
  media_items: { title: string; type: string; cover_image: string | null } | null
}

function parsePayload(payload: Json | null): FeedPayload | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  return payload as FeedPayload
}

export default function RightSidebar() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const y = useMotionValue(0)
  const [contentHeight, setContentHeight] = useState(0)

  const mediaTypeFilter: string | null =
    pathname === '/games' ? 'game'  :
    pathname === '/films' ? 'film'  :
    pathname === '/anime' ? 'anime' :
    pathname === '/manga' ? 'manga' :
    pathname === '/vn'    ? 'vn'    : null

  // Encontrar el ID de la tarjeta más reciente (con fecha más nueva)
  const newestEventId = events.length > 0 
    ? events.reduce((newest, current) => {
        if (!newest.created_at) return current
        if (!current.created_at) return newest
        return new Date(current.created_at) > new Date(newest.created_at) ? current : newest
      }).id
    : null

  // Animación por frame – desplazamiento continuo hacia ABAJO
  useAnimationFrame((_, delta) => {
    if (isPaused || loading || events.length === 0 || contentHeight === 0) return

    // Desplazamiento continuo hacia abajo (incrementar y)
    let newY = y.get() + (delta * ANIMATION_SPEED) / 1000
    const singleHeight = contentHeight / 3 // altura de una copia

    // Lógica de bucle infinito sin cortes
    if (newY >= 0) {
      // Cuando llega al final, salta al inicio de la copia
      newY = -singleHeight * 2
    } else if (newY <= -singleHeight * 3) {
      // Cuando pasa el inicio, salta al final
      newY = -singleHeight
    }

    y.set(newY)
  })

  // Detectar scroll manual
  const handleScroll = useCallback(() => {
    setIsPaused(true)
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => setIsPaused(false), 2000)
  }, [])

  // Cargar eventos iniciales
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)

      const { data, error } = await supabaseBrowser
        .from('feed_events')
        .select(`
          id,
          event_type,
          user_id,
          media_id,
          payload,
          created_at,
          users!feed_events_user_id_fkey ( username ),
          media_items!feed_events_media_id_fkey ( title, type, cover_image )
        `)
        .order('created_at', { ascending: true }) // De más antigua a más nueva
        .limit(MAX_EVENTS)

      if (error || !data) {
        console.error('[Feed] Error fetching events:', error)
        setLoading(false)
        return
      }

      const enriched: FeedEvent[] = (data as unknown as FeedEventWithRelations[]).map((e) => ({
        id: e.id,
        event_type: e.event_type,
        user_id: e.user_id,
        media_id: e.media_id,
        created_at: e.created_at,
        payload: parsePayload(e.payload),
        username: e.users?.username ?? 'Unknown',
        media_title: e.media_items?.title ?? null,
        media_type: e.media_items?.type ?? null,
        media_cover: e.media_items?.cover_image ?? null,
      }))

      let filtered = enriched
      if (mediaTypeFilter) {
        const byType = enriched.filter(e => e.media_type === mediaTypeFilter)
        filtered = byType.length > 0 ? byType : enriched
      }

      setEvents(filtered)
      setLoading(false)
    }

    fetchEvents()

    // Suscripción en tiempo real
    const channel = supabaseBrowser
      .channel('feed_realtime_v2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        async (payload) => {
          const { data: newEventData, error: newError } = await supabaseBrowser
            .from('feed_events')
            .select(`
              id,
              event_type,
              user_id,
              media_id,
              payload,
              created_at,
              users!feed_events_user_id_fkey ( username ),
              media_items!feed_events_media_id_fkey ( title, type, cover_image )
            `)
            .eq('id', payload.new.id)
            .single()

          if (newError || !newEventData) return

          const newEvent = newEventData as unknown as FeedEventWithRelations
          const enrichedNew: FeedEvent = {
            id: newEvent.id,
            event_type: newEvent.event_type,
            user_id: newEvent.user_id,
            media_id: newEvent.media_id,
            created_at: newEvent.created_at,
            payload: parsePayload(newEvent.payload),
            username: newEvent.users?.username ?? 'Unknown',
            media_title: newEvent.media_items?.title ?? null,
            media_type: newEvent.media_items?.type ?? null,
            media_cover: newEvent.media_items?.cover_image ?? null,
          }
          // Insertar la nueva al final (más reciente)
          setEvents(prev => [...prev, enrichedNew].slice(-MAX_EVENTS))
        }
      )
      .subscribe()

    return () => {
      supabaseBrowser.removeChannel(channel)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [pathname, mediaTypeFilter])

  // Medir altura del contenido y establecer posición inicial
  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        setContentHeight(height)
        if (height > 0) {
          // Posicionar al inicio de la primera copia para que empiece por las más antiguas
          y.set(0)
        }
      }
    })

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [y])

  return (
    <aside
      className="fixed top-0 right-0 h-screen flex flex-col overflow-hidden border-l border-white/5"
      style={{ width: '300px', backgroundColor: '#0B0F15' }}
    >
      <div
        className="flex-shrink-0 px-5 py-6 border-b border-white/5 backdrop-blur-sm z-20"
        style={{ backgroundColor: 'rgba(11,15,21,0.9)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse shadow-[0_0_8px_#00d4ff]" />
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">
            SKYFALL FEED
          </h2>
          {mediaTypeFilter && (
            <span
              className="ml-auto text-[9px] font-bold tracking-widest uppercase"
              style={{ color: TYPE_COLORS[mediaTypeFilter] ?? '#ffffff40' }}
            >
              {TYPE_ICONS[mediaTypeFilter]}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-6 h-6 rounded-full border-2 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
              <p className="text-[10px] uppercase tracking-widest text-white/20 animate-pulse">
                Cargando feed...
              </p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
            <span className="text-4xl opacity-20">📭</span>
            <p className="text-[10px] uppercase tracking-widest text-white/20">Sin actividad</p>
          </div>
        ) : (
          <motion.div
            style={{ y }}
            className="px-4 py-4 space-y-3 will-change-transform"
          >
            {/* Múltiples copias para bucle infinito */}
            {[...events, ...events, ...events].map((event, index) => {
              // Verificar si este evento es el más reciente por fecha
              const isNewest = event.id === newestEventId
              
              return (
                <div key={`${event.id}-${index}`} className="relative">
                  {isNewest && (
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        border: '1px solid rgba(255,110,180,0.4)',
                        boxShadow: '0 0 20px rgba(255,110,180,0.2)',
                        backdropFilter: 'blur(4px)',
                        background: 'rgba(255,110,180,0.03)',
                      }}
                    />
                  )}
                  <FeedCard event={event} />
                </div>
              )
            })}
          </motion.div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-white/5" />
    </aside>
  )
}