import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import MediaDetailClient from './MediaDetailClient'

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const supabase = await createSupabaseServerClient()

  // 1. Traer el media item (Usamos supabaseAdmin para asegurar lectura incluso con RLS estricto)
  const { data: media } = await supabaseAdmin
    .from('media_items')
    .select('*')
    .eq('id', id)
    .single()

  if (!media) notFound()

  // 2. Traer todos los ratings de este título con info de usuario
  const { data: ratings } = await supabaseAdmin
    .from('ratings')
    .select('*, users(id, username, avatar_url)')
    .eq('media_id', id)

  // 3. Traer todos los usuarios del grupo para la comparativa
  const { data: allUsers } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar_url')

  return (
    <MediaDetailClient
      media={media}
      ratings={ratings ?? []}
      allUsers={allUsers ?? []}
      currentUserId={session?.user?.id ?? ''}
      currentUsername={session?.user?.name ?? ''}
    />
  )
}