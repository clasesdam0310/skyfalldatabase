'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export type Character = {
  id: string
  name: string
  image_url: string | null
  lore: string | null
  role: string
}

interface CharacterScrollProps {
  characters: Character[]
}

export default function CharacterScroll({ characters }: CharacterScrollProps) {
  const router = useRouter()

  if (!characters.length) return null

  return (
    <div 
      className="relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
            {characters.length}
          </span>
        </div>

        {/* Scroll horizontal nativo (ocultamos la barra con CSS) */}
        <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => router.push(`/characters/${char.id}`)}
                className="group/char relative flex-shrink-0 w-28 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Efecto glow en hover */}
                <div className="absolute inset-0 opacity-0 group-hover/char:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(16,56,130,0.2) 0%, transparent 70%)'
                  }} />

                {/* Avatar o placeholder */}
                <div className="relative w-full aspect-square">
                  {char.image_url ? (
                    <Image
                      src={char.image_url}
                      alt={char.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#103882]/20">
                      <span className="text-2xl font-black text-white/30">
                        {char.name[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Badge de rol */}
                  <div className="absolute bottom-1 left-1 right-1">
                    <span className="block text-[8px] font-bold uppercase text-center px-1 py-0.5 rounded-full bg-black/60 text-white/80 truncate">
                      {char.role}
                    </span>
                  </div>
                </div>

                {/* Nombre del personaje */}
                <div className="p-2 text-center">
                  <p className="text-[11px] font-medium text-white/90 truncate">
                    {char.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}