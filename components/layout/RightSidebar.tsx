'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

interface FeedPayload {
  score?: number | string
  status?: string
  [key: string]: unknown
}

// Matches what Supabase actually returns (Json type from generated types)
interface RawFeedEvent {
  id: string
  event_type: string
  user_id: string
  media_id: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  created_at: string | null
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

const EVENT_LABELS: Record<string, string> = {
  rated:          'puntuó',
  status_changed: 'actualizó',
  reviewed:       'reseñó',
  rewatched:      'está reviendo',
  character_favorited: 'favoritó a',
  reacted:        'reaccionó en',
}

const TYPE_ICONS: Record<string, string> = {
  game:  '⊞',
  film:  '▶',
  anime: '⊡',
  manga: '≡',
  vn:    '◇',
}

const TYPE_COLORS: Record<string, string> = {
  game:  '#34d399',
  film:  '#38bdf8',
  anime: '#a78bfa',
  manga: '#fbbf24',
  vn:    '#f472b6',
}

export default function RightSidebar() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  const mediaTypeFilter: string | null =
    pathname === '/games' ? 'game'  :
    pathname === '/films' ? 'film'  :
    pathname === '/anime' ? 'anime' :
    pathname === '/manga' ? 'manga' :
    pathname === '/vn'    ? 'vn'    : null

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)

      // Single query with embedded joins — FKs confirmed in Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rawEvents, error } = await (supabaseBrowser as any)
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
        .order('created_at', { ascending: false })
        .limit(20)

      if (error || !rawEvents) {
        console.error('[Feed] Error fetching events:', error)
        setLoading(false)
        return
      }

      // Enrich using joined data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enriched: FeedEvent[] = (rawEvents as any[]).map((e: any) => ({
        id:          e.id as string,
        event_type:  e.event_type as string,
        user_id:     e.user_id as string,
        media_id:    (e.media_id ?? null) as string | null,
        created_at:  (e.created_at ?? null) as string | null,
        payload:     (e.payload !== null && typeof e.payload === 'object' && !Array.isArray(e.payload))
                       ? (e.payload as FeedPayload)
                       : null,
        username:    e.users?.username ?? 'Unknown',
        media_title: e.media_items?.title      ?? null,
        media_type:  e.media_items?.type       ?? null,
        media_cover: e.media_items?.cover_image ?? null,
      }))

      // Step 7: Apply contextual filter — fall back to all if empty
      let filtered = enriched
      if (mediaTypeFilter) {
        const byType = enriched.filter(e => e.media_type === mediaTypeFilter)
        filtered = byType.length > 0 ? byType : enriched
      }

      setEvents(filtered.slice(0, 5))
      setLoading(false)
    }

    void fetchEvents()

    // Realtime subscription
    const channel = supabaseBrowser
      .channel('feed_realtime_v2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        () => { void fetchEvents() }
      )
      .subscribe()

    return () => { void supabaseBrowser.removeChannel(channel) }
  }, [pathname, mediaTypeFilter])

  return (
    <aside
      className="fixed top-0 right-0 h-screen flex flex-col overflow-hidden border-l border-white/5 bg-[#050507]"
      style={{ width: '300px' }}
    >
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FA4D5F] animate-pulse shadow-[0_0_8px_#FA4D5F]" />
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">
            SkyFall Feed
          </h2>
          {mediaTypeFilter && (
            <span className="ml-auto text-[9px] font-bold tracking-widest uppercase"
              style={{ color: TYPE_COLORS[mediaTypeFilter] ?? '#ffffff40' }}>
              {TYPE_ICONS[mediaTypeFilter]} {mediaTypeFilter}
            </span>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[10px] uppercase tracking-widest text-white/20 animate-pulse">
              Sincronizando...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-[10px] uppercase tracking-widest text-white/20">Sin actividad</p>
          </div>
        ) : (
          events.map((event) => (
            <FeedCard key={event.id} event={event} />
          ))
        )}
      </div>
    </aside>
  )
}

function FeedCard({ event }: { event: FeedEvent }) {
  const accentColor = event.media_type ? (TYPE_COLORS[event.media_type] ?? '#103882') : '#103882'
  console.log('[FeedCard]', event.media_title, '| cover:', event.media_cover)  // ← añade esto
  
  return (
    <div className="relative group p-4 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04]">
      {/* Blurred cover image background */}
{event.media_cover && (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `url(${event.media_cover})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(1.5px)',
      transform: 'scale(1.15)',
      opacity: 0.85,
    }}
  />
)}
{/* Dark overlay */}
<div className="absolute inset-0 bg-[#050507]/55 pointer-events-none" />
      <div className="relative z-10">
        {/* Media title + type icon */}
        {event.media_title && (
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-black" style={{ color: accentColor }}>
              {TYPE_ICONS[event.media_type ?? ''] ?? '◈'}
            </span>
            <p className="text-[12px] font-bold text-white/90 leading-tight line-clamp-1">
              {event.media_title}
            </p>
          </div>
        )}

        {/* User + action + score */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-black text-[#103882] tracking-tight">
            @{event.username}
          </span>
          <span className="text-[11px] text-white/35 font-medium">
            {EVENT_LABELS[event.event_type] ?? event.event_type}
          </span>
          {event.payload?.score != null && (
            <span className="text-[11px] font-black text-[#FA4D5F] ml-auto">
              {String(event.payload.score)}★
            </span>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-[9px] text-white/20 mt-1.5 font-medium tracking-wide">
          {event.created_at ? formatRelativeTime(event.created_at) : ''}
        </p>
      </div>
    </div>
  )
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 1)  return 'ahora mismo'
  if (mins  < 60) return `hace ${mins}m`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}