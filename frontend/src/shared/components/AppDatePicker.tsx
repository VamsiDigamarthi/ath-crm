import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CalendarHeader } from './datepicker/CalendarHeader'
import { CalendarGrid } from './datepicker/CalendarGrid'
import {
  formatDate, addMonths, isSameDay, isBeforeDay,
  MONTH_NAMES,
} from './datepicker/utils'
import type { AppDatePickerProps } from './datepicker/types'
import type { ViewMode } from './datepicker/CalendarHeader'

const LABEL_SIZE = {
  xs: 'text-[11px] font-medium text-gray-600',
  sm: 'text-xs font-semibold text-gray-700',
  md: 'text-sm font-semibold text-gray-800',
}

export function AppDatePicker({
  mode = 'single',
  value,
  onChange,
  range,
  onRangeChange,
  minDate,
  maxDate,
  disabledDates,
  placeholder,
  format = 'dd/MM/yyyy',
  label,
  labelSize = 'sm',
  error,
  disabled,
  clearable = true,
  accentColor = '#6366f1',
}: AppDatePickerProps) {
  const today = new Date()

  const [open, setOpen]           = useState(false)
  const [rect, setRect]           = useState<DOMRect | null>(null)
  const [viewMode, setViewMode]   = useState<ViewMode>('days')
  const [yearStart, setYearStart] = useState(() => Math.floor(today.getFullYear() / 12) * 12)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [selectingEnd, setSelectingEnd] = useState(false)

  const initialRef = mode === 'single' ? (value ?? today) : (range?.start ?? today)
  const [calYear, setCalYear]   = useState(initialRef.getFullYear())
  const [calMonth, setCalMonth] = useState(initialRef.getMonth())

  const triggerRef = useRef<HTMLButtonElement>(null)
  const calRef     = useRef<HTMLDivElement>(null)

  function openCal() {
    if (disabled) return
    const r = triggerRef.current?.getBoundingClientRect()
    if (r) setRect(r)
    setOpen(true)
    setViewMode('days')
  }

  function closeCal() {
    setOpen(false)
    setHoverDate(null)
  }

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !calRef.current?.contains(e.target as Node)
      ) closeCal()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    function updateRect() {
      const r = triggerRef.current?.getBoundingClientRect()
      if (r) setRect(r)
    }
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [open])

  function handleDayClick(date: Date) {
    if (mode === 'single') {
      onChange?.(date)
      closeCal()
      return
    }
    if (!selectingEnd || !range?.start) {
      onRangeChange?.({ start: date, end: null })
      setSelectingEnd(true)
    } else {
      const start = range.start
      if (isSameDay(date, start)) {
        onRangeChange?.({ start: date, end: null })
        setSelectingEnd(false)
        return
      }
      if (isBeforeDay(date, start)) {
        onRangeChange?.({ start: date, end: start })
      } else {
        onRangeChange?.({ start, end: date })
      }
      setSelectingEnd(false)
      closeCal()
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (mode === 'single') {
      onChange?.(null)
    } else {
      onRangeChange?.({ start: null, end: null })
      setSelectingEnd(false)
    }
  }

  function navPrev() {
    if (viewMode === 'days') {
      const d = addMonths(new Date(calYear, calMonth, 1), -1)
      setCalYear(d.getFullYear()); setCalMonth(d.getMonth())
    } else if (viewMode === 'months') {
      setCalYear(y => y - 1)
    } else {
      setYearStart(y => y - 12)
    }
  }

  function navNext() {
    if (viewMode === 'days') {
      const d = addMonths(new Date(calYear, calMonth, 1), 1)
      setCalYear(d.getFullYear()); setCalMonth(d.getMonth())
    } else if (viewMode === 'months') {
      setCalYear(y => y + 1)
    } else {
      setYearStart(y => y + 12)
    }
  }

  function getDisplay(): string {
    if (mode === 'single') return value ? formatDate(value, format) : ''
    const s = range?.start ? formatDate(range.start, format) : ''
    const e = range?.end   ? formatDate(range.end, format)   : ''
    if (!s) return ''
    return e ? `${s} → ${e}` : `${s} → ...`
  }

  const display  = getDisplay()
  const hasValue = mode === 'single' ? !!value : !!range?.start

  const CAL_H = 368
  const CAL_W = 288
  const calStyle: React.CSSProperties = {}
  if (rect) {
    calStyle.position = 'fixed'
    calStyle.zIndex   = 9999
    calStyle.left = Math.max(8, Math.min(rect.left, window.innerWidth - CAL_W - 8))
    const spaceBelow = window.innerHeight - rect.bottom
    if (spaceBelow >= CAL_H + 8) {
      calStyle.top = rect.bottom + 6
    } else {
      calStyle.top = Math.max(8, rect.top - CAL_H - 6)
    }
  }

  const focusStyle: React.CSSProperties = open
    ? { borderColor: accentColor }
    : {}

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className={cn('tracking-tight', LABEL_SIZE[labelSize])}>
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={openCal}
        disabled={disabled}
        className={cn(
          'w-full h-10 flex items-center gap-2 px-3.5 bg-white rounded-xl border-[1.5px] text-xs transition-all cursor-pointer',
          error
            ? 'border-red-400'
            : 'border-gray-200 hover:border-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
        )}
        style={error ? { borderColor: '#f87171' } : focusStyle}
      >
        <CalendarDays
          size={14}
          className="shrink-0"
          style={{ color: display ? accentColor : '#9ca3af' }}
        />
        <span className={cn('flex-1 text-left truncate', display ? 'text-gray-800 font-medium' : 'text-gray-400')}>
          {display || (placeholder ?? (mode === 'single' ? 'Select a date' : 'Select date range'))}
        </span>
        {clearable && hasValue && (
          <X
            size={13}
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
          />
        )}
      </button>

      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}

      {open && createPortal(
        <div
          ref={calRef}
          style={{ ...calStyle, width: 288 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 select-none"
        >
          <CalendarHeader
            year={calYear}
            month={calMonth}
            viewMode={viewMode}
            yearRangeStart={yearStart}
            accentColor={accentColor}
            onPrev={navPrev}
            onNext={navNext}
            onClickMonth={() => setViewMode(v => v === 'months' ? 'days' : 'months')}
            onClickYear={() => setViewMode(v => v === 'years' ? 'days' : 'years')}
          />

          {viewMode === 'days' && (
            <CalendarGrid
              year={calYear}
              month={calMonth}
              today={today}
              selected={mode === 'single' ? (value ?? null) : null}
              rangeStart={mode === 'range' ? (range?.start ?? null) : null}
              rangeEnd={mode === 'range' ? (range?.end ?? null) : null}
              hoverDate={mode === 'range' ? hoverDate : null}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              accentColor={accentColor}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
            />
          )}

          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {MONTH_NAMES.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setCalMonth(i); setViewMode('days') }}
                  className={cn(
                    'py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer',
                    calMonth === i ? 'text-white' : 'text-gray-700 hover:bg-gray-100',
                  )}
                  style={calMonth === i ? { backgroundColor: accentColor } : undefined}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {viewMode === 'years' && (
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {Array.from({ length: 12 }, (_, i) => yearStart + i).map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { setCalYear(y); setViewMode('months') }}
                  className={cn(
                    'py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer',
                    calYear === y ? 'text-white' : 'text-gray-700 hover:bg-gray-100',
                  )}
                  style={calYear === y ? { backgroundColor: accentColor } : undefined}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {mode === 'range' && viewMode === 'days' && (
            <div className="mt-3 pt-2.5 border-t border-gray-100 text-center text-[11px] text-gray-400">
              {!range?.start
                ? 'Click a day to set start date'
                : selectingEnd && !range.end
                ? 'Now click an end date'
                : 'Range selected — click any day to restart'}
            </div>
          )}

          {(minDate || maxDate) && viewMode === 'days' && (
            <div className="mt-1 text-center text-[10px] text-gray-400">
              {minDate && maxDate
                ? `${formatDate(minDate, format)} – ${formatDate(maxDate, format)}`
                : minDate
                ? `From ${formatDate(minDate, format)}`
                : `Until ${formatDate(maxDate!, format)}`}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
