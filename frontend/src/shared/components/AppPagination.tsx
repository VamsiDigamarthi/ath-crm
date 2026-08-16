import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AppPaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  perPageOptions?: number[]
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  activeBg?: string
  activeText?: string
  className?: string
}

function buildPages(current: number, total: number): (number | 'ellipsis-l' | 'ellipsis-r')[] {
  if (total <= 7) return Array.from({ length: Math.max(total, 1) }, (_, i) => i + 1)

  const left  = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  const pages: (number | 'ellipsis-l' | 'ellipsis-r')[] = [1]

  if (left > 2)          pages.push('ellipsis-l')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < total - 1) pages.push('ellipsis-r')
  if (total > 1)         pages.push(total)

  return pages
}

export function AppPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  perPageOptions = [5, 10, 20, 50],
  onPageChange,
  onPerPageChange,
  activeBg = '#16A34A',
  activeText = '#ffffff',
  className,
}: AppPaginationProps) {
  const pages = buildPages(currentPage, Math.max(totalPages, 1))

  const startItem = totalItems !== undefined && totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = totalItems !== undefined ? Math.min(currentPage * itemsPerPage, totalItems) : 0

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600', className)}>
      {/* 1. Left: Summary Info */}
      <div className="flex items-center gap-1.5 font-medium text-slate-500">
        {totalItems !== undefined ? (
          <span>
            Showing <strong className="text-slate-900 font-bold">{startItem}</strong> to <strong className="text-slate-900 font-bold">{endItem}</strong> of <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{Math.max(totalPages, 1)}</strong>
          </span>
        )}
      </div>

      {/* 2. Center & Right: Items Per Page & Page Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Rows per page selector */}
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] cursor-pointer"
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page Nav Buttons */}
        {totalPages > 1 && (
          <nav className="flex items-center gap-1" aria-label="Pagination Navigation">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>

            {pages.map((page, i) => {
              if (page === 'ellipsis-l' || page === 'ellipsis-r') {
                return (
                  <span key={`${page}-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs select-none">
                    …
                  </span>
                )
              }

              const isActive = page === currentPage
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-bold transition-all border cursor-pointer',
                    isActive
                      ? 'border-transparent shadow-2xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                  style={
                    isActive
                      ? { backgroundColor: activeBg, color: activeText }
                      : undefined
                  }
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </nav>
        )}
      </div>
    </div>
  )
}
