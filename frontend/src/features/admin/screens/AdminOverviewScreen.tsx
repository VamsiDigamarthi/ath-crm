import React, { useEffect, useState, useCallback } from 'react';
import { AdminStatsOverview } from '../components/AdminStatsOverview';
import { AdminRecentActivity } from '../components/AdminRecentActivity';
import { AdminExecutiveCharts, type PipelineFlowItem, type VisaMixItem } from '../components/AdminExecutiveCharts';
import { ShieldCheck, RefreshCw, Calculator, DollarSign, FileCheck2, Users, ArrowRight } from 'lucide-react';
import { adminService } from '../services/admin-service';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AdminOverviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState<{
    totalProspects: number;
    documenterCount: number;
    prepReviewCount: number;
    salesCount: number;
    filingQueueCount: number;
    completedFilingsCount: number;
    totalEmployees: number;
    totalRevenue?: number;
    paidReturnsCount?: number;
  }>({
    totalProspects: 0,
    documenterCount: 0,
    prepReviewCount: 0,
    salesCount: 0,
    filingQueueCount: 0,
    completedFilingsCount: 0,
    totalEmployees: 0,
    totalRevenue: 0,
    paidReturnsCount: 0,
  });

  const [pipelineFlow, setPipelineFlow] = useState<PipelineFlowItem[]>([]);
  const [visaMix, setVisaMix] = useState<VisaMixItem[]>([]);

  const [activities, setActivities] = useState<Array<{
    id: string;
    title: string;
    details: string;
    time: string;
    type: 'success' | 'info' | 'warning' | 'primary';
  }>>([]);

  const fetchStats = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      const res = await adminService.getDashboardStats();
      if (res?.data) {
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
        if (res.data.pipelineFlow) {
          setPipelineFlow(res.data.pipelineFlow);
        }
        if (res.data.visaMix) {
          setVisaMix(res.data.visaMix);
        }
        if (res.data.recentActivities) {
          setActivities(res.data.recentActivities);
        }
      }
      if (showToast) {
        toast.success('Admin dashboard synced with live database!');
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = [
    {
      title: 'Total Prospects & Clients',
      value: String(counts.totalProspects.toLocaleString()),
      description: 'Permanent Master Database',
      trend: 'up' as const,
      badgeColor: 'emerald' as const,
    },
    {
      title: 'Documenter Outreach Queue',
      value: String(counts.documenterCount.toLocaleString()),
      description: 'Intake & File Collection',
      trend: 'neutral' as const,
      badgeColor: 'blue' as const,
    },
    {
      title: 'Tax Prep & QA Review',
      value: String(counts.prepReviewCount.toLocaleString()),
      description: '1040 Calculations & Audits',
      trend: 'up' as const,
      badgeColor: 'emerald' as const,
    },
    {
      title: 'Sales Pitching & Quotes',
      value: String(counts.salesCount.toLocaleString()),
      description: 'Active Fee Quotations',
      trend: 'neutral' as const,
      badgeColor: 'purple' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150 font-sans">
      {/* Welcome Hero Banner with Sync action */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-[#16A34A] to-emerald-700 p-6 sm:p-8 text-white border border-emerald-600 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            Super Admin Control Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, Admin!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 mt-2 leading-relaxed font-medium">
            Executive oversight of tax lead ingestion, deduplication rules, and live department workflows across Documenter, Prep &amp; Review, Sales Closers, and CPA E-Filing Hub.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={isLoading}
            className="border-emerald-400 bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm backdrop-blur-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live Stats</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Core Metric Cards */}
      <AdminStatsOverview stats={stats} />

      {/* Dynamic Executive Operational Analytics Graphs */}
      <AdminExecutiveCharts
        pipelineFlow={pipelineFlow}
        visaMix={visaMix}
        totalProspects={counts.totalProspects}
        totalRevenue={counts.totalRevenue || 0}
        paidReturnsCount={counts.paidReturnsCount || 0}
      />

      {/* Quick Navigation to Lower Operational Departments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate('/admin/documenter')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Documenter Dept</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{counts.documenterCount} Leads</div>
          <div className="text-[11px] text-slate-400 group-hover:text-[#16A34A] flex items-center gap-1 mt-1 font-semibold">
            <span>Inspect Outreach Queue</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/prep-review')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Prep &amp; Review Dept</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{counts.prepReviewCount} Cases</div>
          <div className="text-[11px] text-slate-400 group-hover:text-[#16A34A] flex items-center gap-1 mt-1 font-semibold">
            <span>Inspect 1040 QA Audits</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/sales')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Sales Dept</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{counts.salesCount} Pitches</div>
          <div className="text-[11px] text-slate-400 group-hover:text-[#16A34A] flex items-center gap-1 mt-1 font-semibold">
            <span>Inspect Fee Closers</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/filing')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Filing Dept</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{counts.filingQueueCount} Ready</div>
          <div className="text-[11px] text-slate-400 group-hover:text-[#16A34A] flex items-center gap-1 mt-1 font-semibold">
            <span>Inspect IRS Transmission</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Recent Operations Activity Log from Live Stage History */}
      <AdminRecentActivity 
        activities={activities.length > 0 ? activities : [
          {
            id: '1',
            title: 'Operations Database Active',
            details: `${counts.totalEmployees} Active staff members across all departments`,
            time: 'Live',
            type: 'info' as const,
          }
        ]} 
      />
    </div>
  );
};
