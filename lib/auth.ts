import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { supabaseAdmin } from '@/lib/supabase'

const ALLOWED_USERNAMES = [
  'sirclair',
  'tt4i',
  'externus08',
  'polaris273',
  'yungboirazz',
  'ansitelibre',
  'arpame',
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'SkyFallDB',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const username = (credentials.username as string).toLowerCase().trim()

        if (!ALLOWED_USERNAMES.includes(username)) return null

        // Login contra Supabase Auth usando el email derivado del username
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: `${username}@skyfall.db`,
          password: credentials.password as string,
        })

        if (error || !data.user) return null

        return {
          id: data.user.id,
          name: username,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.username as string
      }
      return session
    },
  },
})