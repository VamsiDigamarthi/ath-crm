import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import {
  getDaysInMonth, getFirstDayOfWeek,
  isSameDay, isBeforeDay, isAfterDay, isBetweenDays,
  hexToRgb, DAY_NAMES,
} from './utils'

interface Props {
  year: number
  month: number
  today: Date
  // single mode
  selected: Date | null
  // range mode
  rangeStart: Date | null
  rangeEnd: Date | null
  hoverDate: Date | null
  // constraints
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  accentColor: string
  onDayClick: (d: Date) => void
  onDayHover: (d: Date | null) => void
}

export function CalendarGrid({
  year, month, today, selected,
  rangeStart, rangeEnd, hoverDate,
  minDate, maxDate, disabledDates = [],
  accentColor, onDayClick, onDayHover,
}: Props) {
  const rgb = hexToRgb(accentColor)
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const prevMonthDays = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)

  // Build 42-cell grid (6 rows × 7 cols)
  const cells: { date: Date; current: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const pm = month === 0 ? 11 : month - 1
    const py = month === 0 ? year - 1 : year
    cells.push({ date: new Date(py, pm, prevMonthDays - i), current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nm = month === 11 ? 0 : month + 1
    const ny = month === 11 ? year + 1 : year
    cells.push({ date: new Date(ny, nm, d), current: false })
  }

  // Effective range end (confirmed or hover preview)
  const effectiveEnd = rangeEnd ?? hoverDate

  // Normalise range so start <= end
  const [normStart, normEnd] = (() => {
    if (!rangeStart || !effectiveEnd) return [rangeStart, effectiveEnd]
    return isBeforeDay(rangeStart, effectiveEnd)
      ? [rangeStart, effectiveEnd]
      : [effectiveEnd, rangeStart]
  })()

  function isDisabled(date: Date) {
    if (minDate && isBeforeDay(date, minDate)) return true
    if (maxDate && isAfterDay(date, maxDate)) return true
    return disabledDates.some(d => isSameDay(d, date))
  }

  return (
    <>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {cells.map(({ date, current }, idx) => {
          const disabled  = isDisabled(date)
          const isToday   = isSameDay(date, today)
          const isSel     = !!(selected && isSameDay(date, selected))
          const isRStart  = !!(normStart && isSameDay(date, normStart))
          const isREnd    = !!(normEnd && normStart && isSameDay(date, normEnd) && !isSameDay(date, normStart))
          const inRange   = !!(normStart && normEnd && isBetweenDays(date, normStart, normEnd))
          const isEndpoint = isRStart || isREnd || isSel

          // Strip background for range
          const wrapStyle: CSSProperties = {}
          if (inRange) {
            wrapStyle.backgroundColor = `rgba(${rgb}, 0.1)`
          } else if (isRStart && normEnd) {
            wrapStyle.backgroundImage = `linear-gradient(to right, transparent 50%, rgba(${rgb}, 0.1) 50%)`
          } else if (isREnd) {
            wrapStyle.backgroundImage = `linear-gradient(to left, transparent 50%, rgba(${rgb}, 0.1) 50%)`
          }

          // Circle style
          const circleStyle: CSSProperties = {}
          if (isEndpoint) {
            circleStyle.backgroundColor = accentColor
            circleStyle.color = '#ffffff'
          } else if (isToday) {
            circleStyle.outline = `2px solid ${accentColor}`
            circleStyle.outlineOffset = '-2px'
          }

          return (
            <div key={idx} style={wrapStyle} className="h-9 flex items-center justify-center">
              <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onDayClick(date)}
                onMouseEnter={() => onDayHover(date)}
                onMouseLeave={() => onDayHover(null)}
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-100',
                  disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                  !isEndpoint && !disabled && current ? 'hover:bg-gray-100' : '',
                  !current ? 'text-gray-300' : isEndpoint ? '' : 'text-gray-700',
                  isToday && !isEndpoint ? 'font-bold' : '',
                )}
                style={circleStyle}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
