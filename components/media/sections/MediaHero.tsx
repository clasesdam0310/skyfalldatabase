'use client'

import CrystalImage from '@/components/ui/CrystalImage'
import { TYPE_ICONS } from '@/lib/constants/media'

interface MediaHeroProps {
  media: {
    banner_image: string | null
    cover_image: string | null
    title: string
    type: string
    year: number | null
    creator: string | null
  }
  avgScore: number | null
  scoresLength: number
}

export default function MediaHero({ media, avgScore, scoresLength }: MediaHeroProps) {
  return (
    <div className="relative w-full max-h-[350px] aspect-video overflow-hidden">
      {media.banner_image || media.cover_image ? (
        <CrystalImage
          src={media.banner_image || media.cover_image!}
          alt={media.title}
          className="absolute inset-0 w-full h-full"
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          overlay={false}
          zoomOnHover={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-800/20">
          <span className="text-8xl opacity-20">{TYPE_ICONS[media.type]}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="crystal-panel-accent px-2 py-0.5 rounded-full text-[9px] font-semibold text-white/80">
            {TYPE_ICONS[media.type]} {media.type.toUpperCase()}
          </span>
          {media.year && <span className="text-xs text-white/30">{media.year}</span>}
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-1 crystal-text">
          {media.title}
        </h1>
        {media.creator && <p className="text-sm text-white/40">{media.creator}</p>}
      </div>

      {avgScore !== null && (
        <div className="absolute bottom-4 right-6 text-right">
          <div className="crystal-panel-accent px-3 py-1.5">
            <div className="flex items-end gap-2">
              <div className="text-right">
                <p className="text-[9px] font-mono tracking-wider text-white/30 mb-0.5">SKYFALL AVG</p>
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-black text-[#00d4ff] tabular-nums">
                    {avgScore.toFixed(1)}
                  </span>
                  <span className="text-lg text-[#00d4ff]/50">★</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10 mx-1" />
              <div className="text-left">
                <p className="text-[9px] font-mono text-white/30 mb-0.5">VOTOS</p>
                <p className="text-lg font-bold text-white/40 tabular-nums">
                  {scoresLength}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}