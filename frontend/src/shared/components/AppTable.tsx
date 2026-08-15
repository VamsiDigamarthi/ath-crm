import { useState } from 'react'
import { Search, X, ArrowUp, ArrowDown, ArrowUpDown, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppPagination, type AppPaginationProps } from './AppPagination'

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T
  render?: (item: T, index: number) => React.ReactNode
  sortable?: boolean
  headerClassName?: string
  cellClassName?: string
  width?: string
}

export interface TablePaginationProps extends AppPaginationProps {
  totalItems?: number
  itemsPerPage?: number
  perPageOptions?: number[]
  onPerPageChange?: (perPage: number) => void
}

export type TableDensity = 'compact' | 'comfortable' | 'spacious'

export interface AppTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[]
  data: T[]
  title?: string
  description?: string
  isLoading?: boolean
  skeletonRows?: number
  searchable?: boolean
  searchPlaceholder?: string
  striped?: boolean
  stickyHeader?: boolean
  density?: TableDensity
  selectable?: boolean
  onSelectionChange?: (selected: T[]) => void
  onRowClick?: (item: T, index: number) => void
  exportable?: boolean
  exportFilename?: string
  emptyText?: string
  className?: string
  pagination?: TablePaginationProps
  rowClassName?: (item: T, index: number) => string | undefined
}

const DENSITY_CELL: Record<TableDensity, string> = {
  compact:     'px-5 py-2',
  comfortable: 'px-6 py-4',
  spacious:    'px-6 py-5',
}
const DENSITY_HEAD: Record<TableDensity, string> = {
  compact:     'px-5 py-2.5',
  comfortable: 'px-6 py-3.5',
  spacious:    'px-6 py-4',
}

export function AppTable<T extends Record<string, unknown>>({
  columns,
  data,
  title,
  description,
  isLoading = false,
  skeletonRows = 5,
  searchable = false,
  searchPlaceholder = 'Search...',
  striped = false,
  stickyHeader = false,
  density = 'comfortable',
  selectable = false,
  onSelectionChange,
  onRowClick,
  exportable = false,
  exportFilename = 'export',
  emptyText = 'No data available.',
  className,
  pagination,
  rowClassName,
}: AppTableProps<T>) {

  const [search, setSearch]       = useState('')
  const [sortKey, setSortKey]     = useState<keyof T | null>(null)
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected]   = useState<Set<number>>(new Set())

  // Filter
  const filtered = searchable && search.trim()
    ? data.filter((item) =>
        Object.values(item).some((v) =>
          String(v ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data

  // Sort
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String(a[sortKey] ?? '')
        const bv = String(b[sortKey] ?? '')
        const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : filtered

  const displayData = sorted

  // Selection helpers
  const allSelected = displayData.length > 0 && selected.size === displayData.length
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const next = new Set(displayData.map((_, i) => i))
      setSelected(next)
      onSelectionChange?.(displayData)
    }
  }

  const toggleRow = (i: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = new Set(selected)
    if (next.has(i)) next.delete(i); else next.add(i)
    setSelected(next)
    onSelectionChange?.(Array.from(next).map((idx) => displayData[idx]))
  }

  // Sort toggle
  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable || !col.accessorKey) return
    if (sortKey === col.accessorKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.accessorKey)
      setSortDir('asc')
    }
  }

  // CSV export
  const handleExport = () => {
    const exportCols = columns.filter((c) => c.accessorKey)
    const headers = exportCols.map((c) => c.header)
    const rows = data.map((item) =>
      exportCols.map((c) => {
        const val = item[c.accessorKey!]
        const str = String(val ?? '')
        return str.includes(',') ? `"${str}"` : str
      })
    )
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showHeader = !!(title || description || searchable || exportable)
  const cellPad    = DENSITY_CELL[density]
  const headPad    = DENSITY_HEAD[density]

  return (
    <div className={cn('w-full bg-white rounded-2xl border border-gray-200 overflow-hidden', className)}>

      {/* ── Header ── */}
      {showHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4 flex-wrap">
          <div className="min-w-0">
            {title && <h2 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(new Set()) }}
                  placeholder={searchPlaceholder}
                  className="h-9 pl-9 pr-8 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 w-52 transition-colors"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {exportable && (
              <button
                type="button"
                onClick={handleExport}
                className="h-9 flex items-center gap-1.5 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selection banner */}
      {selectable && selected.size > 0 && (
        <div className="flex items-center justify-between px-6 py-2.5 bg-indigo-50 border-b border-indigo-100">
          <span className="text-sm font-medium text-indigo-700">
            {selected.size} row{selected.size > 1 ? 's' : ''} selected
          </span>
          <button type="button" onClick={() => { setSelected(new Set()); onSelectionChange?.([]) }}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer">
            Clear
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="bg-slate-100/90 border-b border-slate-200">
              {/* Select-all checkbox */}
              {selectable && (
                <th className={cn(headPad, 'border-b border-slate-200 w-10')}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col, i) => {
                const isSorted = sortKey === col.accessorKey
                return (
                  <th
                    key={i}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => handleSort(col)}
                    className={cn(
                      headPad,
                      'text-xs font-bold text-slate-700 border-b border-slate-200 select-none',
                      col.sortable && 'cursor-pointer hover:text-slate-900 transition-colors',
                      col.headerClassName,
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && (
                        isSorted
                          ? sortDir === 'asc'
                            ? <ArrowUp className="w-3 h-3 text-indigo-500 shrink-0" />
                            : <ArrowDown className="w-3 h-3 text-indigo-500 shrink-0" />
                          : <ArrowUpDown className="w-3 h-3 text-gray-300 shrink-0" />
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100/80">
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, ri) => (
                  <tr key={ri} className="animate-pulse">
                    {selectable && <td className={cellPad}><div className="w-4 h-4 bg-gray-100 rounded" /></td>}
                    {columns.map((_, ci) => (
                      <td key={ci} className={cellPad}>
                        <div className="h-4 bg-gray-100 rounded-md w-full max-w-[80%]" />
                      </td>
                    ))}
                  </tr>
                ))
              : displayData.length === 0
              ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selectable ? 1 : 0)}
                      className="px-6 py-10 text-center text-gray-400 text-sm"
                    >
                      {search ? `No results for "${search}"` : emptyText}
                    </td>
                  </tr>
                )
              : displayData.map((item, ri) => {
                  const isSelected = selected.has(ri)
                  return (
                    <tr
                      key={ri}
                      onClick={() => onRowClick?.(item, ri)}
                      className={cn(
                        'transition-colors',
                        onRowClick && 'cursor-pointer',
                        isSelected
                          ? 'bg-indigo-50/60'
                          : striped && ri % 2 !== 0
                            ? 'bg-gray-50/50 hover:bg-blue-50/20'
                            : 'hover:bg-blue-50/20',
                        rowClassName?.(item, ri)
                      )}
                    >
                      {selectable && (
                        <td className={cellPad} onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isSelected} onChange={(e) => toggleRow(ri, e as unknown as React.MouseEvent)} />
                        </td>
                      )}
                      {columns.map((col, ci) => (
                        <td key={ci} className={cn(cellPad, col.cellClassName)}>
                          {col.render
                            ? col.render(item, ri)
                            : col.accessorKey !== undefined
                              ? (item[col.accessorKey] as React.ReactNode)
                              : null}
                        </td>
                      ))}
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ── */}
      {pagination && (
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-white gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {pagination.perPageOptions && pagination.perPageOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Rows per page</span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => pagination.onPerPageChange?.(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 cursor-pointer bg-white"
                >
                  {pagination.perPageOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            {pagination.totalItems !== undefined && pagination.itemsPerPage !== undefined && (
              <p className="text-sm text-gray-500 hidden sm:block whitespace-nowrap">
                Showing{' '}
                <span className="font-medium text-gray-900">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-gray-900">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium text-gray-900">{pagination.totalItems}</span> results
              </p>
            )}
          </div>

          <AppPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            activeBg={pagination.activeBg}
            activeText={pagination.activeText}
          />
        </div>
      )}
    </div>
  )
}

// ── Internal Checkbox ──────────────────────────────────────────────────────
function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => { if (el) el.indeterminate = !!indeterminate }}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer accent-indigo-600"
      />
    </label>
  )
}
