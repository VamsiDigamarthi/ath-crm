import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesManagerStatsCards } from '../components/manager/SalesManagerStatsCards';
import { SalesTeamLeaderboard } from '../components/manager/SalesTeamLeaderboard';
import { 
  INITIAL_MANAGER_STATS, 
  INITIAL_SALES_REPS 
} from '../constants/sales-mock-data';

export const SalesManagerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [stats] = useState(INITIAL_MANAGER_STATS);
  const [salesReps] = useState(INITIAL_SALES_REPS);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Welcome & Fast Action Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sales Revenue &amp; Closers Executive Deck
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor real-time fee quotations, checkout links, rep conversion velocity, and IRS e-filing handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/sales/manager/queue')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Open Pipeline Queue</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 1. KPI Stats Cards */}
      <SalesManagerStatsCards stats={stats} />

      {/* 2. Closers Leaderboard */}
      <SalesTeamLeaderboard salesReps={salesReps} />
    </div>
  );
};
