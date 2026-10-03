import React, { useState } from 'react';
import { Calendar, CalendarRange, X } from 'lucide-react';
import { AppTabs } from '@/shared/components/AppTabs';
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
      {/* 1. Main Presets AppTabs */}
      <AppTabs
        tabs={[
          { id: 'TODAY', label: 'Today' },
          { id: 'WEEK', label: 'This Week' },
          { id: 'MONTH', label: 'This Month' },
          { id: 'CUSTOM', label: 'Custom', icon: CalendarRange },
        ]}
        activeTab={preset}
        onChange={(id) => handlePresetClick(id as DateFilterPreset)}
        size="sm"
      />

      {/* 2. Custom From/To Date Pickers (Shown when Custom is selected or active) */}
      {showCustomInputs && (
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 px-2.5 rounded-md border border-slate-300 shadow-2xs text-xs animate-in fade-in duration-150">
          <Calendar className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-black uppercase">From:</span>
            <input
              type="date"
              value={localStart}
              onChange={(e) => {
                setLocalStart(e.target.value);
                if (onCustomDateChange) {
                  onCustomDateChange(e.target.value, localEnd);
                }
              }}
              className="px-2 py-0.5 rounded-md border border-slate-300 bg-slate-50 text-xs font-semibold text-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-black uppercase">To:</span>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => {
                setLocalEnd(e.target.value);
                if (onCustomDateChange) {
                  onCustomDateChange(localStart, e.target.value);
                }
              }}
              className="px-2 py-0.5 rounded-md border border-slate-300 bg-slate-50 text-xs font-semibold text-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
            />
          </div>

          {(localStart || localEnd) && (
            <button
              type="button"
              onClick={handleClearCustom}
              className="p-1 text-black hover:text-rose-600 rounded-md transition-colors cursor-pointer"
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
