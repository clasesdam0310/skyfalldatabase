'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false
    })

    if (result?.error) {
      setError('Acceso denegado. Este es un espacio privado.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#050507' }}>

      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #103882 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">

        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-1">
            SKY<span style={{ color: '#FA4D5F' }}>FALL</span>
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Database
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
          }}>

          {/* Invite Only badge */}
          <div className="flex items-center justify-center mb-8">
            <span className="text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-full"
              style={{
                color: '#FA4D5F',
                background: 'rgba(250,77,95,0.1)',
                border: '1px solid rgba(250,77,95,0.2)',
              }}>
              ⬡ Invite Only
            </span>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20
                  outline-none transition-all text-sm"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20
                  outline-none transition-all text-sm"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-xs text-center" style={{ color: '#FA4D5F' }}>
              {error}
            </p>
          )}

          {/* Botón */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-sm
              text-white transition-all disabled:opacity-50"
            style={{ background: '#103882' }}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-xs"
          style={{ color: 'rgba(255,255,255,0.15)' }}>
          Plataforma privada · 7 miembros
        </p>

      </div>
    </main>
  )
}