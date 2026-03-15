'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DatePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onClose: () => void
}

export default function DatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClose,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (selecting === 'start') {
      onStartDateChange(selectedDate)
      setSelecting('end')
    } else {
      onEndDateChange(selectedDate)
      setSelecting('start')
    }
  }

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

  const days = []
  const totalDays = daysInMonth(currentMonth)
  const firstDay = firstDayOfMonth(currentMonth)

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const isSelected = 
      (startDate && date.toDateString() === startDate.toDateString()) ||
      (endDate && date.toDateString() === endDate.toDateString())
    const isInRange = startDate && endDate && date > startDate && date < endDate

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`w-8 h-8 rounded-full text-xs transition-all flex items-center justify-center
          ${isSelected 
            ? 'bg-[#00d4ff] text-white font-bold' 
            : isInRange
            ? 'bg-[#00d4ff]/20 text-white'
            : 'hover:bg-white/10 text-white/70'
          }`}
      >
        {day}
      </button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute z-50 bg-[#0d1428]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
        style={{ minWidth: '300px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className="text-[#00d4ff]" strokeWidth={1.5} />
            <span className="text-xs font-medium text-white/60">
              {selecting === 'start' ? 'Selecciona inicio' : 'Selecciona fin'}
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/60">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-white/10">
            <ChevronLeft size={16} className="text-white/60" />
          </button>
          <span className="text-sm font-medium text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1 rounded-full hover:bg-white/10">
            <ChevronRight size={16} className="text-white/60" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="w-8 h-8 flex items-center justify-center text-[10px] text-white/30 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* Selected dates display */}
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40">
          <div className="flex justify-between">
            <span>Inicio:</span>
            <span className="text-white">
              {startDate ? startDate.toLocaleDateString() : '—'}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Fin:</span>
            <span className="text-white">
              {endDate ? endDate.toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}