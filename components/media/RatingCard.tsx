'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface RatingCardProps {
  title: string
  imageUrl: string
  averageScore: number
  totalVotes: number
  year?: number
  categories?: {
    gameplay: number
    story: number
    visuals: number
  }
}

export default function RatingCard({
  title,
  imageUrl,
  averageScore,
  totalVotes,
  year,
  categories = { gameplay: 0, story: 0, visuals: 0 }
}: RatingCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const circumference = 2 * Math.PI * 42
  const strokeDashoffset = circumference * (1 - averageScore / 10)

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Fondo con imagen blur */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) scale(1.2)',
        }}
      />

      {/* Overlay Scrim con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-skyfall-950/95 via-skyfall-950/80 to-skyfall-950/60" />

      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Borde con glow en hover */}
      <motion.div 
        className="absolute inset-0 rounded-2xl border"
        style={{ 
          borderColor: isHovered ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.05)',
          boxShadow: isHovered ? '0 0 40px rgba(0,240,255,0.2)' : 'none'
        }}
      />

      <div className="relative p-6 z-10">
        {/* Cabecera con imagen y título */}
        <div className="flex gap-4 mb-6">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-2xl">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="80px"
            />
            <div className="absolute inset-0 ring-1 ring-white/10 rounded-lg" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white mb-1" 
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {title}
            </h3>
            <p className="text-sm font-light text-white/50">
              {year || 'Año desconocido'} • {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
            </p>
          </div>
        </div>

        {/* Anillo de progreso con Glow */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* Círculo de fondo */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
              />
              {/* Círculo de progreso con gradiente y glow */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#ratingGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{ filter: isHovered ? 'drop-shadow(0 0 10px #00F0FF)' : 'none' }}
              />
              <defs>
                <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="100%" stopColor="#0066FF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-3xl font-black bg-gradient-skyfall bg-clip-text text-transparent"
                animate={{ 
                  textShadow: isHovered ? '0 0 20px #00F0FF' : 'none'
                }}
              >
                {averageScore.toFixed(1)}
              </motion.span>
              <span className="text-xs font-light text-white/30">/10</span>
            </div>
          </div>
        </div>

        {/* Barras de categorías con mejor contraste */}
        <div className="space-y-4">
          <CategoryBar label="Gameplay" value={categories.gameplay} color="#00F0FF" />
          <CategoryBar label="Historia" value={categories.story} color="#0066FF" />
          <CategoryBar label="Visuales" value={categories.visuals} color="#8A2BE2" />
        </div>

        {/* Botón con diseño premium */}
        <motion.button
          className="w-full mt-6 py-4 px-4 rounded-xl font-bold text-white relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, #00F0FF, #0066FF)',
            boxShadow: '0 10px 30px -10px rgba(0,240,255,0.3)'
          }}
        >
          <span className="relative z-10 tracking-wider">VALORAR ESTE JUEGO</span>
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ opacity: 0.2 }}
          />
        </motion.button>
      </div>
    </motion.div>
  )
}

function CategoryBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="space-y-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between text-sm">
        <span className="font-medium text-white/70">{label}</span>
        <motion.span 
          className="font-bold font-mono"
          style={{ color }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
        >
          {value}/10
        </motion.span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full rounded-full"
          style={{ 
            backgroundColor: color,
            boxShadow: isHovered ? `0 0 10px ${color}` : 'none'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </div>
  )
}