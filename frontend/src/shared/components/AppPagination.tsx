import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AppPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  activeBg?: string
  activeText?: string
  className?: string
}

function buildPages(current: number, total: number): (number | 'ellipsis-l' | 'ellipsis-r')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

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
  onPageChange,
  activeBg,
  activeText,
  className,
}: AppPaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPages(currentPage, totalPages)

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, i) => {
        if (page === 'ellipsis-l' || page === 'ellipsis-r') {
          return (
            <span key={page} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">
              …
            </span>
          )
        }

        const isActive = page === currentPage
        return (
          <button
            key={i}
            onClick={() => onPageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'w-9 h-9 rounded-xl text-sm font-medium transition-colors border',
              isActive
                ? 'border-transparent'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
            style={
              isActive
                ? { backgroundColor: activeBg || '#111827', color: activeText || '#ffffff' }
                : undefined
            }
          >
            {page}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
