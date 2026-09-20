import React, { useState } from 'react';
import { Calendar, CalendarRange, X } from 'lucide-react';
import type { DateFilterPreset } from '../utils/date-filters';

export interface DashboardDateFilterProps {
  preset: DateFilterPreset;
  onPresetChange: (preset: DateFilterPreset) => void;
  startDate?: string;
  endDate?: string;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
  className?: string;
}

export const DashboardDateFilter: React.FC<DashboardDateFilterProps> = ({
  preset,
  onPresetChange,
  startDate = '',
  endDate = '',
  onCustomDateChange,
  className = '',
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(preset === 'CUSTOM');
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const handlePresetClick = (p: DateFilterPreset) => {
    if (p === 'CUSTOM') {
      setShowCustomInputs(true);
      onPresetChange('CUSTOM');
      if (onCustomDateChange && (localStart || localEnd)) {
        onCustomDateChange(localStart, localEnd);
      }
    } else {
      setShowCustomInputs(false);
      onPresetChange(p);
    }
  };

  const handleClearCustom = () => {
    setLocalStart('');
    setLocalEnd('');
    setShowCustomInputs(false);
    onPresetChange('TODAY');
    if (onCustomDateChange) {
      onCustomDateChange('', '');
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 1. Main Presets Segmented Control */}
      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
        <button
          type="button"
          onClick={() => handlePresetClick('TODAY')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            preset === 'TODAY'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick('WEEK')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            preset === 'WEEK'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Actual calendar week (Monday - Sunday)"
        >
          This Week
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick('MONTH')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            preset === 'MONTH'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Actual calendar month (1st - End of Month)"
        >
          This Month
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick('CUSTOM')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            preset === 'CUSTOM'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>Custom</span>
        </button>
      </div>

      {/* 2. Custom From/To Date Pickers (Shown when Custom is selected or active) */}
      {showCustomInputs && (
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 px-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs animate-in fade-in duration-150">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">From:</span>
            <input
              type="date"
              value={localStart}
              onChange={(e) => {
                setLocalStart(e.target.value);
                if (onCustomDateChange) {
                  onCustomDateChange(e.target.value, localEnd);
                }
              }}
              className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">To:</span>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => {
                setLocalEnd(e.target.value);
                if (onCustomDateChange) {
                  onCustomDateChange(localStart, e.target.value);
                }
              }}
              className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {(localStart || localEnd) && (
            <button
              type="button"
              onClick={handleClearCustom}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
              title="Reset date filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
