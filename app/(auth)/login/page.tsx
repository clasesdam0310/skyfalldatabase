// app/(auth)/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { User, Lock } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<'username' | 'password' | null>(null)
  const [hasTypedUser, setHasTypedUser] = useState(false)
  const [hasTypedPass, setHasTypedPass] = useState(false)
  const router = useRouter()

  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Efecto paralaje para el fondo
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 })
  
  const backgroundX = useTransform(springX, [-500, 500], [-20, 20])
  const backgroundY = useTransform(springY, [-500, 500], [-20, 20])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      mouseX.set(x)
      mouseY.set(y)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

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
    <>
      <HeadContent />
      
      <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050507]">
        {/* Capa 1: Fondo con paralaje sutil */}
        <motion.div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('/skyfall.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(12px)',
            opacity: 0.5,
            scale: 1.1,
            x: backgroundX,
            y: backgroundY,
          }}
        />
        
        {/* Capa 2: Overlay oscuro (#050507 con opacidad 65%) */}
        <div className="fixed inset-0 pointer-events-none bg-[#050507]/65" />

        {/* Resplandores decorativos */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Foco superior izquierdo - cian (#103882) */}
          <div 
            className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16,56,130,0.4) 0%, transparent 70%)',
              filter: 'blur(100px)',
              transform: 'translate(-30%, -30%)',
            }}
          />
          
          {/* Foco inferior derecho - rojo fall (#FA4D5F) */}
          <div 
            className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(250,77,95,0.3) 0%, transparent 70%)',
              filter: 'blur(100px)',
              transform: 'translate(30%, 30%)',
            }}
          />
        </div>

        {/* Contenido centrado */}
        <div className="relative z-10 w-full max-w-sm px-6">
          {/* Logo SkyFall con glow pulsante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-serif font-light tracking-tight mb-2">
              <motion.span 
                className="relative inline-block"
                style={{
                  color: '#103882',
                  textShadow: '0 0 30px rgba(16,56,130,0.8)',
                }}
                animate={{
                  textShadow: [
                    '0 0 30px rgba(16,56,130,0.5)',
                    '0 0 40px rgba(16,56,130,0.8)',
                    '0 0 30px rgba(16,56,130,0.5)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Sky
              </motion.span>
              <motion.span 
                className="relative inline-block ml-1"
                style={{
                  color: '#FA4D5F',
                  textShadow: '0 0 30px rgba(250,77,95,0.8)',
                }}
                animate={{
                  textShadow: [
                    '0 0 30px rgba(250,77,95,0.5)',
                    '0 0 40px rgba(250,77,95,0.8)',
                    '0 0 30px rgba(250,77,95,0.5)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                Fall
              </motion.span>
            </h1>
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40">
              DATABASE
            </p>
          </motion.div>

          {/* Panel de Login - Glassmorphism Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: 'rgba(5,5,7,0.4)',
              backdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 20px rgba(16,56,130,0.2), 0 30px 60px -30px rgba(0,0,0,0.8)',
            }}
          >
            {/* Border Beam (luz recorriendo el borde) */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                border: '1px solid transparent',
                background: 'linear-gradient(90deg, transparent, rgba(16,56,130,0.5), rgba(250,77,95,0.5), transparent) border-box',
                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
              animate={{
                background: [
                  'linear-gradient(90deg, transparent, rgba(16,56,130,0.5), rgba(250,77,95,0.5), transparent) border-box',
                  'linear-gradient(180deg, transparent, rgba(16,56,130,0.5), rgba(250,77,95,0.5), transparent) border-box',
                  'linear-gradient(270deg, transparent, rgba(16,56,130,0.5), rgba(250,77,95,0.5), transparent) border-box',
                  'linear-gradient(360deg, transparent, rgba(16,56,130,0.5), rgba(250,77,95,0.5), transparent) border-box',
                  'linear-gradient(90deg, transparent, rgba(16,56,130,0.5), rgba(250,77,95,0.5), transparent) border-box',
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Badge Invite Only */}
            <div className="flex justify-center mb-8">
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                ⬡ INVITE ONLY
              </span>
            </div>

            {/* Campos de texto con iconos dentro */}
            <div className="space-y-5">
              {/* Campo Usuario */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <User 
                    size={16} 
                    className={`transition-all duration-300 ${
                      focusedInput === 'username' || hasTypedUser 
                        ? 'text-[#103882] opacity-100' 
                        : 'text-white/30 opacity-50'
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                <input
                  ref={usernameRef}
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (!hasTypedUser && e.target.value.length > 0) setHasTypedUser(true)
                  }}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full pl-10 pr-4 py-4 rounded-xl text-white placeholder-white/30
                             bg-white/[0.02] border border-white/10
                             focus:outline-none focus:border-[#103882] focus:shadow-[0_0_15px_rgba(16,56,130,0.3)]
                             transition-all duration-500 tracking-wide"
                  style={{ color: '#ffffff' }}
                  disabled={loading}
                />
              </div>

              {/* Campo Contraseña */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock 
                    size={16} 
                    className={`transition-all duration-300 ${
                      focusedInput === 'password' || hasTypedPass 
                        ? 'text-[#FA4D5F] opacity-100' 
                        : 'text-white/30 opacity-50'
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (!hasTypedPass && e.target.value.length > 0) setHasTypedPass(true)
                  }}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full pl-10 pr-4 py-4 rounded-xl text-white placeholder-white/30
                             bg-white/[0.02] border border-white/10
                             focus:outline-none focus:border-[#FA4D5F] focus:shadow-[0_0_15px_rgba(250,77,95,0.3)]
                             transition-all duration-500 tracking-wide"
                  style={{ color: '#ffffff' }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mensaje de error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 text-xs text-center text-[#FA4D5F] font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Botón de entrada con efecto shine */}
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-8 py-4 rounded-xl font-medium text-sm text-white
                         relative overflow-hidden group
                         transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Fondo del botón con gradiente sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#103882]/80 to-[#FA4D5F]/80" />
              
              {/* Efecto shine */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
              />
              
              {/* Efecto shine automático cada 3 segundos */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                }}
              />
              
              <span className="relative z-10 font-semibold tracking-wider">
                {loading ? 'VERIFICANDO...' : 'ENTRAR'}
              </span>
            </motion.button>
          </motion.div>

          {/* Footer ultra minimal */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mt-8 text-[10px] text-white/30 font-light tracking-wider"
          >
            PLATAFORMA PRIVADA · 7 MIEMBROS
          </motion.p>
        </div>
      </div>
    </>
  )
}

// Componente para el Head (título y favicon)
function HeadContent() {
  useEffect(() => {
    document.title = 'SkyFall DataBase | Plataforma privada'
    
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'icon'
    link.href = '/skyfall.png'
    document.getElementsByTagName('head')[0].appendChild(link)
  }, [])

  return null
}