import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, GripVertical, Check, Lock } from 'lucide-react';
import { Button } from './Button';

export interface ColumnConfigItem {
  id: string;
  label: string;
  defaultVisible?: boolean;
  disabled?: boolean;
  locked?: boolean;
}

interface AppColumnConfigDropdownProps {
  columns: ColumnConfigItem[];
  visibleColumnIds: string[];
  onChange: (visibleIds: string[]) => void;
  storageKey?: string;
  className?: string;
}

export const AppColumnConfigDropdown: React.FC<AppColumnConfigDropdownProps> = ({
  columns,
  visibleColumnIds,
  onChange,
  storageKey,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  const handleToggleColumn = (colId: string) => {
    const targetCol = columns.find((c) => c.id === colId);
    if (targetCol?.locked) return; // Cannot toggle locked columns

    let nextIds: string[];
    if (visibleColumnIds.includes(colId)) {
      nextIds = visibleColumnIds.filter((id) => id !== colId);
    } else {
      nextIds = [...visibleColumnIds, colId];
    }
    onChange(nextIds);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextIds));
      } catch {}
    }
  };

  const handleSelectAll = () => {
    const allIds = columns.map((c) => c.id);
    onChange(allIds);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(allIds));
      } catch {}
    }
  };

  const handleClear = () => {
    // Keep locked columns (or first column if none are locked)
    const lockedIds = columns.filter((c) => c.locked).map((c) => c.id);
    const nextIds = lockedIds.length > 0 ? lockedIds : (columns[0]?.id ? [columns[0].id] : []);
    onChange(nextIds);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextIds));
      } catch {}
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
          isOpen ? 'ring-2 ring-blue-500/20 border-blue-400 text-blue-600' : ''
        }`}
        title="Configure table columns"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
        <span>Columns</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Configure Columns
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer uppercase"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer uppercase"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Column Checkboxes List */}
          <div className="max-h-64 overflow-y-auto py-1 px-1.5 divide-y divide-slate-50">
            {columns.map((col) => {
              const isLocked = Boolean(col.locked);
              const isChecked = visibleColumnIds.includes(col.id) || isLocked;

              return (
                <div
                  key={col.id}
                  onClick={() => !col.disabled && !isLocked && handleToggleColumn(col.id)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors select-none ${
                    isLocked
                      ? 'text-slate-700 bg-slate-50/50 cursor-default'
                      : isChecked
                      ? 'text-slate-800 hover:bg-slate-50 cursor-pointer'
                      : 'text-slate-400 hover:bg-slate-50/60 cursor-pointer'
                  }`}
                  title={isLocked ? 'Mandatory column (locked)' : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="truncate">{col.label}</span>
                  </div>

                  {isLocked ? (
                    <div className="w-4 h-4 flex items-center justify-center shrink-0" title="Locked column">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ) : (
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 italic text-center">
            Click check to toggle visibility
          </div>
        </div>
      )}
    </div>
  );
};
