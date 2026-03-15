'use client'

import { useState, useCallback } from 'react'

interface StarRatingProps {
  value: number | null
  onChange: (val: number | null) => void
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  
  const displayValue = value !== null ? value / 2 : 0
  const hoverDisplay = hovered !== null ? hovered / 2 : 0
  const display = hoverDisplay || displayValue

  const handleMouseEnter = useCallback((starValue: number) => {
    setHovered(starValue)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(null)
  }, [])

  const handleClick = useCallback((starValue: number, isHalf: boolean) => {
    const newValue = isHalf ? starValue * 2 - 1 : starValue * 2
    onChange(value === newValue ? null : newValue)
  }, [value, onChange])

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star
        const half = !full && display >= star - 0.5

        return (
          <div
            key={star}
            className="relative cursor-pointer flex-shrink-0"
            style={{ width: 28, height: 28 }}
            onMouseLeave={handleMouseLeave}
          >
            {/* Media estrella izquierda (1 punto) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: '50%' }}
              onMouseEnter={() => handleMouseEnter(star * 2 - 1)}
              onClick={() => handleClick(star, true)}
            >
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={half || full ? '#00d4ff' : 'rgba(255,255,255,0.12)'}
                  stroke="none"
                />
              </svg>
            </div>

            {/* Estrella completa derecha (2 puntos) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ left: '50%', width: '50%' }}
              onMouseEnter={() => handleMouseEnter(star * 2)}
              onClick={() => handleClick(star, false)}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" style={{ marginLeft: '-14px' }}>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={full ? '#00d4ff' : 'rgba(255,255,255,0.12)'}
                  stroke="none"
                />
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}