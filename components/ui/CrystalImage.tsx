'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface CrystalImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  overlay?: boolean
  zoomOnHover?: boolean
  objectPosition?: string
}

export default function CrystalImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 33vw',
  overlay = true,
  zoomOnHover = true,
  objectPosition = 'center'
}: CrystalImageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div className={`crystal-image flex items-center justify-center bg-skyfall-800/50 ${className}`}>
        <span className="text-4xl text-white/20">🎴</span>
      </div>
    )
  }

  return (
    <div 
      className={`crystal-image ${className}`}
      onMouseEnter={() => zoomOnHover && setIsHovered(true)}
      onMouseLeave={() => zoomOnHover && setIsHovered(false)}
    >
      <motion.div
        animate={{
          scale: zoomOnHover && isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full h-full"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          style={{ objectPosition }}
          priority={priority}
          sizes={sizes}
          onError={() => setImageError(true)}
        />
      </motion.div>
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-skyfall-950/80 via-transparent to-transparent pointer-events-none z-10" />
      )}
    </div>
  )
}