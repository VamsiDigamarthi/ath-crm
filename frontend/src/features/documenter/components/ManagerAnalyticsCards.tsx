import React from 'react';
import { 
  Users, 
  PhoneCall, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  Zap,
  CheckCircle2
} from 'lucide-react';

export interface ManagerAnalyticsStats {
  totalLeads: number;
  unassignedLeads: number;
  inOutreach: number;
  inTaxPrep: number;
  callbacksScheduled: number;
  totalCallsToday: number;
  connectedCalls: number;
  contactRatePct: number;
  conversionRatePct: number;
  activeAgentsCount: number;
  avgCallDuration: string;
}

export interface ManagerAnalyticsCardsProps {
  stats: ManagerAnalyticsStats;
  onQuickRoundRobin?: () => void;
  isActionLoading?: boolean;
}

export const ManagerAnalyticsCards: React.FC<ManagerAnalyticsCardsProps> = ({
  stats,
  onQuickRoundRobin,
  isActionLoading = false,
}) => {
  const allocationRate = stats.totalLeads > 0 
    ? Math.round(((stats.totalLeads - stats.unassignedLeads) / stats.totalLeads) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* Card 1: Department Caseload & Allocation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Department Caseload
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.totalLeads}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                {allocationRate}% Assigned
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {stats.unassignedLeads} awaiting assignment • {stats.inOutreach} in outreach
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mr-3">
            <div 
              className="bg-[#16A34A] h-full rounded-full transition-all duration-500"
              style={{ width: `${allocationRate}%` }}
            />
          </div>
          {stats.unassignedLeads > 0 && onQuickRoundRobin && (
            <button
              onClick={onQuickRoundRobin}
              disabled={isActionLoading}
              className="text-[11px] font-bold text-[#16A34A] hover:text-[#15803D] whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 fill-current" />
              Auto Split
            </button>
          )}
        </div>
      </div>

      {/* Card 2: Calling Outreach & Velocity */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Outreach Contact Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.contactRatePct}%
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {stats.connectedCalls} / {stats.totalCallsToday} dials
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Avg. Duration: <strong className="text-slate-700">{stats.avgCallDuration}</strong>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Scheduled Callbacks Due:</span>
          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            {stats.callbacksScheduled} Pending
          </span>
        </div>
      </div>

      {/* Card 3: Conversion to Tax Prep */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Intake Conversion Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.conversionRatePct}%
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {stats.inTaxPrep} in Prep
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Taxpayers agreed & started W-2 intake
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            Pipeline Velocity: High
          </span>
          <span className="font-bold text-slate-700">Target: 30%</span>
        </div>
      </div>

      {/* Card 4: Team Workload Balance */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Team Workload Health
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Optimal Capacity
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {stats.activeAgentsCount} active calling agents in pool
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Avg. Caseload:</span>
          <span className="font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {stats.activeAgentsCount > 0 ? (stats.inOutreach / stats.activeAgentsCount).toFixed(1) : 0} leads/agent
          </span>
        </div>
      </div>
    </div>
  );
};
