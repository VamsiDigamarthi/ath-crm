import React from 'react';
import { CheckCircle2, Clock, Activity, FileCheck, ArrowRight } from 'lucide-react';

interface SalesAgentActivityFeedProps {
  activities: Array<{
    id: string;
    title: string;
    taxpayerName: string;
    amount: string | number;
    type: string;
    time: string;
  }>;
  onGoToQueue: () => void;
}

export const SalesAgentActivityFeed: React.FC<SalesAgentActivityFeedProps> = ({
  activities,
  onGoToQueue,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Recent Sales Milestones
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit log of fee checkouts, quotes, and case assignments.
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="divide-y divide-slate-100 p-2 sm:p-3">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium text-xs">
            No recent activity logged yet today.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="p-3 hover:bg-slate-50/70 rounded-xl transition-colors flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    act.type === 'PAID'
                      ? 'bg-emerald-50 text-[#16A34A] border border-emerald-100'
                      : act.type === 'QUOTED'
                        ? 'bg-purple-50 text-purple-600 border border-purple-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  {act.type === 'PAID' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : act.type === 'QUOTED' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <FileCheck className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Client: <span className="text-slate-700 font-bold">{act.taxpayerName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-slate-900">
                  {typeof act.amount === 'number' ? `$${act.amount}` : act.amount}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{act.time}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer link */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={onGoToQueue}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>Open Full Pitch Deck Caseload</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
