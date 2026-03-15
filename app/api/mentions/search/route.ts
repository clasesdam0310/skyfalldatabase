import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  
  if (!query || query.length < 1) {
    return NextResponse.json({ users: [] })
  }

  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, avatar_url')
      .ilike('username', `${query}%`)
      .limit(5)

    if (error) throw error

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}