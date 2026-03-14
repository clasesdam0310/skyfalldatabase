'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import FeedCard from './FeedCard'

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
        media_title: e.media_items?.title       ?? null,
        media_type:  e.media_items?.type        ?? null,
        media_cover: e.media_items?.cover_image ?? null,
      }))

      let filtered = enriched
      if (mediaTypeFilter) {
        const byType = enriched.filter(e => e.media_type === mediaTypeFilter)
        filtered = byType.length > 0 ? byType : enriched
      }

      setEvents(filtered.slice(0, 5))
      setLoading(false)
    }

    void fetchEvents()

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