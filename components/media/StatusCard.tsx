'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatusCardProps {
  id: string
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  isActive: boolean
  onClick: () => void
}

export default function StatusCard({ 
  id, 
  label, 
  icon: Icon, 
  color, 
  bgColor,
  isActive, 
  onClick 
}: StatusCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative w-full"
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div
        className={`flex flex-col items-center justify-center px-2 py-3 rounded-xl border transition-all duration-200 ${
          isActive 
            ? '' 
            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
        style={{
          background: isActive ? bgColor : 'transparent',
          borderColor: isActive ? color : 'rgba(255,255,255,0.05)',
          boxShadow: isActive ? `0 0 15px ${color}30` : 'none',
        }}
      >
        <Icon 
          size={20} 
          strokeWidth={1.5} 
          style={{ 
            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
            filter: isActive ? `drop-shadow(0 0 5px ${color})` : 'none',
          }} 
        />
        
        <span 
          className={`text-[10px] font-bold uppercase tracking-tight mt-1.5 text-center leading-tight ${
            isActive ? 'text-white' : 'text-white/50'
          }`}
        >
          {label}
        </span>
      </div>
    </motion.button>
  )
}