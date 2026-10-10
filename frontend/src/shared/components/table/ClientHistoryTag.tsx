import React from 'react';

export type ClientHistoryStatus = 'PAID' | 'NEW' | 'UNPAID';

const CONFIG: Record<ClientHistoryStatus, { label: string; classes: string; tooltip: string }> = {
  NEW: {
    label: 'New',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    tooltip: 'New client: no earlier filing with us',
  },
  PAID: {
    label: 'Paid',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tooltip: 'Paid for an earlier tax year with us',
  },
  UNPAID: {
    label: 'Unpaid',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    tooltip: 'Had an earlier filing with us but dropped before paying',
  },
};

/** Small client-history chip shown under the taxpayer name (status comes from the backend) */
export const ClientHistoryTag: React.FC<{ status?: ClientHistoryStatus | null }> = ({ status }) => {
  const cfg = CONFIG[status || 'NEW'];
  return (
    <span
      className={`inline-flex w-fit items-center px-1.5 py-px rounded-md border text-[10px] font-medium leading-4 ${cfg.classes}`}
      title={cfg.tooltip}
    >
      {cfg.label}
    </span>
  );
};
