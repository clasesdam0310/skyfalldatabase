'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type FeedEvent = {
  id: string
  user_id: string
  event_type: string
  media_id: string | null
  payload: Record<string, unknown>
  created_at: string
  users?: { username: string }
  media_items?: { title: string; cover_url: string | null; media_type: string }
}

const EVENT_LABELS: Record<string, string> = {
  rated:          'puntuó',
  status_changed: 'actualizó',
  reviewed:       'reseñó',
  rewatched:      'está reviendo',
}

const MEDIA_TYPE_ICONS: Record<string, string> = {
  game:         '⊞',
  film:         '▶',
  anime:        '⊡',
  manga:        '≡',
  visual_novel: '◇',
}

export default function RightSidebar() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Determinar filtro por ruta activa
  const mediaTypeFilter: string | null =
    pathname === '/games'  ? 'game'  :
    pathname === '/films'  ? 'film'  :
    pathname === '/anime'  ? 'anime' :
    pathname === '/manga'  ? 'manga' :
    pathname === '/vn'     ? 'visual_novel' : null

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)

      let query = supabase
        .from('feed_events')
        .select(`
          *,
          users ( username ),
          media_items ( title, cover_url, media_type )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (mediaTypeFilter) {
        query = query.eq('media_items.media_type', mediaTypeFilter)
      }

      const { data } = await query
      setEvents((data as FeedEvent[]) ?? [])
      setLoading(false)
    }

    fetchEvents()

    // Realtime subscription
    const channel = supabase
      .channel('feed_events_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        () => fetchEvents()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pathname, mediaTypeFilter])

  return (
    <aside
      className="fixed top-0 right-0 h-screen flex flex-col overflow-hidden"
      style={{
        width: '300px',
        backgroundColor: '#050507',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="px-5 py-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          SkyFall Feed
        </h2>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Cargando actividad...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs text-center px-4"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              Sin actividad reciente en esta sección
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl p-3 transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Media type icon + title */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-sm mt-0.5">
                  {MEDIA_TYPE_ICONS[event.media_items?.media_type ?? ''] ?? '◈'}
                </span>
                <p className="text-xs font-semibold text-white leading-tight">
                  {event.media_items?.title ?? 'Título desconocido'}
                </p>
              </div>

              {/* Action */}
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ color: '#103882' }} className="font-semibold">
                  {event.users?.username ?? 'Usuario'}
                </span>
                {' '}{EVENT_LABELS[event.event_type] ?? event.event_type}
                {event.payload?.score
                  ? <span style={{ color: '#FA4D5F' }}>
                      {' '}— {String(event.payload.score)}★
                    </span>
                  : null
                }
              </p>

              {/* Timestamp */}
              <p className="text-xs mt-1.5"
                style={{ color: 'rgba(255,255,255,0.2)' }}>
                {new Date(event.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Actualización en tiempo real
        </p>
      </div>
    </aside>
  )
}