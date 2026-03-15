import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-space-grotesk' 
})

export const metadata: Metadata = {
  title: 'SkyFall DB',
  description: 'Private media tracking and ranking platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        {/* Capa 1: Fondo con logo de marca - GLOBAL */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('/skyfall.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(15px)',
            opacity: 0.37,
            transform: 'scale(1.1)',
          }}
        />
        
        {/* Capa 2: Overlay de cristal oscuro - GLOBAL */}
        <div className="fixed inset-0 pointer-events-none bg-[#050810]/30" />

        {/* Capa 3: Contenido */}
        <div className="relative z-20">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  )
}