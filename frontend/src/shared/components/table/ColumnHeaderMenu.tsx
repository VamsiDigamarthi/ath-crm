import { useState, useMemo } from 'react';
import type { Column } from '@tanstack/react-table';
import {
  MoreVertical,
  ArrowUp,
  ArrowDown,
  EyeOff,
  RotateCcw,
  Check,
  Search,
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/shared/components/ui/popover';
import type { EnumOption } from '@/shared/constants/system-enums';

interface ColumnHeaderMenuProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function ColumnHeaderMenu<TData, TValue>({
  column,
  title,
  className = '',
}: ColumnHeaderMenuProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const meta = column.columnDef.meta as {
    filterType?: 'enum' | 'text' | 'none';
    filterOptions?: EnumOption[];
    disableFilter?: boolean;
    disableMenu?: boolean;
  } | undefined;

  const canSort = column.getCanSort();
  const disableMenu = meta?.disableMenu || (!canSort && (meta?.disableFilter || meta?.filterType === 'none'));

  // If menu is disabled (e.g. Action column), render clean title without 3-dots
  if (disableMenu) {
    return (
      <div className={`flex items-center text-[11px] font-semibold text-zinc-900 ${className}`}>
        <span>{title}</span>
      </div>
    );
  }

  const isSorted = column.getIsSorted();
  const currentFilterValue = column.getFilterValue();
  const isFiltered = currentFilterValue != null && currentFilterValue !== '' && !(Array.isArray(currentFilterValue) && currentFilterValue.length === 0);

  // Determine if column has enum filtering
  const hasEnumFilter = meta?.filterType === 'enum' || Boolean(meta?.filterOptions && meta.filterOptions.length > 0);
  const hasTextFilter = meta?.filterType === 'text';
  const showFilterSection = !meta?.disableFilter && meta?.filterType !== 'none' && (hasEnumFilter || hasTextFilter);

  // Available enum options: Use explicit system options from meta
  const enumOptions: EnumOption[] = useMemo(() => {
    if (meta?.filterOptions && meta.filterOptions.length > 0) {
      return meta.filterOptions;
    }
    return [];
  }, [meta?.filterOptions]);

  // Compute live match counts from current dataset for each option
  const optionsWithCounts = useMemo(() => {
    if (!hasEnumFilter || enumOptions.length === 0) return [];
    const facetMap = column.getFacetedUniqueValues();

    return enumOptions.map((opt) => {
      let count = 0;
      const targetLabel = opt.label.toLowerCase().trim();
      const targetVal = opt.value.toLowerCase().trim();

      if (facetMap) {
        facetMap.forEach((c, val) => {
          if (val == null) return;
          if (Array.isArray(val)) {
            const hasMatch = val.some((item) => {
              if (item == null) return false;
              const str = String(item).toLowerCase().trim();
              return (
                str === targetLabel ||
                str === targetVal ||
                str.includes(targetLabel) ||
                str.includes(targetVal) ||
                targetLabel.includes(str)
              );
            });
            if (hasMatch) count += c;
          } else if (typeof val === 'string') {
            const str = val.toLowerCase().trim();
            if (
              str === targetLabel ||
              str === targetVal ||
              str.includes(targetLabel) ||
              str.includes(targetVal) ||
              targetLabel.includes(str)
            ) {
              count += c;
            }
          } else if (val === opt.value || val === opt.label) {
            count += c;
          }
        });
      }
      return {
        ...opt,
        count,
      };
    });
  }, [hasEnumFilter, enumOptions, column]);

  // Normalize selected filter values as an array of strings
  const selectedValues = useMemo<string[]>(() => {
    if (currentFilterValue == null) return [];
    if (Array.isArray(currentFilterValue)) return currentFilterValue.map(String);
    return [String(currentFilterValue)];
  }, [currentFilterValue]);

  // Filter options by local search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return optionsWithCounts;
    const q = searchQuery.toLowerCase().trim();
    return optionsWithCounts.filter((opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q));
  }, [optionsWithCounts, searchQuery]);

  const handleToggleOption = (option: EnumOption) => {
    // If no filter is currently active (all records shown), clicking an option sets the filter to JUST this option
    if (selectedValues.length === 0) {
      column.setFilterValue([option.label, option.value]);
      return;
    }

    const hasThis = selectedValues.includes(option.label) || selectedValues.includes(option.value);
    if (hasThis) {
      const next = selectedValues.filter((v) => v !== option.label && v !== option.value);
      column.setFilterValue(next.length === 0 ? undefined : next);
    } else {
      const next = [...selectedValues, option.label, option.value];
      column.setFilterValue(next);
    }
  };

  const handleSelectAll = () => {
    column.setFilterValue(undefined);
  };

  const handleClearFilter = () => {
    setSearchQuery('');
    column.setFilterValue(undefined);
  };

  const handleTextFilterChange = (text: string) => {
    setSearchQuery(text);
    column.setFilterValue(text.trim() || undefined);
  };

  return (
    <div className={`flex items-center justify-between gap-1 group/header ${className}`}>
      <span className="text-[11px] font-semibold text-zinc-900 truncate">
        {title}
      </span>

      <div className="flex items-center gap-0.5 shrink-0">
        {isSorted === 'asc' && <ArrowUp className="w-3 h-3 text-[#16A34A]" />}
        {isSorted === 'desc' && <ArrowDown className="w-3 h-3 text-[#16A34A]" />}
        {isFiltered && (
          <span className="w-2 h-2 rounded-full bg-[#16A34A] ring-2 ring-emerald-200" title="Filter active on this column" />
        )}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`p-1 rounded transition-colors cursor-pointer outline-none ${
                isOpen || isFiltered || isSorted
                  ? 'text-zinc-900 bg-zinc-200/80'
                  : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/60'
              }`}
              title={`Sort & Options for ${title}`}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={4}
            className="w-64 p-2.5 bg-white rounded-lg shadow-xl border border-zinc-200 text-xs font-sans z-50 animate-in fade-in-50 zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Reset */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-2">
              <span className="font-semibold text-zinc-900 text-xs tracking-tight">
                {title} Options
              </span>
              {(isFiltered || isSorted) && (
                <button
                  type="button"
                  onClick={() => {
                    column.clearSorting();
                    handleClearFilter();
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A] hover:text-[#15803D] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Sort Controls */}
            {canSort && (
              <div className="space-y-1 mb-2">
                <button
                  type="button"
                  onClick={() => column.toggleSorting(false)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isSorted === 'asc'
                      ? 'bg-emerald-50 text-emerald-800 font-medium'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sort Ascending (A &rarr; Z)</span>
                  </div>
                  {isSorted === 'asc' && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
                </button>

                <button
                  type="button"
                  onClick={() => column.toggleSorting(true)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isSorted === 'desc'
                      ? 'bg-emerald-50 text-emerald-800 font-medium'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowDown className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sort Descending (Z &rarr; A)</span>
                  </div>
                  {isSorted === 'desc' && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
                </button>
              </div>
            )}

            {/* Enum Filter Section (Only for categorical columns with system enums) */}
            {showFilterSection && hasEnumFilter && (
              <div className="pt-2 border-t border-zinc-100 space-y-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500">
                    Filter by {title}
                  </span>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={handleClearFilter}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Search in options if more than 5 */}
                {enumOptions.length > 5 && (
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder={`Search ${title.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:bg-white text-zinc-900"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[#16A34A] hover:underline cursor-pointer font-medium"
                    >
                      Show All
                    </button>
                    <span>{selectedValues.length > 0 ? `${Math.ceil(selectedValues.length / 2)} selected` : 'All active'}</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-0.5 divide-y divide-zinc-50 border border-zinc-100 rounded bg-zinc-50/50 p-1">
                    {filteredOptions.map((opt) => {
                      const isChecked = selectedValues.length > 0 && (selectedValues.includes(opt.label) || selectedValues.includes(opt.value));
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
                            isChecked ? 'bg-emerald-50 text-emerald-900 font-medium' : 'text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleOption(opt)}
                              className="w-3.5 h-3.5 rounded border-zinc-300 text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
                            />
                            <span className="truncate" title={opt.label}>
                              {opt.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-normal text-zinc-400 bg-zinc-100 px-1.5 py-0.2 rounded shrink-0">
                            {opt.count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Text Filter Section (If text filter explicitly specified) */}
            {showFilterSection && hasTextFilter && (
              <div className="pt-2 border-t border-zinc-100 space-y-1.5 mb-2">
                <span className="text-[10px] font-bold text-zinc-500 block">
                  Search {title}
                </span>
                <input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => handleTextFilterChange(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:bg-white text-zinc-900"
                />
              </div>
            )}

            {/* Hide Column */}
            <div className="pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  column.toggleVisibility(false);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                <span>Hide Column</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
