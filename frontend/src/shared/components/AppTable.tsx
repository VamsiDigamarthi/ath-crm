import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Download } from 'lucide-react'
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
  selectedRows?: T[]
  rowKey?: keyof T | ((item: T) => string | number)
  isRowSelectable?: (item: T, index: number) => boolean
  onSelectionChange?: (selected: T[]) => void
  onRowClick?: (item: T, index: number) => void
  exportable?: boolean
  exportFilename?: string
  emptyText?: string
  emptyMessage?: React.ReactNode
  emptyContent?: React.ReactNode
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
  selectedRows,
  rowKey,
  isRowSelectable,
  onSelectionChange,
  onRowClick,
  exportable = false,
  exportFilename = 'export',
  emptyText = 'No data available.',
  emptyMessage,
  emptyContent,
  className,
  pagination,
  rowClassName,
}: AppTableProps<T>) {

  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<Set<number>>(new Set())

  // Filter
  const filtered = searchable && search.trim()
    ? data.filter((item) =>
        Object.values(item).some((v) =>
          String(v ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data

  const displayData = filtered

  const getItemKey = useCallback((item: T, idx: number): string | number => {
    if (rowKey) {
      return typeof rowKey === 'function' ? rowKey(item) : (item[rowKey] as string | number) ?? idx
    }
    return (item.id as string | number) ?? idx
  }, [rowKey])

  // Compute indices of only rows that are eligible for selection
  const selectableIndices = useMemo(() => {
    return displayData
      .map((item, idx) => (!isRowSelectable || isRowSelectable(item, idx) ? idx : -1))
      .filter((idx) => idx !== -1)
  }, [displayData, isRowSelectable])

  // Sync selection when selectedRows prop changes from parent
  useEffect(() => {
    if (selectedRows !== undefined) {
      const selectedKeySet = new Set(selectedRows.map((r, i) => getItemKey(r, i)))
      const nextSelected = new Set<number>()
      displayData.forEach((item, idx) => {
        const canSelect = !isRowSelectable || isRowSelectable(item, idx)
        if (canSelect && selectedKeySet.has(getItemKey(item, idx))) {
          nextSelected.add(idx)
        }
      })
      setSelected(nextSelected)
    }
  }, [selectedRows, displayData, getItemKey, isRowSelectable])

  // Selection helpers
  const allSelected = selectableIndices.length > 0 && selectableIndices.every((idx) => selected.has(idx))
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const next = new Set(selectableIndices)
      setSelected(next)
      onSelectionChange?.(selectableIndices.map((idx) => displayData[idx]))
    }
  }

  const toggleRow = (i: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const canSelect = !isRowSelectable || isRowSelectable(displayData[i], i)
    if (!canSelect) return

    const next = new Set(selected)
    if (next.has(i)) next.delete(i); else next.add(i)
    setSelected(next)
    onSelectionChange?.(Array.from(next).map((idx) => displayData[idx]))
  }


  // CSV export
  const exportCsv = () => {
    const headers = columns.map((c) => c.header).join(',')
    const rows = displayData.map((item) =>
      columns
        .map((c) => {
          const val = c.accessorKey ? item[c.accessorKey] : ''
          return `"${String(val ?? '').replace(/"/g, '""')}"`
        })
        .join(',')
    )
    const blob = new Blob([`${headers}\n${rows.join('\n')}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalCols = columns.length + (selectable ? 1 : 0)

  return (
    <div className={cn('bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col', className)}>
      {/* Top Header toolbar */}
      {(title || description || searchable || exportable) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900 leading-tight">{title}</h3>}
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {searchable && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] focus:bg-white transition-all placeholder:text-slate-400 text-slate-900 w-56 sm:w-72 shadow-2xs"
                />
              </div>
            )}

            {exportable && (
              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Action Indicator Banner */}
      {selectable && selected.size > 0 && (
        <div className="flex items-center justify-between px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 text-xs text-emerald-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span><strong>{selected.size}</strong> {selected.size === 1 ? 'row' : 'rows'} selected</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(new Set())
              onSelectionChange?.([])
            }}
            className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn('border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold text-gray-500 uppercase tracking-wider', stickyHeader && 'sticky top-0 z-10 bg-gray-50 shadow-xs')}>
              {selectable && (
                <th className={cn(DENSITY_HEAD[density], 'w-10 text-center')}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    disabled={selectableIndices.length === 0}
                    ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAll}
                    aria-label="Select all eligible rows"
                    className={cn(
                      "w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500",
                      selectableIndices.length === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                    )}
                  />
                </th>
              )}

              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    DENSITY_HEAD[density],
                    col.headerClassName
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {selectable && (
                    <td className={cn(DENSITY_CELL[density], 'text-center')}>
                      <div className="w-4 h-4 bg-gray-200 rounded mx-auto" />
                    </td>
                  )}
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className={DENSITY_CELL[density]}>
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-6 py-8 text-center text-gray-400">
                  {emptyMessage || emptyContent || emptyText}
                </td>
              </tr>
            ) : (
              displayData.map((item, rowIdx) => {
                const isChecked = selected.has(rowIdx)
                const isSelectable = !isRowSelectable || isRowSelectable(item, rowIdx)
                return (
                  <tr
                    key={rowIdx}
                    onClick={() => onRowClick?.(item, rowIdx)}
                    className={cn(
                      'transition-colors',
                      striped && rowIdx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white',
                      isChecked ? 'bg-emerald-50/40' : 'hover:bg-gray-50/80',
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(item, rowIdx)
                    )}
                  >
                    {selectable && (
                      <td
                        className={cn(
                          DENSITY_CELL[density],
                          'w-10 text-center',
                          !isSelectable && 'cursor-not-allowed'
                        )}
                        onClick={(e) => {
                          if (isSelectable) {
                            toggleRow(rowIdx, e)
                          } else {
                            e.stopPropagation()
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!isSelectable}
                          onChange={() => {}}
                          title={!isSelectable ? 'Already assigned to staff' : `Select row ${rowIdx + 1}`}
                          aria-label={`Select row ${rowIdx + 1}`}
                          className={cn(
                            "w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500",
                            isSelectable ? "cursor-pointer" : "opacity-30 cursor-not-allowed bg-gray-100 border-gray-200"
                          )}
                        />
                      </td>
                    )}


                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn(DENSITY_CELL[density], col.cellClassName)}
                      >
                        {col.render
                          ? col.render(item, rowIdx)
                          : col.accessorKey
                          ? String(item[col.accessorKey] ?? '')
                          : ''}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="px-6 py-3.5 border-t border-gray-100 bg-white">
          <AppPagination {...pagination} />
        </div>
      )}
    </div>
  )
}
