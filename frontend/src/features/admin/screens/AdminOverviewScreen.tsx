import React from 'react';
import { AdminStatsOverview } from '../components/AdminStatsOverview';
import { AdminRecentActivity } from '../components/AdminRecentActivity';
import { ShieldCheck } from 'lucide-react';

export const AdminOverviewScreen: React.FC = () => {
  const stats = [
    {
      title: 'Total Prospects',
      value: '1,248',
      description: '+12% from bulk CSV import',
      trend: 'up' as const,
      badgeColor: 'emerald' as const,
    },
    {
      title: 'Documenter Queue',
      value: '432',
      description: 'Outreach & Tax Prep',
      trend: 'neutral' as const,
      badgeColor: 'blue' as const,
    },
    {
      title: 'Sales Pitches',
      value: '289',
      description: 'Active Fee Quotes',
      trend: 'neutral' as const,
      badgeColor: 'purple' as const,
    },
    {
      title: 'Completed Filings',
      value: '527',
      description: 'Converted Customers',
      trend: 'up' as const,
      badgeColor: 'emerald' as const,
    },
  ];

  const recentActivity = [
    {
      id: '1',
      title: 'Bulk Lead Import Executed',
      details: '150 records processed, 12 duplicates skipped',
      time: '10 mins ago',
      type: 'success' as const,
    },
    {
      id: '2',
      title: 'Documenter Agent Assigned',
      details: 'Application #TAX-2026-0941 routed to Doc Team',
      time: '25 mins ago',
      type: 'info' as const,
    },
    {
      id: '3',
      title: 'Sales Fee Quote Approved',
      details: 'Moved to File Operator Queue',
      time: '1 hour ago',
      type: 'primary' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-[#16A34A] to-emerald-700 p-6 sm:p-8 text-white border border-emerald-600 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            Tax Operations Control Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, Admin!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 mt-2 leading-relaxed font-medium">
            Manage lead ingestion, department user roles, deduplication rules, and track tax filing operations lifecycle across Documenters, Sales, and File Operators.
          </p>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <AdminStatsOverview stats={stats} />

      {/* Recent Operations Activity Log */}
      <AdminRecentActivity activities={recentActivity} />
    </div>
  );
};
