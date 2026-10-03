import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { TableTopToolbar } from './TableTopToolbar';
import { ColumnHeaderMenu } from './ColumnHeaderMenu';

export interface ServerPaginationProps {
  currentPage: number; // 1-based
  totalPages: number;
  totalEntries: number;
  pageSize?: number;
  onPageChange: (page: number) => void; // 1-based
  onPageSizeChange?: (size: number) => void;
}

export interface UnifiedTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  skeletonRows?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  serverPagination?: ServerPaginationProps;
  onExportExcel?: () => void;
  onRowClick?: (item: TData, index: number) => void;
  rowKey?: (item: TData) => string | number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  emptyText?: string;
  emptyContent?: React.ReactNode;
  extraHeaderActions?: React.ReactNode;
  enableSelection?: boolean;
  isRowSelectable?: (item: TData, index: number) => boolean;
  selectedRows?: TData[];
  onSelectionChange?: (rows: TData[]) => void;
  className?: string;
}

export function UnifiedTable<TData extends Record<string, any>>({
  columns,
  data,
  title,
  subtitle,
  isLoading = false,
  skeletonRows = 8,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  serverPagination,
  onExportExcel,
  onRowClick,
  rowKey,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  emptyText = 'No records found.',
  emptyContent,
  extraHeaderActions,
  enableSelection = false,
  isRowSelectable,
  selectedRows,
  onSelectionChange,
  className = '',
}: UnifiedTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [clientGlobalFilter, setClientGlobalFilter] = useState<string>('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [clientPagination, setClientPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const isServerPaged = Boolean(serverPagination);
  const isServerSearch = Boolean(onSearchChange);

  // Consistent ID resolver across data and selectedRows
  const getItemId = (item: TData, fallbackIdx: number): string => {
    if (rowKey) return String(rowKey(item));
    const rawId = (item as any).id ?? (item as any).applicationId ?? (item as any).customerId;
    if (rawId != null) return String(rawId);
    const dataIdx = data.indexOf(item);
    return String(dataIdx !== -1 ? dataIdx : fallbackIdx);
  };

  // Derive active selection synchronously from selectedRows prop or internal state
  const rowSelection = useMemo<RowSelectionState>(() => {
    if (!enableSelection) return {};
    if (selectedRows !== undefined) {
      const selection: RowSelectionState = {};
      selectedRows.forEach((item, idx) => {
        const id = getItemId(item, idx);
        if (id) {
          selection[id] = true;
        }
      });
      return selection;
    }
    return internalRowSelection;
  }, [enableSelection, selectedRows, data, rowKey, internalRowSelection]);

  // Active search value (controlled vs local)
  const currentGlobalFilter = isServerSearch ? (searchValue ?? '') : clientGlobalFilter;
  const handleGlobalFilterChange = (val: string) => {
    if (isServerSearch && onSearchChange) {
      onSearchChange(val);
    } else {
      setClientGlobalFilter(val);
    }
  };

  // Build final columns with optional selection checkbox
  const tableColumns = useMemo(() => {
    if (!enableSelection) return columns;

    const selectCol: ColumnDef<TData, any> = {
      id: 'select',
      header: ({ table }) => {
        const selectableRows = table.getRowModel().rows.filter((r) => r.getCanSelect());
        const isAllSelected = selectableRows.length > 0 && selectableRows.every((r) => r.getIsSelected());
        const isSomeSelected = !isAllSelected && selectableRows.some((r) => r.getIsSelected());

        const handleToggleAll = (e: React.MouseEvent | React.ChangeEvent) => {
          e.stopPropagation();
          if (isAllSelected) {
            if (onSelectionChange) onSelectionChange([]);
            setInternalRowSelection({});
          } else {
            const items = selectableRows.map((r) => r.original);
            if (onSelectionChange) onSelectionChange(items);
            const nextMap: RowSelectionState = {};
            selectableRows.forEach((r) => {
              nextMap[r.id] = true;
            });
            setInternalRowSelection(nextMap);
          }
        };

        return (
          <div className="w-8 flex items-center justify-center" onClick={handleToggleAll}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isSomeSelected;
                }
              }}
              onChange={handleToggleAll}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select all rows on page"
              className="w-3.5 h-3.5 rounded border-zinc-300 text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
            />
          </div>
        );
      },
      cell: ({ row }) => {
        const canSelect = row.getCanSelect();
        const isChecked = row.getIsSelected();

        const handleToggleRow = (e: React.MouseEvent | React.ChangeEvent) => {
          e.stopPropagation();
          if (!canSelect) return;

          const currentId = row.id;
          const isCurrentlySelected = Boolean(rowSelection[currentId]);

          if (selectedRows !== undefined && onSelectionChange) {
            let nextItems: TData[];
            if (isCurrentlySelected) {
              nextItems = selectedRows.filter((item, idx) => getItemId(item, idx) !== currentId);
            } else {
              nextItems = [...selectedRows, row.original];
            }
            onSelectionChange(nextItems);
          } else {
            const nextMap = { ...internalRowSelection, [currentId]: !isCurrentlySelected };
            if (isCurrentlySelected) delete nextMap[currentId];
            setInternalRowSelection(nextMap);
            if (onSelectionChange) {
              const selectedItems: TData[] = [];
              Object.keys(nextMap).forEach((k) => {
                if (nextMap[k]) {
                  const item = data.find((d, idx) => getItemId(d, idx) === k);
                  if (item) selectedItems.push(item);
                }
              });
              onSelectionChange(selectedItems);
            }
          }
        };

        return (
          <div
            className={`w-8 h-full flex items-center justify-center ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={handleToggleRow}
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={!canSelect}
              onChange={handleToggleRow}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select row ${row.index + 1}`}
              className={`w-3.5 h-3.5 rounded border-zinc-300 text-[#16A34A] focus:ring-[#16A34A] transition-colors ${
                canSelect ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };

    return [selectCol, ...columns];
  }, [columns, enableSelection, rowSelection, selectedRows, data, onSelectionChange]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter: isServerSearch ? undefined : clientGlobalFilter,
      columnVisibility,
      rowSelection,
      pagination: isServerPaged && serverPagination
        ? {
          pageIndex: Math.max(0, (serverPagination.currentPage || 1) - 1),
          pageSize: serverPagination.pageSize || 10,
        }
        : clientPagination,
    },
    manualPagination: isServerPaged,
    pageCount: isServerPaged && serverPagination ? serverPagination.totalPages : undefined,
    manualFiltering: false,
    enableRowSelection: (row) => {
      if (isRowSelectable) {
        return isRowSelectable(row.original, row.index);
      }
      return true;
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: isServerSearch ? undefined : setClientGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      if (selectedRows === undefined) {
        setInternalRowSelection(next);
      }
      if (onSelectionChange && selectedRows === undefined) {
        const selectedItems: TData[] = [];
        Object.keys(next).forEach((k) => {
          if (next[k]) {
            const item = data.find((d, idx) => getItemId(d, idx) === k);
            if (item) selectedItems.push(item);
          }
        });
        onSelectionChange(selectedItems);
      }
    },
    onPaginationChange: (updater) => {
      if (isServerPaged && serverPagination) {
        const next = typeof updater === 'function' ? updater({
          pageIndex: (serverPagination.currentPage || 1) - 1,
          pageSize: serverPagination.pageSize || 10,
        }) : updater;
        serverPagination.onPageChange(next.pageIndex + 1);
        if (serverPagination.onPageSizeChange && next.pageSize !== (serverPagination.pageSize || 10)) {
          serverPagination.onPageSizeChange(next.pageSize);
        }
      } else {
        setClientPagination(updater);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: isServerPaged ? undefined : getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    defaultColumn: {
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null) return true;
        const cellValue = row.getValue(columnId);

        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0) return true;
          return filterValue.some((val) => {
            if (typeof cellValue === 'boolean') {
              if (val === 'ACTIVE' || val === 'Active' || val === true || val === 'true') return cellValue === true;
              if (val === 'INACTIVE' || val === 'Inactive' || val === false || val === 'false') return cellValue === false;
            }
            if (cellValue == null) return val === '' || val === '(Empty)';
            const strVal = String(cellValue).toLowerCase().trim();
            const strFilter = String(val).toLowerCase().trim();
            return strVal === strFilter || strVal.includes(strFilter);
          });
        }

        if (typeof filterValue === 'string') {
          if (!filterValue.trim()) return true;
          if (cellValue == null) return false;
          return String(cellValue).toLowerCase().includes(filterValue.toLowerCase().trim());
        }

        return true;
      },
    },
    getRowId: (row, idx) => getItemId(row, idx),
  });

  const displayTotalEntries = isServerPaged && serverPagination
    ? serverPagination.totalEntries
    : table.getFilteredRowModel().rows.length;

  const displayPageIndex = isServerPaged && serverPagination
    ? Math.max(0, (serverPagination.currentPage || 1) - 1)
    : clientPagination.pageIndex;

  const displayPageSize = isServerPaged && serverPagination
    ? serverPagination.pageSize || 10
    : clientPagination.pageSize;

  const displayPageCount = isServerPaged && serverPagination
    ? Math.max(1, serverPagination.totalPages)
    : table.getPageCount();

  const handlePageChangeInternal = (new0PageIndex: number) => {
    if (isServerPaged && serverPagination) {
      serverPagination.onPageChange(new0PageIndex + 1);
    } else {
      table.setPageIndex(new0PageIndex);
    }
  };

  const handlePageSizeChangeInternal = (newSize: number) => {
    if (isServerPaged && serverPagination) {
      serverPagination.onPageSizeChange?.(newSize);
    } else {
      table.setPageSize(newSize);
    }
  };

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {/* 1. Top Controls & Pagination Toolbar */}
      <TableTopToolbar
        table={table}
        title={title}
        subtitle={subtitle}
        globalFilter={currentGlobalFilter}
        onGlobalFilterChange={handleGlobalFilterChange}
        searchPlaceholder={searchPlaceholder}
        onExportExcel={onExportExcel}
        totalEntries={displayTotalEntries}
        pageSize={displayPageSize}
        pageIndex={displayPageIndex}
        pageCount={displayPageCount}
        onPageChange={handlePageChangeInternal}
        onPageSizeChange={handlePageSizeChangeInternal}
        pageSizeOptions={pageSizeOptions}
        canPreviousPage={displayPageIndex > 0}
        canNextPage={displayPageIndex < displayPageCount - 1}
        extraActions={extraHeaderActions}
      />

      {/* 2. Main Slim Table Container */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-900 uppercase tracking-wider"
                >
                  {headerGroup.headers.map((header) => {
                    const isSelect = header.id === 'select';
                    const isAction = header.id === 'action' || header.id === 'actions';
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        className={`px-4 py-2.5 font-semibold text-zinc-900 select-none ${isSelect ? 'w-10 text-center px-2' : ''
                          }`}
                      >
                        {header.isPlaceholder ? null : isSelect ? (
                          flexRender(header.column.columnDef.header, header.getContext())
                        ) : isAction ? (
                          <div className="text-right">
                            {typeof header.column.columnDef.header === 'string'
                              ? header.column.columnDef.header
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        ) : typeof header.column.columnDef.header === 'string' ? (
                          <ColumnHeaderMenu
                            column={header.column}
                            title={header.column.columnDef.header}
                          />
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} className="animate-pulse">
                    {table.getVisibleLeafColumns().map((col) => (
                      <td key={col.id} className="px-4 py-3">
                        <div className="h-3.5 bg-zinc-100 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getVisibleLeafColumns().length}
                    className="px-6 py-12 text-center text-zinc-500 font-normal"
                  >
                    {emptyContent || emptyText}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, rowIdx) => {
                  const isSelected = row.getIsSelected();
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRowClick?.(row.original, rowIdx)}
                      className={`transition-colors border-b border-zinc-100 last:border-0 ${isSelected
                          ? 'bg-emerald-50/40'
                          : rowIdx % 2 === 1
                            ? 'bg-zinc-50/40 hover:bg-zinc-100/60'
                            : 'bg-white hover:bg-zinc-50'
                        } ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isSelect = cell.column.id === 'select';
                        return (
                          <td
                            key={cell.id}
                            className={
                              isSelect
                                ? 'w-10 text-center px-2 py-2.5 align-middle'
                                : 'px-4 py-2.5 text-xs text-zinc-800 align-middle leading-snug'
                            }
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
