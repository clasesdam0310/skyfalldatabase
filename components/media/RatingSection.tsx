'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StarRating from './StarRating'
import MentionsDropdown from './MentionsDropdown'
import DatePicker from './DatePicker'
import { Trash2, AtSign, CheckCircle, PlayCircle, PauseCircle, XCircle, Clock, RotateCcw, Calendar } from 'lucide-react'

interface RatingSectionProps {
  initialScore?: number | null
  initialStatus?: string
  initialReview?: string
  initialSpoiler?: boolean
  onSave: (data: {
    score: number | null
    status: string
    review: string
    isSpoiler: boolean
  }) => Promise<void>
  onDelete?: () => Promise<void>
  hasExistingReview?: boolean
  mediaType: string
}

const getRewatchingLabel = (mediaType: string): string => {
  switch (mediaType) {
    case 'game': return 'Rejugando'
    case 'film':
    case 'anime': return 'Reviendo'
    case 'manga':
    case 'vn': return 'Releyendo'
    default: return 'Reviendo'
  }
}

const STATUSES = (mediaType: string) => [
  { id: 'completed', label: 'COMPLETADO', icon: CheckCircle, color: '#00d4ff' },
  { id: 'in_progress', label: 'EN PROGRESO', icon: PlayCircle, color: '#22c55e' },
  { id: 'on_hold', label: 'EN PAUSA', icon: PauseCircle, color: '#f59e0b' },
  { id: 'dropped', label: 'ABANDONADO', icon: XCircle, color: '#ef4444' },
  { id: 'plan_to_consume', label: 'PENDIENTE', icon: Clock, color: '#8b5cf6' },
  { id: 'rewatching', label: getRewatchingLabel(mediaType).toUpperCase(), icon: RotateCcw, color: '#ff8c42' },
]

interface User {
  id: string
  username: string
  avatar_url: string | null
}

// Función para calcular la posición exacta del cursor (DEBAJO)
function getCursorPosition(textarea: HTMLTextAreaElement) {
  try {
    const textareaRect = textarea.getBoundingClientRect()
    
    // Crear mirror con estilos exactos
    const mirror = document.createElement('div')
    const style = window.getComputedStyle(textarea)

    mirror.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      font-weight: ${style.fontWeight};
      line-height: ${style.lineHeight};
      letter-spacing: ${style.letterSpacing};
      padding: ${style.padding};
      border: ${style.border};
      box-sizing: border-box;
      width: ${textarea.offsetWidth}px;
    `

    const cursorPos = textarea.selectionStart
    const textBeforeCursor = textarea.value.substring(0, cursorPos)
      .replace(/\n/g, '<br>')
      .replace(/ /g, '&nbsp;')

    mirror.innerHTML = textBeforeCursor + '<span id="caret-marker">|</span>'
    document.body.appendChild(mirror)

    const marker = document.getElementById('caret-marker')
    if (!marker) {
      document.body.removeChild(mirror)
      return null
    }

    const markerRect = marker.getBoundingClientRect()
    const mirrorRect = mirror.getBoundingClientRect()
    document.body.removeChild(mirror)

    // Calcular posición ABSOLUTA (DEBAJO del cursor)
    const lineHeight = parseInt(style.lineHeight) || 20
    const absoluteTop = textareaRect.top + (markerRect.top - mirrorRect.top) - textarea.scrollTop + lineHeight
    const absoluteLeft = textareaRect.left + (markerRect.left - mirrorRect.left)

    return {
      top: absoluteTop,
      left: absoluteLeft,
    }
  } catch (error) {
    console.error('Error calculando posición:', error)
    return null
  }
}

export default function RatingSection({
  initialScore = null,
  initialStatus = '',
  initialReview = '',
  initialSpoiler = false,
  onSave,
  onDelete,
  hasExistingReview = false,
  mediaType
}: RatingSectionProps) {
  const [score, setScore] = useState<number | null>(initialScore)
  const [status, setStatus] = useState<string>(initialStatus)
  const [review, setReview] = useState<string>(initialReview)
  const [isSpoiler, setIsSpoiler] = useState<boolean>(initialSpoiler)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [mentionUsers, setMentionUsers] = useState<User[]>([])
  const [loadingMentions, setLoadingMentions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionDebounce = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)

  const canSave = status.trim().length > 0

  // Detectar @ en el texto
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const handleInput = () => {
      const cursorPos = textarea.selectionStart
      const text = textarea.value

      // Buscar @ hacia atrás
      let i = cursorPos - 1
      while (i >= 0 && /[a-zA-Z0-9_]/.test(text[i])) i--

      if (i >= 0 && text[i] === '@') {
        // Encontrar final de la palabra
        let j = cursorPos
        while (j < text.length && /[a-zA-Z0-9_]/.test(text[j])) j++
        
        const searchTerm = text.substring(i + 1, j)
        const pos = getCursorPosition(textarea)
        
        if (pos) {
          setMentionPosition(pos)
          setMentionSearch(searchTerm)
          setShowMentions(true)

          if (mentionDebounce.current) clearTimeout(mentionDebounce.current)
          mentionDebounce.current = setTimeout(() => {
            searchUsers(searchTerm)
          }, 200)
        }
      } else {
        setShowMentions(false)
      }
    }

    textarea.addEventListener('input', handleInput)
    textarea.addEventListener('keyup', handleInput)
    textarea.addEventListener('scroll', () => setShowMentions(false))
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setShowMentions(false)
    })

    return () => {
      textarea.removeEventListener('input', handleInput)
      textarea.removeEventListener('keyup', handleInput)
      textarea.removeEventListener('scroll', () => setShowMentions(false))
    }
  }, [])

  // Cerrar al hacer scroll en la página
  useEffect(() => {
    if (!showMentions) return

    const handleScroll = () => {
      setShowMentions(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showMentions])

  const searchUsers = async (query: string) => {
    if (query.length < 1) {
      setMentionUsers([])
      return
    }

    setLoadingMentions(true)
    try {
      const res = await fetch(`/api/mentions/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setMentionUsers(data.users || [])
    } catch (error) {
      console.error('Error searching users:', error)
      setMentionUsers([])
    } finally {
      setLoadingMentions(false)
    }
  }

  const insertMention = (username: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const text = textarea.value

    let i = cursorPos - 1
    while (i >= 0 && /[a-zA-Z0-9_]/.test(text[i])) i--

    if (i >= 0 && text[i] === '@') {
      const newText = text.substring(0, i + 1) + username + ' ' + text.substring(cursorPos)
      setReview(newText)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(i + 1 + username.length + 1, i + 1 + username.length + 1)
      }, 0)
    }

    setShowMentions(false)
  }

  const handleCloseMentions = useCallback(() => {
    setShowMentions(false)
  }, [])

  const handleSave = async () => {
    if (!canSave || isSaving) return
    setIsSaving(true)
    try {
      await onSave({ score, status, review, isSpoiler })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    if (!confirm('¿Estás seguro de que quieres eliminar tu reseña? Esta acción no se puede deshacer.')) return
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-display font-medium tracking-[0.2em] uppercase text-[#00d4ff]/70">
          MI VALORACIÓN
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        {hasExistingReview && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
            ✏️ Editando
          </span>
        )}
      </div>

      {/* Fila de estrellas y fecha */}
      <div className="flex items-center justify-between py-2">
        <StarRating value={score} onChange={setScore} />
        
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
        >
          <Calendar size={16} className="text-[#00d4ff]" strokeWidth={1.5} />
          <span className="text-xs text-white/70">
            {startDate && endDate 
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : 'Añadir fecha'}
          </span>
        </button>
      </div>

      {showDatePicker && (
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Estados con iconos y tooltips */}
      <div className="grid grid-cols-6 gap-3">
        {STATUSES(mediaType).map((s) => {
          const isActive = status === s.id
          const Icon = s.icon
          
          return (
            <div
              key={s.id}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredStatus(s.id)}
              onMouseLeave={() => setHoveredStatus(null)}
            >
              <motion.button
                onClick={() => setStatus(isActive ? '' : s.id)}
                className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: isActive ? `${s.color}15` : 'transparent',
                  border: `1px solid ${isActive ? s.color : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isActive ? `0 0 15px ${s.color}30` : 'none',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  style={{
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    filter: isActive ? `drop-shadow(0 0 5px ${s.color})` : 'none',
                  }}
                />
              </motion.button>

              <AnimatePresence>
                {hoveredStatus === s.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-md whitespace-nowrap z-50"
                    style={{
                      background: `${s.color}20`,
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${s.color}40`,
                    }}
                  >
                    <span className="text-[10px] font-bold tracking-wider" style={{ color: s.color }}>
                      {s.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Área de texto con menciones */}
      <div className="relative group">
        <div className="absolute inset-0 bg-[#1a8fa8]/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        
        <MentionsDropdown
          isOpen={showMentions}
          position={mentionPosition}
          users={mentionUsers}
          onSelect={insertMention}
          searchTerm={mentionSearch}
          isLoading={loadingMentions}
          onClose={handleCloseMentions}
        />

        <textarea
          ref={textareaRef}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="¿Qué te ha parecido? (opcional) — Usa @ para mencionar usuarios"
          rows={4}
          className="relative w-full px-4 py-3 rounded-xl text-white placeholder-white/30 
                     bg-[#0d1428]/40 border border-white/5 
                     focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20
                     transition-all duration-300 resize-none"
          style={{
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 30px -15px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)'
          }}
        />
        
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/20">
          <AtSign size={12} strokeWidth={1.5} />
          <span className="text-[9px]">menciona</span>
        </div>

        {review && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setReview('')}
            className="absolute top-2 right-2 p-1 rounded-full bg-[#1e6fa8]/50 border border-white/10 hover:bg-[#1e6fa8] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </motion.button>
        )}
      </div>

      {/* Spoiler */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={() => setIsSpoiler(!isSpoiler)}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300
                       ${isSpoiler 
                         ? 'bg-[#ff6eb4] border-[#ff6eb4]' 
                         : 'bg-[#0d1428]/50 border-white/10 group-hover:border-white/20'
                       }`}
            style={{ boxShadow: isSpoiler ? '0 0 15px #ff6eb4' : 'none' }}
          >
            {isSpoiler && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white text-xs">
                ✓
              </motion.span>
            )}
          </div>
        </motion.button>
        <span className="text-sm text-white/50">⚠️ Contiene spoilers</span>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <motion.button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="relative w-fit px-4 py-2 rounded-lg font-medium text-white overflow-hidden group
                     disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={canSave && !isSaving ? { scale: 1.01, y: -1 } : {}}
          whileTap={canSave && !isSaving ? { scale: 0.99 } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#4e4aa7]/90 to-[#cb78bb]/90" />
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ x: '-100%', opacity: 0.1 }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
          <span className="relative z-10 text-sm tracking-wide">
            {isSaving ? 'Guardando...' : hasExistingReview ? 'Actualizar' : 'Guardar'}
          </span>
        </motion.button>

        {hasExistingReview && onDelete && (
          <motion.button
            onClick={handleDelete}
            disabled={isDeleting}
            className="relative w-fit px-4 py-2 rounded-lg font-medium text-[#ff6eb4]/80 overflow-hidden group
                       disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            style={{
              background: 'rgba(255,110,180,0.1)',
              border: '1px solid rgba(255,110,180,0.2)'
            }}
          >
            <motion.div
              className="absolute inset-0 bg-[#ff6eb4]/10"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <span className="relative z-10 flex items-center gap-1 text-xs">
              <Trash2 size={14} strokeWidth={1.5} />
              {isDeleting ? '...' : 'Eliminar'}
            </span>
          </motion.button>
        )}
      </div>
    </section>
  )
}