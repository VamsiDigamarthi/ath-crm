import React from 'react';
import { Users, FileSpreadsheet, UserCheck, FileCheck, TrendingUp } from 'lucide-react';

interface StatItem {
  title: string;
  value: string;
  description: string;
  trend: string;
  badgeColor: string;
}

interface AdminStatsOverviewProps {
  stats: StatItem[];
}

export const AdminStatsOverview: React.FC<AdminStatsOverviewProps> = ({ stats }) => {
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Users className="w-4 h-4 text-[#16A34A]" />;
      case 1:
        return <FileSpreadsheet className="w-4 h-4 text-blue-600" />;
      case 2:
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 3:
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Users className="w-4 h-4 text-[#16A34A]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-xl px-3.5 py-3"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold tracking-wider">
              {stat.title}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              {getIcon(index)}
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            {stat.value}
          </div>
          <p className="text-[11px] font-medium text-emerald-700 mt-1 flex items-center gap-1">
            {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-[#16A34A]" />}
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
};
