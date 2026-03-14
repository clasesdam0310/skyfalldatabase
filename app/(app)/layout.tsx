import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'SkyFall DataBase',
    template: '%s | SkyFall DataBase',
  },
  description:
    'Sistema privado de catalogación y análisis de métricas para contenido cross-media. Gestión avanzada de videojuegos, cine, anime y literatura.',
  icons: {
    icon: [
      {
        url: '/skyfall.png',
        href: '/skyfall.png',
        type: 'image/png',
      },
    ],
    shortcut: '/skyfall.png',
    apple: '/skyfall.png',
  },
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const username = session.user.name ?? 'Usuario'

  return (
    <ThreeColumnLayout username={username}>
      {children}
    </ThreeColumnLayout>
  )
}