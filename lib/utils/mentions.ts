export type Mention = {
  username: string
  index: number
  length: number
}

/**
 * Encuentra todas las menciones @username en un texto
 */
export function findMentions(text: string): Mention[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions: Mention[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      index: match.index,
      length: match[0].length,
    })
  }

  return mentions
}

/**
 * Extrae usernames únicos de las menciones
 */
export function extractMentionedUsernames(text: string): string[] {
  const mentions = findMentions(text)
  return [...new Set(mentions.map(m => m.username))]
}