const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!

let cachedToken: { token: string; expires: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token
  }

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials',
  })

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await res.json()

  if (!data.access_token) {
    console.error('Failed to get Twitch token:', data)
    throw new Error('Failed to get access token')
  }

  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  }

  return cachedToken.token
}

async function igdbFetch(endpoint: string, body: string) {
  const token = await getAccessToken()

  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
    cache: 'no-store',
  })

  const data = await res.json()
  return data
}

export type IgdbGame = {
  id: number
  name: string
  summary: string | null
  cover: { url: string } | null
  first_release_date: number | null
  genres: { name: string }[]
  involved_companies: { company: { name: string }; developer: boolean }[]
  characters: IgdbCharacter[]
}

export type IgdbCharacter = {
  id: number
  name: string
  description: string | null
  mug_shot: { url: string } | null
}

export async function searchIgdbGames(query: string): Promise<IgdbGame[]> {
  const data = await igdbFetch('games', `
    search "${query}";
    fields id, name, summary, cover.url, first_release_date, genres.name,
           involved_companies.company.name, involved_companies.developer;
    limit 10;
  `)
  return Array.isArray(data) ? data : []
}

export async function getIgdbGame(id: string): Promise<IgdbGame | null> {
  const data = await igdbFetch('games', `
    where id = ${id};
    fields id, name, summary, cover.url, first_release_date, genres.name,
           involved_companies.company.name, involved_companies.developer;
    limit 1;
  `)
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

export async function getIgdbCharactersByGame(gameId: string): Promise<IgdbCharacter[]> {
  const data = await igdbFetch('characters', `
    where games = (${gameId});
    fields id, name, description, mug_shot.url;
    limit 10;
  `)
  return Array.isArray(data) ? data : []
}

export async function getIgdbCharacters(gameId: string): Promise<IgdbCharacter[]> {
  const game = await getIgdbGame(gameId)
  return game?.characters ?? []
}

export function igdbImageUrl(
  url: string,
  size: 't_cover_big' | 't_720p' | 't_thumb' = 't_cover_big'
): string {
  return url.replace('t_thumb', size).replace('http://', 'https://')
}