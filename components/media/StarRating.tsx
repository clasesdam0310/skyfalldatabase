'use client'

import { useState } from 'react'

export default function StarRating({
  value,
  onChange,
}: {
  value: number | null
  onChange: (val: number | null) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  
  const displayValue = value !== null ? value / 2 : 0
  const hoverDisplay = hovered !== null ? hovered / 2 : 0
  const display = hoverDisplay || displayValue

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star
        const half = !full && display >= star - 0.5

        return (
          <div
            key={star}
            className="relative cursor-pointer"
            style={{ width: 32, height: 32 }}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Media estrella izquierda (1 punto) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: '50%' }}
              onMouseEnter={() => setHovered(star * 2 - 1)}
              onClick={() => {
                const newValue = star * 2 - 1
                onChange(value === newValue ? null : newValue)
              }}
            >
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={half || full ? '#FA4D5F' : 'rgba(255,255,255,0.12)'}
                  stroke="none"
                />
              </svg>
            </div>

            {/* Estrella completa derecha (2 puntos) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ left: '50%', width: '50%' }}
              onMouseEnter={() => setHovered(star * 2)}
              onClick={() => {
                const newValue = star * 2
                onChange(value === newValue ? null : newValue)
              }}
            >
              <svg viewBox="0 0 24 24" width="32" height="32" style={{ marginLeft: '-16px' }}>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={full ? '#FA4D5F' : 'rgba(255,255,255,0.12)'}
                  stroke="none"
                />
              </svg>
            </div>
          </div>
        )
      })}
      {value !== null && (
        <span className="ml-2 text-sm font-bold" style={{ color: '#FA4D5F' }}>
          {value}★
        </span>
      )}
    </div>
  )
}