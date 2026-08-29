import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  RefreshCw, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  Layers,
  CreditCard,
  Rocket
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesManagerStatsCards } from '../components/manager/SalesManagerStatsCards';
import { 
  INITIAL_MANAGER_STATS, 
  INITIAL_SALES_LEADS 
} from '../constants/sales-mock-data';
import toast from 'react-hot-toast';

export const SalesManagerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [stats] = useState(INITIAL_MANAGER_STATS);
  const [leads] = useState(INITIAL_SALES_LEADS);
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MTD'>('MTD');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Sales operations analytics refreshed');
    }, 400);
  };

  // Funnel Stage Counts
  const funnelStages = useMemo(() => {
    const total = leads.length || 1;
    const awaiting = leads.filter((l) => l.currentStage === 'SALES_PITCH_QUEUE').length;
    const pitching = leads.filter((l) => l.currentStage === 'SALES_PITCHING').length;
    const quoted = leads.filter((l) => l.currentStage === 'QUOTATION_SENT' || l.currentStage === 'PAYMENT_PENDING').length;
    const paid = leads.filter((l) => l.currentStage === 'PAID_AND_AUTHORIZED').length;
    const filing = leads.filter((l) => l.currentStage === 'FILING_QUEUE').length;

    return [
      {
        id: '1',
        title: '1. Awaiting Closer Pitch',
        count: awaiting,
        pct: `${Math.round((awaiting / total) * 100)}%`,
        sub: 'QA certified returns',
        active: awaiting > 0,
      },
      {
        id: '2',
        title: '2. In Active Pitch Discussion',
        count: pitching,
        pct: `${Math.round((pitching / total) * 100)}%`,
        sub: 'On phone with closer',
        active: pitching > 0,
      },
      {
        id: '3',
        title: '3. Quotation Sent & Pending',
        count: quoted,
        pct: `${Math.round((quoted / total) * 100)}%`,
        sub: 'Checkout link dispatched',
        active: quoted > 0,
      },
      {
        id: '4',
        title: '4. Paid & Form 8879 Signed',
        count: paid,
        pct: `${Math.round((paid / total) * 100)}%`,
        sub: 'Payment & e-sign verified',
        active: paid > 0,
      },
      {
        id: '5',
        title: '5. Transferred to Filing Hub',
        count: filing,
        pct: `${Math.round((filing / total) * 100)}%`,
        sub: 'IRS MeF transmission',
        active: filing > 0,
      },
    ];
  }, [leads]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Time Filter Bar (Exact Documenter & PrepReview Manager standard) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sales Revenue &amp; Closers Command Center
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Manager Supervision
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Executive oversight of fee quotations, payment checkout velocity, revenue realization, and IRS filing handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Time Range Pill Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['TODAY', 'WEEK', 'MTD'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'TODAY' ? 'Today' : range === 'WEEK' ? 'This Week' : 'MTD'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/sales/manager/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Open Department Queue</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics */}
      <SalesManagerStatsCards stats={stats} />

      {/* 3. Sales Pipeline Stage-by-Stage Progression Stepper */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Sales Pipeline Stage-by-Stage Progression Funnel
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {leads.length} Total Qualified Returns
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {funnelStages.map((stg, idx) => (
            <div
              key={stg.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                stg.active
                  ? 'bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border-blue-200 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="truncate">{stg.title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-black">
                    {stg.pct}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {stg.count}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>{stg.sub}</span>
                {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Service Fee Revenue Structure & Add-On Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Fee Structure Revenue Contributions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#16A34A]" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Service Fee Revenue Contributions
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ${stats.totalRevenueMTD.toLocaleString()} Total
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-800">Federal Form 1040 Base Prep ($149)</span>
              <span className="font-black text-slate-900">$3,278 (67%)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-800">State Income Tax Returns ($49 / State)</span>
              <span className="font-black text-slate-900">$882 (18%)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-800">Audit Defense &amp; IRS Representation ($29)</span>
              <span className="font-black text-slate-900">$435 (9%)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-800">Foreign Bank FBAR FinCEN 114 ($99)</span>
              <span className="font-black text-slate-900">$295 (6%)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Handoff to Filing Operations Hub */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 rounded-xl border border-emerald-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-[#16A34A]" />
              <h3 className="font-bold text-sm text-slate-900">
                IRS E-Filing Transmission Handoff
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Once the closer collects the service fee and obtains the taxpayer's digital Form 8879 authorization, the return is immediately dispatched to the <strong>IRS E-Filing Queue</strong> for MeF XML transmission.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Ready for Transmission</div>
                <div className="text-xl font-black text-[#16A34A]">1 Client</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Avg Time to Close</div>
                <div className="text-xl font-black text-blue-600">4.2 Hours</div>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/sales/manager/team')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View Closers Matrix &amp; Capacity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
