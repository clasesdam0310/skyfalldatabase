import { createSupabaseServerClient } from '@/lib/supabase'

export default async function UniversalMixPage() {
  const supabase = await createSupabaseServerClient()

  const { data: ranked } = await supabase
    .from('universal_mix')
    .select('*')
    .order('rank', { ascending: true })

  const { data: underRadar } = await supabase
    .from('under_the_radar')
    .select('*')

  const podium = (ranked ?? []).slice(0, 3)
  const grid = (ranked ?? []).slice(3)

  const TYPE_ICONS: Record<string, string> = {
    game:  '⊞',
    film:  '▶',
    anime: '⊡',
    manga: '≡',
    vn:    '◇',
  }

  const TYPE_LABELS: Record<string, string> = {
    game:  'Juego',
    film:  'Película',
    anime: 'Anime',
    manga: 'Manga',
    vn:    'Visual Novel',
  }

  return (
    <div className="px-8 py-8">

      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Universal Mix
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Ranking cross-media del grupo · Mínimo 2 ratings para entrar
        </p>
      </div>

      {podium.length > 0 && (
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Podio
          </p>
          <div className="grid grid-cols-3 gap-4">
            {podium.map((item, index) => (
              <div key={item.id}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '2/3',
                  border: index === 0
                    ? '2px solid #103882'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                }}>
                {item.cover_image ? (
                  <img src={item.cover_image} alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(16,56,130,0.2)' }}>
                    <span className="text-4xl opacity-30">
                      {TYPE_ICONS[item.type ?? '']}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.3) 50%, transparent 100%)' }} />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-black px-2 py-1 rounded-lg"
                    style={{ background: index === 0 ? '#103882' : 'rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    #{index + 1}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(5,5,7,0.8)', color: 'rgba(255,255,255,0.6)' }}>
                    {TYPE_ICONS[item.type ?? '']}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm leading-tight mb-1">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {item.vote_count} voto{Number(item.vote_count) !== 1 ? 's' : ''}
                    </span>
                    <span className="font-black text-sm" style={{ color: '#FA4D5F' }}>
                      {Number(item.skyfall_avg).toFixed(1)}★
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {grid.length > 0 && (
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Ranking
          </p>
          <div className="grid grid-cols-5 gap-3">
            {grid.map((item, index) => (
              <div key={item.id}
                className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="relative" style={{ aspectRatio: '2/3' }}>
                  {item.cover_image ? (
                    <img src={item.cover_image} alt={item.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'rgba(16,56,130,0.15)' }}>
                      <span className="text-2xl opacity-30">
                        {TYPE_ICONS[item.type ?? '']}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(5,5,7,0.85)', color: 'rgba(255,255,255,0.5)' }}>
                      #{index + 4}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(5,5,7,0.85)', color: 'rgba(255,255,255,0.5)' }}>
                      {TYPE_ICONS[item.type ?? '']}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-semibold leading-tight truncate mb-1">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {TYPE_LABELS[item.type ?? '']}
                    </span>
                    <span className="text-xs font-bold" style={{ color: '#FA4D5F' }}>
                      {Number(item.skyfall_avg).toFixed(1)}★
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(underRadar ?? []).length > 0 && (
        <div>
          <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Under the Radar · 1 voto
          </p>
          <div className="grid grid-cols-5 gap-3">
            {(underRadar ?? []).map((item) => (
              <div key={item.id}
                className="rounded-xl overflow-hidden opacity-60 hover:opacity-100
                  transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="relative" style={{ aspectRatio: '2/3' }}>
                  {item.cover_image ? (
                    <img src={item.cover_image} alt={item.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'rgba(250,77,95,0.08)' }}>
                      <span className="text-2xl opacity-30">
                        {TYPE_ICONS[item.type ?? '']}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-semibold leading-tight truncate">
                    {item.title}
                  </p>
                  <span className="text-xs font-bold" style={{ color: '#FA4D5F' }}>
                    {Number(item.single_score).toFixed(1)}★
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(ranked ?? []).length === 0 && (underRadar ?? []).length === 0 && (
        <div className="flex flex-col items-center justify-center h-96">
          <span className="text-6xl mb-4 opacity-20">◈</span>
          <p className="text-white font-semibold mb-2">El ranking está vacío</p>
          <p className="text-sm text-center max-w-sm"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Cuando los miembros empiecen a puntuar títulos aparecerán aquí.
            Mínimo 2 ratings para entrar al ranking principal.
          </p>
        </div>
      )}

    </div>
  )
}