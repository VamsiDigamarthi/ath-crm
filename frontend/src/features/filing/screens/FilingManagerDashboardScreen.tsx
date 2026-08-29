import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  RefreshCw, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useFilingManagerDashboard } from '../hooks/useFilingManagerDashboard';

export const FilingManagerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    timeRange,
    setTimeRange,
    leads,
    stats,
    stageFunnel,
    fetchDashboardData,
  } = useFilingManagerDashboard();

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
              <UploadCloud className="w-3 h-3 text-[#16A34A]" />
              <span>Manager Supervision</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            IRS Transmission &amp; MeF Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Executive oversight of XML schema validation, IRS gateway transmissions, and state return acknowledgements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeRange('TODAY')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'TODAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('WEEK')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'WEEK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('MTD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'MTD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MTD
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 border-slate-200 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/filing/manager/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Open Transmission Queue ({leads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ready for Transmission */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ready for MeF E-File</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats?.readyForTransmission || 0}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">
              Payment &amp; Form 8879 Verified
            </div>
          </div>
        </div>

        {/* Transmitted & Accepted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">IRS Accepted Returns</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats?.acceptedToday || 0}
            </div>
            <div className="text-[11px] text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Official IRS Ack Issued</span>
            </div>
          </div>
        </div>

        {/* ERO Gateway Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">IRS E-File Gateway</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-700">ONLINE</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              EFIN: 582910 • ETIN: 9281
            </div>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">IRS Acceptance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats?.acceptanceRatePct || 100}%
            </div>
            <div className="text-[11px] text-[#16A34A] font-semibold mt-1">
              100% First-Pass Validation
            </div>
          </div>
        </div>
      </div>

      {/* 3. MeF Transmission Funnel Stages */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              IRS Modernized e-File (MeF) Transmission Funnel
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {leads.length} Total Department Returns
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stageFunnel.map((stage, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">{stage.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {stage.pct}%
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {stage.count}
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max(stage.pct, stage.count > 0 ? 15 : 0)}%`, backgroundColor: stage.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Staff Workload &amp; Capacity Matrix</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect filing specialists caseload allocation and acceptance velocity.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/filing/manager/staff')}
            className="border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Batch Transmission Console</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Transmit multiple Form 1040 returns simultaneously to the IRS Gateway.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/filing/manager/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span>Batch Dispatch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
