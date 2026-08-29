import React, { useState, useMemo, useCallback } from 'react';
import { 
  Award, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppPagination } from '@/shared/components/AppPagination';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import type { FilingStaffMember } from '../../types/filing.types';

interface FilingStaffWorkloadTableProps {
  staffList: FilingStaffMember[];
  totalDepartmentLeads?: number;
  isLoading?: boolean;
}

export const FilingStaffWorkloadTable: React.FC<FilingStaffWorkloadTableProps> = ({
  staffList,
  totalDepartmentLeads = 0,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'TOP' | 'ACTIVE'>('ALL');

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

  const handleTierFilterChange = useCallback((tier: 'ALL' | 'TOP' | 'ACTIVE') => {
    setTierFilter((prev) => {
      if (prev !== tier) {
        setCurrentPage(1);
        return tier;
      }
      return prev;
    });
  }, []);

  const filteredStaff = useMemo(() => {
    return staffList.filter((member) => {
      if (tierFilter === 'TOP' && member.acceptedCount < 1) return false;
      if (tierFilter === 'ACTIVE' && member.activeCaseload === 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesEmail = member.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }

      return true;
    });
  }, [staffList, tierFilter, searchQuery]);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const getAvatarBox = (email: string) => {
    const initial = (email?.[0] || 'F').toUpperCase();
    return (
      <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 text-emerald-800">
        {initial}
      </div>
    );
  };

  const getRoleBadge = (accepted: number) => {
    if (accepted >= 1) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 shrink-0">
          <Award className="w-2.5 h-2.5 text-[#16A34A]" />
          <span>Verified CPA Filer</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 shrink-0">
        <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
        <span>Filing Specialist</span>
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
      {/* Header with Title & Search Input */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Filing Specialists Workload &amp; Capacity Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor live IRS MeF transmission volume, acceptance throughput, and rebalance queue allocation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64 sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search specialist by name or email..."
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
              All Specialists ({staffList.length})
            </button>
            <button
              type="button"
              onClick={() => handleTierFilterChange('TOP')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                tierFilter === 'TOP'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Accepted Transmitters
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Specialist Member</th>
              <th className="py-3 px-4">Active Transmission Caseload</th>
              <th className="py-3 px-4 text-center">Transmissions Completed</th>
              <th className="py-3 px-4 text-center">IRS Accepted Returns</th>
              <th className="py-3 px-4 text-center">Rejection / Error Rate</th>
              <th className="py-3 px-4 text-center">Acceptance Rate</th>
              <th className="py-3 px-4 text-right">Caseload Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  Loading dynamic filing staff matrix from database...
                </td>
              </tr>
            ) : paginatedStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No filing specialists found matching your search.
                </td>
              </tr>
            ) : (
              paginatedStaff.map((member) => {
                const effectiveTotal = totalDepartmentLeads > 0 ? totalDepartmentLeads : (member.activeCaseload || 1);
                const sharePct = effectiveTotal > 0 ? Math.round((member.activeCaseload / effectiveTotal) * 100) : 0;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Staff Member */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {getAvatarBox(member.email)}
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {getRoleBadge(member.acceptedCount)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{member.email}</span>
                            <AppCopyButton text={member.email} size="sm" />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Active Caseload Breakdown */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="space-y-1.5">
                        <div className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                          <span>
                            {member.activeCaseload} / {effectiveTotal} {effectiveTotal === 1 ? 'Return' : 'Returns'}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{sharePct}% Share</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all bg-[#16A34A]"
                            style={{ width: `${Math.min(100, Math.max(sharePct, member.activeCaseload > 0 ? 15 : 0))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Transmissions Completed */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 text-xs bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 inline-flex items-center gap-1">
                        <Send className="w-3 h-3 text-slate-400" />
                        <span>{member.transmissionsCompletedToday} Transmitted</span>
                      </span>
                    </td>

                    {/* IRS Accepted Returns */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-[#16A34A] text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                        <span>{member.acceptedCount} Accepted</span>
                      </span>
                    </td>

                    {/* Rejection / Error Rate */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-600 text-xs bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {member.rejectedCount > 0 ? `${member.rejectedCount} Rejects` : '0% Rejects'}
                      </span>
                    </td>

                    {/* Acceptance Rate */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-emerald-600 text-xs inline-flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{member.acceptanceRate}</span>
                      </div>
                    </td>

                    {/* Caseload Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/filing/manager/queue')}
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
