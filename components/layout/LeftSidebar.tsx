'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Gamepad2,
  Film,
  Tv,
  BookOpen,
  ScrollText,
  Users,
  Archive,
  Sparkles,
  LogOut,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ElementType
  path: string
}

const navItems: NavItem[] = [
  { label: 'Universal Mix', icon: Sparkles, path: '/' },
  { label: 'Videojuegos',   icon: Gamepad2, path: '/games' },
  { label: 'Películas',     icon: Film,     path: '/films' },
  { label: 'Anime',         icon: Tv,       path: '/anime' },
  { label: 'Manga',         icon: BookOpen, path: '/manga' },
  { label: 'Visual Novels', icon: ScrollText, path: '/vn' },
  { label: 'Characters',    icon: Users,    path: '/characters' },
  { label: 'The Vault',     icon: Archive,  path: '/vault' },
]

export default function LeftSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  return (
    <aside className="fixed top-0 left-0 h-screen z-[100]" style={{ width: '260px' }}>
      {/* Sidebar con fondo menos transparente */}
      <div
        className="flex flex-col h-full mx-3 my-3 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(5,8,16,0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,212,255,0.08)',
          boxShadow: '0 0 40px rgba(0,212,255,0.03)',
        }}
      >
        {/* Branding */}
        <div className="flex-shrink-0 relative px-6 py-6 overflow-hidden border-b border-white/5">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url('/skyfall.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(2px)',
            }}
          />
          
          <div className="relative z-10">
            <h1 
              className="text-3xl font-light tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <span style={{ color: '#00d4ff' }}>Sky</span>
              <span style={{ color: '#ff6eb4' }}>Fall</span>
            </h1>
            <p className="text-xs font-mono italic text-white/40 mt-1">
              database
            </p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon
            return (
              <motion.button
                key={item.path}
                onClick={() => router.push(item.path)}
                onHoverStart={() => setHoveredItem(item.path)}
                onHoverEnd={() => setHoveredItem(null)}
                className="relative w-full group"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    style={{
                      color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.35)',
                      filter: isActive ? 'drop-shadow(0 0 2px #00d4ff)' : 'none',
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="ml-auto w-1 h-1 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                    />
                  )}
                </div>
              </motion.button>
            )
          })}
        </nav>

        {/* Sección de usuario con Log Out */}
        <div className="flex-shrink-0 px-4 py-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {status === 'loading' ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
                <div className="h-3 bg-slate-700 rounded w-16 mt-1 animate-pulse" />
              </div>
            </div>
          ) : session?.user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#00d4ff] to-[#ff6eb4]">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name || ''} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{session.user.name || 'Usuario'}</p>
                  <p className="text-[10px] font-mono text-white/30 truncate">@{session.user.name?.toLowerCase() || 'usuario'}</p>
                </div>
              </div>
              
              {/* Botón de Log Out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group"
              >
                <LogOut size={14} className="text-white/40 group-hover:text-[#ff6eb4] transition-colors" strokeWidth={1.5} />
                <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Cerrar sesión</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2 px-3 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-sm font-medium text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors"
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}