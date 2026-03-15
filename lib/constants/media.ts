// lib/constants/media.ts

// Iconos por tipo de medio
export const TYPE_ICONS: Record<string, string> = {
  game:  '⊞',
  film:  '▶',
  anime: '⊡',
  manga: '≡',
  vn:    '◇',
}

// Colores por tipo de medio (según ficha técnica)
export const TYPE_COLORS: Record<string, string> = {
  game:  '#00d4ff',  // Cyan / Sky Blue
  film:  '#1e6fa8',  // Azul profundo
  anime: '#ff6eb4',  // Rosa
  manga: '#ff8c42',  // Naranja
  vn:    '#4ae8ff',  // Cyan claro
}

// Emojis para reacciones
export const EMOJIS = ['🔥', '😱', '❤️', '🫡', '📉']

// Textos de carga por sección
export const LOADING_TEXTS: Record<string, string[]> = {
  game:  ['Cargando partida guardada...', 'Inicializando nivel...', 'Conectando con el servidor...'],
  film:  ['Ajustando el proyector...', 'Preparando la sala...', 'Buscando subtítulos...'],
  anime: ['Conectando con el servidor de Akihabara...', 'Cargando openings...', 'Preparando episodios...'],
  manga: ['Pasando las páginas...', 'Buscando el siguiente tomo...', 'Cargando capítulos...'],
  vn:    ['Iniciando ruta principal...', 'Cargando escenas...', 'Preparando soundtrack...'],
}

// Estados de consumo
export const STATUS_LABELS: Record<string, string> = {
  completed:       'Completado',
  in_progress:     'En progreso',
  on_hold:         'En pausa',
  dropped:         'Abandonado',
  plan_to_consume: 'Pendiente',
  rewatching:      'Reviendo',
}

// Verbos para acciones en el feed
export const STATUS_ACTIONS: Record<string, string> = {
  completed:       'ha completado',
  in_progress:     'está jugando/viendo/leyendo',
  on_hold:         'ha puesto en pausa',
  dropped:         'ha abandonado',
  plan_to_consume: 'ha marcado como pendiente',
  rewatching:      'está reviendo/releyendo',
}