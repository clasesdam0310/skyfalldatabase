import type { Database } from './database'

export type MediaItem = {
  id: string
  title: string
  type: string
  cover_image: string | null
  banner_image: string | null
  description: string | null
  year: number | null
  genres: string[] | null
  creator: string | null
  duration_label: string | null
  episodes: number | null
  chapters: number | null
  api_id: string | null
  api_source: string | null
}

export type Rating = {
  id: string
  user_id: string
  score: number | null
  status: string | null
  review: string | null
  review_is_spoiler: boolean | null
  created_at: string | null
  users: { id: string; username: string; avatar_url: string | null } | null
}

export type User = {
  id: string
  username: string
  avatar_url: string | null
}

export type Reaction = {
  emoji: string
  count: number
  user_reacted: boolean
}

// Tipos para IGDB (juegos)
export interface IgdbSearchResult {
  id: number
  name: string
  cover_url: string | null
  year: number | null
  genres: string[]
  developer: string | null
  summary: string | null
}

export interface IgdbSearchResponse {
  results: IgdbSearchResult[]
}

export interface IgdbGameDetails {
  id: number
  name: string
  summary: string | null
  cover_url: string | null
  year: number | null
  genres: string[]
  developer: string | null
  developers?: string[]
  publishers: string[]
  website: string
  metacritic: number | null
  platforms: string[]
  released: string | null
  rating: number
  ratings_count: number
}

// Tipos para TMDB (películas)
export interface TmdbSearchResult {
  id: number
  title: string
  poster_url: string | null
  year: number | null
  overview: string | null
  vote_average: number
  vote_count: number
}

export interface TmdbSearchResponse {
  results: TmdbSearchResult[]
}

export interface TmdbCast {
  id: string
  name: string
  character: string
  profile_path: string | null
}

export interface TmdbMovieDetails {
  id: number
  title: string
  overview: string | null
  poster_url: string | null
  backdrop_url: string | null
  year: number | null
  runtime: number | null
  genres: string[]
  director: string | null
  vote_average: number
  vote_count: number
  cast?: TmdbCast[]
}

// Tipos para AniList (anime)
export interface AnilistSearchResult {
  id: number
  name: string
  background_image: string | null
  released: string | null
  genres: string[]
  studios: string[]
  averageScore: number | null
}

export interface AnilistSearchResponse {
  results: AnilistSearchResult[]
}

export interface AnimeDetails {
  description: string
  episodes: number | null
  studios: string[]
  status: string | null
  format: string | null
  source: string | null
  siteUrl: string | null
  trailer: { id: string; site: string } | null
  averageScore: number | null
  genres: string[]
  year: number | null
}

export interface Character {
  id: string
  name: string
  image_url: string | null
  lore: string | null
  role: string
}

// Tipo para el rating del usuario actual
export type UserRating = {
  score: number | null
  status: string
  review: string
  review_is_spoiler: boolean
}
// Tipos para Manga (AniList)
export interface MangaSearchResult {
  id: number
  name: string
  background_image: string | null
  released: string | null
  genres: string[]
  authors: string[]
  averageScore: number | null
}

export interface MangaSearchResponse {
  results: MangaSearchResult[]
}

export interface MangaDetails {
  description: string
  chapters: number | null
  volumes: number | null
  authors: string[]
  status: string | null
  format: string | null
  siteUrl: string | null
  averageScore: number | null
  genres: string[]
  year: number | null
}