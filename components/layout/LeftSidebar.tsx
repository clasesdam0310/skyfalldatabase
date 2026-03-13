'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV_ITEMS = [
  { href: '/',          label: 'Universal Mix',  icon: '◈' },
  { href: '/games',     label: 'Videojuegos',     icon: '⊞' },
  { href: '/films',     label: 'Películas',       icon: '▶' },
  { href: '/anime',     label: 'Anime',           icon: '⊡' },
  { href: '/manga',     label: 'Manga',           icon: '≡' },
  { href: '/vn',        label: 'Visual Novels',   icon: '◇' },
  { href: '/characters',label: 'Characters',      icon: '✦' },
  { href: '/vault',     label: 'The Vault',       icon: '⬡' },
]

export default function LeftSidebar({ username }: { username: string }) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col"
      style={{
        width: '260px',
        backgroundColor: '#050507',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-black tracking-tighter text-white">
          SKY<span style={{ color: '#FA4D5F' }}>FALL</span>
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase mt-0.5"
          style={{ color: 'rgba(255,255,255,0.2)' }}>
          Database
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5
                transition-all text-sm"
              style={{
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                background: isActive
                  ? 'rgba(16,56,130,0.4)'
                  : 'transparent',
                borderLeft: isActive
                  ? '2px solid #103882'
                  : '2px solid transparent',
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center
            text-xs font-bold text-white"
            style={{ background: '#103882' }}>
            {username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{username}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Miembro
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-xs py-2 rounded-lg transition-all"
          style={{
            color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}