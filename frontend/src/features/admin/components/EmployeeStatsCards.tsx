import React from 'react';
import { Users, DollarSign, FileCheck } from 'lucide-react';
import type { EmployeeStats } from '../types/employee.types';

interface EmployeeStatsCardsProps {
  stats: EmployeeStats;
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Staff */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Total Staff Directory
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="font-semibold text-slate-700">Operational Personnel</span>
          </div>
        </div>
      </div>

      {/* 2. Documenter Dept */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Documenter Dept
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.documenters}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Outreach & Tax Prep Team
          </div>
        </div>
      </div>

      {/* 3. Sales Dept */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Sales Dept
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.sales}
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            Quote Pitch & Negotiation
          </div>
        </div>
      </div>

      {/* 4. File Operators */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            File Operator / CPAs
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.fileOperators}
          </div>
          <div className="text-xs text-[#16A34A] font-medium mt-1">
            IRS & State E-Filing Execution
          </div>
        </div>
      </div>
    </div>
  );
};
