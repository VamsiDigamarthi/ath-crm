import React, { useState, useEffect } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  Search,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

interface TableTopToolbarProps<TData> {
  table: Table<TData>;
  title?: string;
  subtitle?: string;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  searchPlaceholder?: string;
  onExportExcel?: () => void;
  totalEntries: number;
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  canPreviousPage: boolean;
  canNextPage: boolean;
  extraActions?: React.ReactNode;
}

export function TableTopToolbar<TData>({
  table,
  title,
  subtitle,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = 'Search...',
  onExportExcel,
  totalEntries,
  pageSize,
  pageIndex,
  pageCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  canPreviousPage,
  canNextPage,
  extraActions,
}: TableTopToolbarProps<TData>) {
  const [localSearch, setLocalSearch] = useState(globalFilter ?? '');

  // Keep local search in sync if globalFilter changed externally
  useEffect(() => {
    setLocalSearch(globalFilter ?? '');
  }, [globalFilter]);

  // Debounce search changes by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (globalFilter ?? '')) {
        onGlobalFilterChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, globalFilter, onGlobalFilterChange]);

  const startEntry = totalEntries === 0 ? 0 : pageIndex * pageSize + 1;
  const endEntry = Math.min((pageIndex + 1) * pageSize, totalEntries);

  // Generate clean pagination numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (pageCount <= 7) {
      for (let i = 0; i < pageCount; i++) pages.push(i);
    } else {
      if (pageIndex < 3) {
        pages.push(0, 1, 2, 3, '...', pageCount - 1);
      } else if (pageIndex > pageCount - 4) {
        pages.push(0, '...', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1);
      } else {
        pages.push(0, '...', pageIndex - 1, pageIndex, pageIndex + 1, '...', pageCount - 1);
      }
    }
    return pages;
  };

  const columns = table.getAllLeafColumns().filter((c) => c.id !== 'select' && c.id !== 'actions' && c.id !== 'action');

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Page Title & Subtitle Header */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            {title && (
              <h1 className="text-base sm:text-lg font-bold text-zinc-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-500 font-normal mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {extraActions && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {extraActions}
            </div>
          )}
        </div>
      )}

      {/* 2. Top Controls Row: Search Input & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Global Search Input with 300ms debounce */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white hover:bg-zinc-50/80 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400 font-normal shadow-2xs"
          />
        </div>

        {/* Right: Columns Toggle & Export Excel */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Columns Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                <span>Columns</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-zinc-200">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize text-xs cursor-pointer"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download Excel Button */}
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Download Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Status Bar with Entries count & Top Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-zinc-500">
        {/* Showing Entries & Rows Per Page */}
        <div className="flex items-center gap-3">
          <span className="font-normal text-zinc-600">
            Showing <strong className="font-semibold text-zinc-900">{startEntry}</strong> to{' '}
            <strong className="font-semibold text-zinc-900">{endEntry}</strong> of{' '}
            <strong className="font-semibold text-zinc-900">{totalEntries}</strong> entries
          </span>

          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200">
            <span className="text-[11px] font-medium text-zinc-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="px-2 py-0.5 text-xs bg-white border border-zinc-200 rounded-md font-medium text-zinc-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#16A34A] shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!canPreviousPage}
            aria-label="Previous page"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="w-6 text-center text-xs text-zinc-400">
                  ...
                </span>
              );
            }
            const isCurrent = p === pageIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer shadow-2xs ${
                  isCurrent
                    ? 'bg-zinc-900 text-white font-medium shadow-xs'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-normal'
                }`}
              >
                {Number(p) + 1}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canNextPage}
            aria-label="Next page"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
