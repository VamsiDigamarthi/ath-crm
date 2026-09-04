import React, { useState, useMemo } from 'react';
import type { PrepStaffMember } from '../../types/prep-review.types';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  ShieldCheck, 
  Calculator,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PrepStaffWorkloadTableProps {
  staff: PrepStaffMember[];
  isLoading?: boolean;
}

export const PrepStaffWorkloadTable: React.FC<PrepStaffWorkloadTableProps> = ({
  staff,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TAX_PREPARER' | 'TAX_REVIEWER'>('ALL');

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      if (roleFilter === 'ALL') {
        if (s.role === 'PREP_MANAGER') return false;
      } else {
        if (s.role !== roleFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesRole = s.roleLabel?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole) return false;
      }

      return true;
    });
  }, [staff, roleFilter, searchQuery]);

  const getRoleBadge = (role: string) => {
    if (role === 'PREP_MANAGER') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-2.5 h-2.5 text-purple-600" />
          <span>Dept Manager</span>
        </span>
      );
    }
    if (role === 'TAX_REVIEWER') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
          <span>Senior QA Reviewer</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 shrink-0">
        <Calculator className="w-2.5 h-2.5 text-[#16A34A]" />
        <span>Tax Preparer</span>
      </span>
    );
  };

  const getAvatarBox = (role: string, email: string) => {
    const initial = (email?.[0] || 'S').toUpperCase();
    if (role === 'PREP_MANAGER') {
      return (
        <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 text-purple-800">
          {initial}
        </div>
      );
    }
    if (role === 'TAX_REVIEWER') {
      return (
        <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-300 text-indigo-800">
          {initial}
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 text-[#16A34A]">
        {initial}
      </div>
    );
  };

  const preparersCount = staff.filter((s) => s.role === 'TAX_PREPARER').length;
  const reviewersCount = staff.filter((s) => s.role === 'TAX_REVIEWER').length;
  const nonManagerCount = staff.filter((s) => s.role !== 'PREP_MANAGER').length;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
      {/* Header with Title & Search Input (Exact Documenter Manager Style) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Tax Operations Staff Workload &amp; Capacity Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor live caseload capacity, daily preparation activity, turnaround efficiency, and return distribution across all Tax staff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64 sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search staff by name, email, or role..."
            />
          </div>

          {/* Role Segmented Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                roleFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Staff ({nonManagerCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('TAX_PREPARER')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                roleFilter === 'TAX_PREPARER'
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Preparers ({preparersCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('TAX_REVIEWER')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                roleFilter === 'TAX_REVIEWER'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              QA Reviewers ({reviewersCount})
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
              <th className="py-3 px-4">Total Assigned Caseload</th>
              <th className="py-3 px-4 text-center">Active in Progress</th>
              <th className="py-3 px-4 text-center">Completed &amp; Signed Off</th>
              <th className="py-3 px-4 text-center">Workload Status</th>
              <th className="py-3 px-4 text-right">Caseload Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  Loading dynamic staff matrix from database...
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  No staff members found matching your search.
                </td>
              </tr>
            ) : (
              filteredStaff.map((member) => {
                const totalAssigned = Number(member.totalAssignedCount) || 0;
                const totalPrep = Number(member.totalAssignedPrep) || 0;
                const totalReview = Number(member.totalAssignedReview) || 0;
                const load = Number(member.activeCaseload) || 0;
                const prepCount = Number(member.prepActiveCount) || 0;
                const reviewCount = Number(member.reviewActiveCount) || 0;
                const prepDone = Number(member.prepCompletedCount) || 0;
                const reviewDone = Number(member.reviewCompletedCount) || 0;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Staff Member: Avatar Box + Name + Role Badge + Email with Copy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {getAvatarBox(member.role, member.email)}
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {getRoleBadge(member.role)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{member.email}</span>
                            <AppCopyButton text={member.email} size="sm" />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Assigned Caseload (All-Time Assigned) */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="space-y-1.5">
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{totalAssigned} Total Assigned Returns</span>
                          {totalAssigned > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              All-Time
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold border ${
                            totalPrep > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            🧮 {totalPrep} as Preparer
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold border ${
                            totalReview > 0
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            🛡️ {totalReview} as QA Reviewer
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Active in Progress (Currently under Prep/QA) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {load === 0 ? (
                          <span className="text-[11px] text-slate-400 font-medium">
                            0 Active (Queue Clear)
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                              {load} Active
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                              {prepCount > 0 && <span>{prepCount} Prep</span>}
                              {prepCount > 0 && reviewCount > 0 && <span>•</span>}
                              {reviewCount > 0 && <span>{reviewCount} QA</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Completed MTD & QA Passed */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-extrabold text-xs text-slate-900">
                        {member.completedThisMonth || 0} files
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {prepDone} Prep • {reviewDone} QA Passed
                      </div>
                    </td>

                    {/* Workload Status Pill */}
                    <td className="py-3.5 px-4 text-center">
                      {load >= 8 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Heavy Load
                        </span>
                      ) : load > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                          Active ({load} Assigned)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Available for Returns
                        </span>
                      )}
                    </td>

                    {/* Caseload Action: View Queue Button */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/prep-review/manager/queue?staffId=${member.id}`)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#16A34A] hover:text-[#16A34A] flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="View this staff member's active return caseload in Pipeline Queue"
                        >
                          <span>View Queue</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
