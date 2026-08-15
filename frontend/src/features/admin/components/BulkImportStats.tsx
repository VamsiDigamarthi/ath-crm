import React from 'react';
import { Users, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import type { BulkImportStatsData } from '../types/bulk-import.types';

interface BulkImportStatsProps {
  stats: BulkImportStatsData;
}

export const BulkImportStats: React.FC<BulkImportStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Rows Parsed',
      value: stats.total,
      description: 'Records parsed from CSV file',
      icon: Users,
      iconBg: 'bg-slate-100 text-slate-700',
      border: 'border-slate-200',
    },
    {
      title: 'Ready for Ingestion',
      value: stats.valid,
      description: 'Passed syntax & contact checks',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-[#16A34A]',
      border: 'border-emerald-200',
      valueColor: 'text-[#16A34A]',
    },
    {
      title: 'Formatting Issues',
      value: stats.invalid,
      description: 'Missing phone or invalid email',
      icon: AlertCircle,
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-200',
      valueColor: stats.invalid > 0 ? 'text-rose-600' : 'text-slate-900',
    },
    {
      title: 'Server Deduplication',
      value: 'Enabled',
      description: 'SSN & Email matched on submit',
      icon: ShieldCheck,
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-200',
      valueColor: 'text-blue-600',
      isBadge: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${card.border} shadow-xs flex items-center gap-4 transition-all duration-200 hover:shadow-sm`}
          >
            <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${card.valueColor || 'text-slate-900'} tracking-tight`}>
                {card.value}
              </div>
              <div className="text-xs font-semibold text-slate-800">{card.title}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">{card.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
