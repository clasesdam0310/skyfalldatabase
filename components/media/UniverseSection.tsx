'use client'

import { useState } from 'react'
import CharacterScroll from './CharacterScroll'
import type { Character } from './CharacterScroll'

interface UniverseSectionProps {
  description: string | null
  creator: string | null
  mediaType: string
  characters: Character[]
  typeIcons: Record<string, string>
  typeColors: Record<string, string>
  isLoading?: boolean  // Cambiado de 'loading' a 'isLoading' para evitar conflicto
}

export default function UniverseSection({
  description,
  creator,
  mediaType,
  characters,
  typeIcons,
  typeColors,
  isLoading = false
}: UniverseSectionProps) {
  const [synopsisRevealed, setSynopsisRevealed] = useState(false)

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Universo de la Obra
          </h2>
          <div className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)' }} />
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* Título de sección con tracking */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          Universo de la Obra
        </h2>
        <div className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)' }} />
      </div>

      {/* 1. SINOPSIS CON SPOILER SHIELD */}
      {description && (
        <div 
          className="group relative rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Efecto de brillo en hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(16,56,130,0.1) 0%, transparent 70%)'
            }} />
          
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black text-[#103882]">📖</span>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Sinopsis
              </h3>
              {/* Badge de spoiler */}
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#FA4D5F]/10 text-[#FA4D5F] border border-[#FA4D5F]/30">
                ⚠ Podría contener spoilers
              </span>
            </div>
            
            {/* Texto con blur controlable */}
            <div 
              className="relative cursor-pointer"
              onClick={() => setSynopsisRevealed(!synopsisRevealed)}
            >
              <p 
                className={`text-sm leading-relaxed transition-all duration-300 ${
                  !synopsisRevealed ? 'filter blur-sm' : ''
                }`}
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {description}
              </p>
              {!synopsisRevealed && (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white/40 bg-black/20 opacity-0 group-hover:opacity-100 transition pointer-events-none backdrop-blur-sm">
                  Click para revelar (si contiene spoilers)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CREADO POR */}
      {creator && (
        <div 
          className="relative rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black" style={{ color: typeColors[mediaType] || '#103882' }}>
                {typeIcons[mediaType] || '◈'}
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Creado por
              </h3>
            </div>
            <p className="text-sm font-medium pl-6" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {creator}
              {mediaType === 'game' && <span className="ml-2 text-xs text-white/40">(Desarrolladora)</span>}
              {mediaType === 'film' && <span className="ml-2 text-xs text-white/40">(Director/Estudio)</span>}
              {mediaType === 'anime' && <span className="ml-2 text-xs text-white/40">(Estudio)</span>}
              {mediaType === 'manga' && <span className="ml-2 text-xs text-white/40">(Autor)</span>}
              {mediaType === 'vn' && <span className="ml-2 text-xs text-white/40">(Desarrolladora)</span>}
            </p>
          </div>
        </div>
      )}

      {/* 3. PERSONAJES DESTACADOS — solo para tipos con API de personajes */}
{mediaType !== 'game' && (
  characters.length > 0 ? (
    <CharacterScroll characters={characters} />
  ) : (
    <div 
      className="relative rounded-2xl overflow-hidden p-8 text-center"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p className="text-sm text-white/30">
        No hay personajes registrados para esta obra
      </p>
    </div>
  )
)}
    </section>
  )
}