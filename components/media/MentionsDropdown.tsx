'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { AtSign } from 'lucide-react'

interface User {
  id: string
  username: string
  avatar_url: string | null
}

interface MentionsDropdownProps {
  isOpen: boolean
  position: { top: number; left: number }
  users: User[]
  onSelect: (username: string) => void
  searchTerm: string
  isLoading: boolean
  onClose: () => void
}

export default function MentionsDropdown({
  isOpen,
  position,
  users,
  onSelect,
  searchTerm,
  isLoading,
  onClose
}: MentionsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const DROPDOWN_WIDTH = 280
  const DROPDOWN_HEIGHT = 320
  const MARGIN = 10

  let finalTop = position.top
  let finalLeft = position.left

  // Ajustar horizontalmente
  if (finalLeft + DROPDOWN_WIDTH > window.innerWidth - MARGIN) {
    finalLeft = window.innerWidth - DROPDOWN_WIDTH - MARGIN
  }
  if (finalLeft < MARGIN) {
    finalLeft = MARGIN
  }

  // Ajustar verticalmente
  if (finalTop + DROPDOWN_HEIGHT > window.innerHeight - MARGIN) {
    finalTop = finalTop - DROPDOWN_HEIGHT - MARGIN
  }
  if (finalTop < MARGIN) {
    finalTop = MARGIN
  }

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${finalTop}px`,
        left: `${finalLeft}px`,
        zIndex: 999999,
        width: `${DROPDOWN_WIDTH}px`,
        outline: 'none',
      }}
    >
      <div
        className="bg-[#0d1428] rounded-xl shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AtSign size={16} color="#00d4ff" strokeWidth={1.5} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500' }}>
              Mencionar usuario
            </span>
            {searchTerm && (
              <span
                style={{
                  marginLeft: 'auto',
                  color: '#00d4ff',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                @{searchTerm}
              </span>
            )}
          </div>
        </div>

        {/* Lista de usuarios */}
        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  margin: '0 auto',
                  border: '2px solid rgba(0,212,255,0.2)',
                  borderTopColor: '#00d4ff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelect(user.username)
                  onClose()
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  color: 'white',
                  textAlign: 'left',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00d4ff20, #ff6eb420)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'rgba(255,255,255,0.9)',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: '400', color: 'rgba(255,255,255,0.9)' }}>
                  @{user.username}
                </span>
              </button>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '4px' }}>
                No hay usuarios
              </p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                prueba con otro término
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  )
}