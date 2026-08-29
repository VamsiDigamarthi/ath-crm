import { Award } from 'lucide-react';
import type { SalesRepItem } from '../../types/sales.types';

interface SalesTeamLeaderboardProps {
  salesReps: SalesRepItem[];
}

export const SalesTeamLeaderboard: React.FC<SalesTeamLeaderboardProps> = ({ salesReps }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">
            Sales Closers Leaderboard &amp; Daily Quotas
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500">
          {salesReps.length} Active Closers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {salesReps.map((rep, idx) => (
          <div
            key={rep.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {rep.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{rep.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{rep.email}</div>
                </div>
              </div>

              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                #{idx + 1}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Closed</div>
                <div className="text-xs font-bold text-[#16A34A]">{rep.dealsClosedToday}</div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Revenue</div>
                <div className="text-xs font-bold text-slate-900">${rep.totalRevenueToday}</div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Conv. %</div>
                <div className="text-xs font-bold text-blue-600">{rep.conversionRate}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
