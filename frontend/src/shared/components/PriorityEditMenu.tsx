import React, { Fragment } from 'react';
import { Flag, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { SYSTEM_PRIORITIES } from '@/shared/constants/system-enums';

interface PriorityEditMenuProps {
  priority?: string | null;
  onChange: (priority: string) => void;
}

export const PriorityEditMenu: React.FC<PriorityEditMenuProps> = ({ priority, onChange }) => {
  const current = priority || 'NO_PRIORITY';
  const currentLabel = SYSTEM_PRIORITIES.find((p) => p.value === current)?.label || 'No priority';
  const isUnset = current === 'NO_PRIORITY';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`h-7 w-[104px] px-2 text-[11px] font-normal border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1 shadow-2xs rounded-lg cursor-pointer ${
            isUnset ? 'text-slate-400' : 'text-slate-700'
          }`}
          title="Edit Priority"
        >
          <Flag className="w-3 h-3 shrink-0" />
          <span className="flex-1 text-left truncate">{currentLabel}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="normal-case tracking-normal font-medium text-slate-400">
          Set priority
        </DropdownMenuLabel>
        {SYSTEM_PRIORITIES.map(({ value, label }) => {
          const isSelected = current === value;
          return (
            <Fragment key={value}>
              {value === 'NO_PRIORITY' && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onSelect={() => {
                  if (!isSelected) onChange(value);
                }}
                className={`justify-between ${isSelected ? 'font-medium text-slate-900' : 'text-slate-600'}`}
              >
                <span>{label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-700" />}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
