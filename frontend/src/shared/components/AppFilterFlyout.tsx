import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronRight, Check } from 'lucide-react';
import { Button } from './Button';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

/** Drop the flyout's 'ALL' placeholder (set when the last option is unticked) so an empty category means no filter */
export const withoutAllValues = (filters: Record<string, string[]>): Record<string, string[]> =>
  Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, (v || []).filter((x) => x && x !== 'ALL')]));

export interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
}

interface AppFilterFlyoutProps {
  categories: FilterCategory[];
  selectedFilters: Record<string, string[]>;
  onApply: (filters: Record<string, string[]>) => void;
  onReset?: () => void;
  className?: string;
}

export const AppFilterFlyout: React.FC<AppFilterFlyoutProps> = ({
  categories,
  selectedFilters,
  onApply,
  onReset,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '');
  const [draftFilters, setDraftFilters] = useState<Record<string, string[]>>(selectedFilters);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync draft when selectedFilters changes
  useEffect(() => {
    setDraftFilters(selectedFilters);
  }, [selectedFilters]);

  // Keep first category selected if current active is invalid
  useEffect(() => {
    if (!categories.find((c) => c.id === activeCategoryId) && categories[0]) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];

  // Calculate total active filter values
  const totalActiveCount = Object.entries(selectedFilters).reduce((acc, [, vals]) => {
    // If the category has 'ALL' selected or is empty, don't count as custom filter
    const realVals = (vals || []).filter((v) => v !== 'ALL' && v !== '');
    return acc + realVals.length;
  }, 0);

  const handleToggleOption = (catId: string, value: string) => {
    setDraftFilters((prev) => {
      const currentVals = prev[catId] || [];
      let nextVals: string[];

      if (value === 'ALL') {
        nextVals = ['ALL'];
      } else {
        const withoutAll = currentVals.filter((v) => v !== 'ALL');
        if (withoutAll.includes(value)) {
          nextVals = withoutAll.filter((v) => v !== value);
          if (nextVals.length === 0) nextVals = ['ALL'];
        } else {
          // If category is single-select (like 'tab' stage)
          if (catId === 'tab') {
            nextVals = [value];
          } else {
            nextVals = [...withoutAll, value];
          }
        }
      }
      return { ...prev, [catId]: nextVals };
    });
  };

  const handleSelectAllForActiveCategory = () => {
    if (!activeCategory) return;
    const specificValues = activeCategory.options
      .map((opt) => opt.value)
      .filter((v) => v !== 'ALL');
    setDraftFilters((prev) => ({
      ...prev,
      [activeCategory.id]: specificValues.length > 0 ? specificValues : ['ALL'],
    }));
  };

  const handleClearForActiveCategory = () => {
    if (!activeCategory) return;
    setDraftFilters((prev) => ({
      ...prev,
      [activeCategory.id]: ['ALL'],
    }));
  };

  const handleApply = () => {
    onApply(draftFilters);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setDraftFilters(selectedFilters);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    const resetObj: Record<string, string[]> = {};
    categories.forEach((cat) => {
      resetObj[cat.id] = [];
    });
    setDraftFilters(resetObj);
    onApply(resetObj);
    if (onReset) onReset();
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setDraftFilters(selectedFilters);
          setIsOpen((prev) => !prev);
        }}
        className={`border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
          isOpen || totalActiveCount > 0
            ? 'ring-2 ring-blue-500/20 border-blue-400 text-blue-600'
            : ''
        }`}
        title="Filter leads by multiple criteria"
      >
        <Filter className="w-3.5 h-3.5 text-blue-600" />
        <span>Filters</span>
        {totalActiveCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
            {totalActiveCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden font-sans flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Advanced Filters</span>
            </div>
            {totalActiveCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* 2-Column Body (Category List on Left, Options on Right) */}
          <div className="flex h-72">
            {/* Left Category Column */}
            <div className="w-44 bg-slate-50/70 border-r border-slate-100 py-1.5 overflow-y-auto">
              {categories.map((cat) => {
                const isActive = cat.id === activeCategoryId;
                const activeCategoryCount = (draftFilters[cat.id] || []).filter(
                  (v) => v !== 'ALL' && v !== ''
                ).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-700 font-bold border-l-3 border-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    <div className="flex items-center gap-1">
                      {activeCategoryCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
                          {activeCategoryCount}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Options Column */}
            <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden bg-white">
              {activeCategory ? (
                <>
                  {/* Category Top Action Links */}
                  <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
                    <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                      {activeCategory.label}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={handleSelectAllForActiveCategory}
                        className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer uppercase"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearForActiveCategory}
                        className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer uppercase"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Options List */}
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 py-1">
                    {activeCategory.options.map((opt) => {
                      const selectedList = draftFilters[activeCategory.id] || [];
                      const isChecked = selectedList.includes(opt.value);

                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleToggleOption(activeCategory.id, opt.value)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors select-none ${
                            isChecked ? 'bg-blue-50/60 text-blue-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white hover:border-slate-400'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400 italic p-4 text-center">
                  Select a filter category
                </div>
              )}

              {/* Bottom Action Buttons (Cancel / Apply) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold h-7.5 px-3 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-7.5 px-4 cursor-pointer shadow-2xs"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
