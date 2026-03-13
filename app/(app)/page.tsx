import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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
    game: '⊞',
    film: '▶',
    anime: '⊡',
    manga: '≡',
    vn: '◇',
  }

  const TYPE_LABELS: Record<string, string> = {
    game: 'Juego',
    film: 'Película',
    anime: 'Anime',
    manga: 'Manga',
    vn: 'Visual Novel',
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Universal Mix
        </h1>
        <p className="text-sm mt-1 text-white/30">
          Ranking cross-media del grupo · Mínimo 2 ratings para entrar
        </p>
      </div>

      {podium.length > 0 && (
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">
            Podio
          </p>
          <div className="grid grid-cols-3 gap-4">
            {podium.map((item, index) => (
              <div key={item.id}
                className="relative rounded-2xl overflow-hidden glass-card"
                style={{
                  aspectRatio: '2/3',
                  border: index === 0 ? '2px solid #103882' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {item.cover_image ? (
                  <Image src={item.cover_image} alt={item.title ?? ''} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-sky-blue/20">
                    <span className="text-4xl opacity-30">{TYPE_ICONS[item.type ?? '']}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${index === 0 ? 'bg-sky-blue' : 'bg-white/10'} text-white`}>
                    #{index + 1}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm leading-tight mb-1 truncate">{item.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{item.vote_count} votos</span>
                    <span className="font-black text-sm text-fall-red">
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
          <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold text-white/30">Ranking</p>
          <div className="grid grid-cols-5 gap-3">
            {grid.map((item, index) => (
              <div key={item.id} className="rounded-xl overflow-hidden glass-card transition-all hover:scale-105">
                <div className="relative aspect-[2/3]">
                  {item.cover_image ? (
                    <Image src={item.cover_image} alt={item.title ?? ''} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-sky-blue/10">
                      <span className="text-2xl opacity-30">{TYPE_ICONS[item.type ?? '']}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-white/50">
                    #{index + 4}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-white text-[11px] font-semibold truncate">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-white/30">{TYPE_LABELS[item.type ?? '']}</span>
                    <span className="text-[11px] font-bold text-fall-red">{Number(item.skyfall_avg).toFixed(1)}★</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}