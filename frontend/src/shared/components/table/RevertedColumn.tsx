import type { ColumnDef } from '@tanstack/react-table';

const DEPT_LABEL: Record<string, string> = {
  DOCUMENTER: 'Documenter',
  PREPARATION: 'Prep',
  QA_REVIEW: 'QA',
  SALES: 'Sales',
  FILING: 'Filing',
};

export interface RevertedInfo {
  from: string;
  to: string;
  reason: string;
  notes: string;
  by: string;
  at: string | null;
  resolved: boolean;
}

/** Latest send-back on a return (workflow revert or QA revision), or null if never sent back */
export const getRevertedInfo = (summary: any): RevertedInfo | null => {
  const rev = summary?.lastRevert;
  if (rev) {
    return {
      from: DEPT_LABEL[rev.sourceDepartment] || rev.sourceDepartment || '—',
      to: DEPT_LABEL[rev.targetDepartment] || rev.targetDepartment || '—',
      reason: String(rev.reasonCategory || '').replace(/_/g, ' ').toLowerCase(),
      notes: rev.revertNotes || '',
      by: rev.revertedByName || '',
      at: rev.revertedAt || null,
      resolved: Boolean(rev.resolved),
    };
  }
  if (summary?.status === 'REVISION_REQUESTED') {
    return {
      from: 'QA',
      to: 'Prep',
      reason: 'revision requested',
      notes: summary.revisionNotes || summary.qaRemarks || '',
      by: '',
      at: null,
      resolved: false,
    };
  }
  return null;
};

/**
 * "Reverted" column for any team's table: shows who sent the return back and to whom,
 * with the notes on hover. Pass how to read taxDraftSummary from the row.
 */
export function makeRevertedColumn<T>(getSummary: (row: T) => any): ColumnDef<T, any> {
  return {
    id: 'reverted',
    header: 'REVERTED',
    accessorFn: (row) => {
      const info = getRevertedInfo(getSummary(row));
      return !info ? 'No' : info.resolved ? 'Resolved' : 'Yes';
    },
    meta: {
      filterType: 'enum',
      filterOptions: [
        { label: 'Sent back', value: 'Yes' },
        { label: 'Resolved', value: 'Resolved' },
        { label: 'Never', value: 'No' },
      ],
    },
    cell: ({ row }) => {
      const info = getRevertedInfo(getSummary(row.original));
      if (!info) return <span className="text-xs text-slate-400">—</span>;
      const tooltip = [
        `${info.from} → ${info.to}`,
        info.reason && `Reason: ${info.reason}`,
        info.notes && `Notes: ${info.notes}`,
        info.by && `By: ${info.by}`,
        info.at && new Date(info.at).toLocaleString(),
      ]
        .filter(Boolean)
        .join('\n');
      return (
        <div className="flex flex-col gap-0.5 min-w-0" title={tooltip}>
          <span
            className={`inline-flex w-fit items-center px-1.5 py-px rounded-md border text-[10px] font-medium ${
              info.resolved ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {info.resolved ? 'Resolved' : `${info.from} → ${info.to}`}
          </span>
          {!info.resolved && info.reason && (
            <span className="text-[11px] text-slate-500 truncate max-w-[180px] capitalize">{info.reason}</span>
          )}
        </div>
      );
    },
  };
}
