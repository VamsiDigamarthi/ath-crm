import React from 'react';
import { Filter } from 'lucide-react';

export interface PriorityFilterSelectProps {
  value: string;
  onChange: (priority: any) => void;
  size?: 'sm' | 'md';
  includeAllOption?: boolean;
  className?: string;
}

export const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'IMPORTANT', label: 'Important' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
  { value: 'NO_PRIORITY', label: 'No Priority' },
];

export const PriorityFilterSelect: React.FC<PriorityFilterSelectProps> = ({
  value,
  onChange,
  size = 'sm',
  includeAllOption = true,
  className = '',
}) => {
  const options = includeAllOption
    ? PRIORITY_OPTIONS
    : PRIORITY_OPTIONS.filter((o) => o.value !== 'ALL');

  const sizeClasses = size === 'sm' 
    ? 'text-xs py-1.5 pl-7 pr-7 h-8 rounded-lg' 
    : 'text-xs py-2 pl-8 pr-8 h-9 rounded-xl';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-white border border-slate-200 text-slate-700 font-semibold hover:border-slate-300 focus:outline-none focus:ring-1.5 focus:ring-[#16A34A] focus:border-[#16A34A] transition-all cursor-pointer shadow-2xs ${sizeClasses}`}
        aria-label="Filter by priority"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[10px]">
        ▼
      </div>
    </div>
  );
};
