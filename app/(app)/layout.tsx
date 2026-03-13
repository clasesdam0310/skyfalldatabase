import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout'

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