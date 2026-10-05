import React from 'react';
import type { ClientType } from '../../types/sales.types';

const CONFIG: Record<ClientType, { label: string; dot: string; tooltip: string }> = {
  PAID: {
    label: 'Paid',
    dot: 'bg-emerald-500',
    tooltip: 'Last year filed with ATH Tax Services',
  },
  UNPAID: {
    label: 'Unpaid',
    dot: 'bg-amber-500',
    tooltip: 'Last year not filed with us',
  },
  NEW_COLD_CALLING: {
    label: 'New · Cold calling',
    dot: 'bg-slate-400',
    tooltip: 'Client is from cold calling and new to us',
  },
  NEW_REFERRAL: {
    label: 'New · Referral',
    dot: 'bg-blue-500',
    tooltip: 'Client got onboarded from a referral',
  },
};

export const CLIENT_TYPE_FILTER_OPTIONS = (Object.keys(CONFIG) as ClientType[]).map((value) => ({
  value,
  label: CONFIG[value].label,
}));

export const ClientTypeBadge: React.FC<{ type?: ClientType | null }> = ({ type }) => {
  if (!type) return <span className="text-xs text-slate-400">—</span>;
  const cfg = CONFIG[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 whitespace-nowrap" title={cfg.tooltip}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};
