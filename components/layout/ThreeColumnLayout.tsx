'use client'

import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

interface ThreeColumnLayoutProps {
  children: React.ReactNode
}

export default function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="relative min-h-screen bg-skyfall-950">
      {/* Fondo cósmico */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00d4ff]/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#ff6eb4]/5 via-transparent to-transparent" />
      </div>

      {/* Contenedor de columnas */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Left Sidebar - fijo en desktop */}
        <div className="hidden md:block flex-shrink-0 w-[260px] h-full overflow-y-auto">
          <LeftSidebar />
        </div>

        {/* Main Content - más ancho, con padding lateral */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6">
          <div className="mx-auto w-full max-w-7xl py-8">
            {children}
          </div>
        </main>

        {/* Right Sidebar - fijo en desktop */}
        <div className="hidden md:block flex-shrink-0 w-[300px] h-full overflow-y-auto">
          <RightSidebar />
        </div>
      </div>

      {/* Botón de menú móvil */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Drawer móvil */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 left-0 h-full w-[260px] bg-slate-950/95 backdrop-blur-xl border-r border-white/10 p-4" onClick={(e) => e.stopPropagation()}>
            <LeftSidebar />
          </div>
        </div>
      )}
    </div>
  )
}