import React, { useState, useMemo, useCallback } from 'react';
import { 
  Award, 
  PhoneCall, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  Target
} from 'lucide-react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppPagination } from '@/shared/components/AppPagination';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import type { SalesRepItem } from '../../types/sales.types';

interface SalesClosersWorkloadTableProps {
  salesReps: SalesRepItem[];
  totalDepartmentLeads?: number;
  isLoading?: boolean;
}

export const SalesClosersWorkloadTable: React.FC<SalesClosersWorkloadTableProps> = ({
  salesReps,
  totalDepartmentLeads = 0,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'STAR' | 'STEADY'>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery((prev) => {
      if (prev !== val) {
        setCurrentPage(1);
        return val;
      }
      return prev;
    });
  }, []);

  const handleTierFilterChange = useCallback((tier: 'ALL' | 'STAR' | 'STEADY') => {
    setTierFilter((prev) => {
      if (prev !== tier) {
        setCurrentPage(1);
        return tier;
      }
      return prev;
    });
  }, []);

  const filteredStaff = useMemo(() => {
    return salesReps.filter((rep) => {
      if (tierFilter === 'STAR' && rep.dealsClosedToday < 3) return false;
      if (tierFilter === 'STEADY' && rep.dealsClosedToday >= 3) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rep.name.toLowerCase().includes(q);
        const matchesEmail = rep.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }

      return true;
    });
  }, [salesReps, tierFilter, searchQuery]);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const getAvatarBox = (email: string) => {
    const initial = (email?.[0] || 'S').toUpperCase();
    return (
      <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 text-purple-800">
        {initial}
      </div>
    );
  };

  const getRoleBadge = (deals: number) => {
    if (deals >= 4) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shrink-0">
          <Award className="w-2.5 h-2.5 text-purple-600" />
          <span>Star Closer</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 shrink-0">
        <Target className="w-2.5 h-2.5 text-[#16A34A]" />
        <span>Sales Closer</span>
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
      {/* Header with Title & Search Input */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Sales Closers Workload &amp; Capacity Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor live closer pitch call volume, deal conversion rate, daily revenue generation, and balance caseload allocation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64 sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search closer by name or email..."
            />
          </div>

          {/* Tier Segmented Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleTierFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                tierFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Closers ({salesReps.length})
            </button>
            <button
              type="button"
              onClick={() => handleTierFilterChange('STAR')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                tierFilter === 'STAR'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Top Performers
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Active Caseload Breakdown</th>
              <th className="py-3 px-4 text-center">Pitches Completed</th>
              <th className="py-3 px-4 text-center">Deals Closed Today</th>
              <th className="py-3 px-4 text-center">Revenue Generated</th>
              <th className="py-3 px-4 text-center">Conversion Rate</th>
              <th className="py-3 px-4 text-right">Caseload Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  Loading dynamic closers matrix from database...
                </td>
              </tr>
            ) : paginatedStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No sales closers found matching your search.
                </td>
              </tr>
            ) : (
              paginatedStaff.map((rep) => {
                const effectiveTotal = totalDepartmentLeads > 0 ? totalDepartmentLeads : (rep.activeLeads || 1);
                const sharePct = effectiveTotal > 0 ? Math.round((rep.activeLeads / effectiveTotal) * 100) : 0;

                return (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Staff Member: Avatar Box + Name + Role Badge + Email with Copy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {getAvatarBox(rep.email)}
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{rep.name}</span>
                            {getRoleBadge(rep.dealsClosedToday)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{rep.email}</span>
                            <AppCopyButton text={rep.email} size="sm" />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Active Caseload Breakdown: Dynamic Share of Department Leads */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="space-y-1.5">
                        <div className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                          <span>
                            {rep.activeLeads} / {effectiveTotal} {effectiveTotal === 1 ? 'Lead' : 'Leads'}
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold">{sharePct}% Share</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all bg-blue-600"
                            style={{ width: `${Math.min(100, Math.max(sharePct, rep.activeLeads > 0 ? 15 : 0))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Pitches Completed */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 text-xs bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 inline-flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>{rep.pitchesCompletedToday} Calls</span>
                      </span>
                    </td>

                    {/* Deals Closed Today */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-[#16A34A] text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                        <span>{rep.dealsClosedToday} Closed</span>
                      </span>
                    </td>

                    {/* Revenue Generated */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900 text-xs">
                        ${rep.totalRevenueToday.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">USD Receipts</div>
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-blue-600 text-xs inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{rep.conversionRate}</span>
                      </div>
                    </td>

                    {/* Caseload Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/sales/manager/queue')}
                        className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer h-7 px-2.5"
                      >
                        <span>View Queue</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && filteredStaff.length > 0 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            perPageOptions={[5, 10, 20]}
            onPageChange={(p) => setCurrentPage(p)}
            onPerPageChange={(pp) => {
              setItemsPerPage(pp);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
