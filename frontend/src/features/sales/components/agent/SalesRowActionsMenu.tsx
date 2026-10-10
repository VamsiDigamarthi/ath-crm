import React from 'react';
import { MoreVertical, FileWarning, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';

interface SalesRowActionsMenuProps {
  /** Shown instead of "Need revision" when the return can't be sent back right now */
  revisionBlockedReason?: string | null;
  onNeedRevision: () => void;
  onRevertToAdmin: () => void;
}

/** ⋮ menu in the sales queue row: Need revision (to Prep / Documenter) and Revert back (to admin) */
export const SalesRowActionsMenu: React.FC<SalesRowActionsMenuProps> = ({
  revisionBlockedReason,
  onNeedRevision,
  onRevertToAdmin,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-2xs cursor-pointer"
        title="More actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52">
      <DropdownMenuItem
        disabled={Boolean(revisionBlockedReason)}
        onSelect={onNeedRevision}
        className="flex items-start gap-2 cursor-pointer"
      >
        <FileWarning className="w-3.5 h-3.5 mt-0.5 text-amber-600" />
        <span className="flex flex-col">
          <span className="text-xs text-slate-800">Need revision</span>
          <span className="text-[10px] text-slate-400">
            {revisionBlockedReason || 'Send back to Preparer / Documenter'}
          </span>
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onRevertToAdmin} className="flex items-start gap-2 cursor-pointer">
        <RotateCcw className="w-3.5 h-3.5 mt-0.5 text-rose-500" />
        <span className="flex flex-col">
          <span className="text-xs text-slate-800">Revert back</span>
          <span className="text-[10px] text-slate-400">Return the lead to admin</span>
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
