import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTH_NAMES } from './utils'

export type ViewMode = 'days' | 'months' | 'years'

interface Props {
  year: number
  month: number
  viewMode: ViewMode
  yearRangeStart: number
  accentColor?: string
  onPrev: () => void
  onNext: () => void
  onClickMonth: () => void
  onClickYear: () => void
}

export function CalendarHeader({ year, month, viewMode, yearRangeStart, accentColor: _accentColor, onPrev, onNext, onClickMonth, onClickYear }: Props) {
  return (
    <div className="flex items-center justify-between mb-3">
      <button
        type="button"
        onClick={onPrev}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
      >
        <ChevronLeft size={14} />
      </button>

      <div className="flex items-center gap-0.5">
        {viewMode === 'days' && (
          <>
            <button
              type="button"
              onClick={onClickMonth}
              className="text-sm font-semibold text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {MONTH_NAMES[month]}
            </button>
            <button
              type="button"
              onClick={onClickYear}
              className="text-sm font-semibold text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {year}
            </button>
          </>
        )}
        {viewMode === 'months' && (
          <button
            type="button"
            onClick={onClickYear}
            className="text-sm font-semibold text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {year}
          </button>
        )}
        {viewMode === 'years' && (
          <span className="text-sm font-semibold text-gray-900 px-2">
            {yearRangeStart} – {yearRangeStart + 11}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
