import React from 'react';
import { Zap, UserPlus, X, CheckSquare } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export interface FloatingActionBarProps {
  selectedCount: number;
  onAutoRoundRobin: () => void;
  onOpenAssignModal: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  selectedCount,
  onAutoRoundRobin,
  onOpenAssignModal,
  onClearSelection,
  isLoading = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 shadow-2xl shadow-slate-950/40">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-[#16A34A] border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide">
              {selectedCount} {selectedCount === 1 ? 'Lead' : 'Leads'}
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Selected</span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={onAutoRoundRobin}
          disabled={isLoading}
          className="h-9 px-3.5 rounded-xl font-bold text-xs bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
          Auto Round-Robin
        </Button>

        <Button
          size="sm"
          onClick={onOpenAssignModal}
          disabled={isLoading}
          className="h-9 px-3.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 flex items-center gap-1.5 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 text-blue-400" />
          Assign to Staff
        </Button>

        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
