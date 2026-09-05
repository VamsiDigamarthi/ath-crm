import React, { useState, useMemo } from 'react';
import type { PrepReviewLead } from '../../types/prep-review.types';
import { PrepStageBadge } from '../common/PrepStageBadge';
import { PrepComplexityBadge } from '../common/PrepComplexityBadge';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { Button } from '@/shared/components/Button';
import { 
  UserCheck, 
  FileText, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Calculator, 
  UserPlus,
  X 
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';

interface PrepManagerQueueTableProps {
  leads: PrepReviewLead[];
  tabStats?: {
    all: number;
    unassigned: number;
    underPrep: number;
    qaReview: number;
    revisions: number;
    qaApproved: number;
  };
  isLoading?: boolean;
  onOpenAssignModal: (leadsToAssign: PrepReviewLead[]) => void;
  onOpenAutoDistribute?: () => void;
  onViewLeadDetail: (lead: PrepReviewLead) => void;
  selectedStageFilter?: string;
  onStageFilterChange?: (stage: string) => void;
  isAdmin?: boolean;
}

export const PrepManagerQueueTable: React.FC<PrepManagerQueueTableProps> = ({
  leads,
  tabStats,
  isLoading = false,
  onOpenAssignModal,
  onOpenAutoDistribute: _onOpenAutoDistribute,
  onViewLeadDetail,
  selectedStageFilter = 'ALL',
  onStageFilterChange,
  isAdmin = false,
}) => {
  const { user } = useAuthStore();
  const isEffectiveAdmin = isAdmin || user?.role === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [internalTab, setInternalTab] = useState<string>(selectedStageFilter);

  const activeTab = onStageFilterChange ? selectedStageFilter : internalTab;
  const setTab = (tab: string) => {
    if (onStageFilterChange) onStageFilterChange(tab);
    else setInternalTab(tab);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Tab Filter
      if (activeTab === 'UNASSIGNED') {
        if (lead.currentStage !== 'DOC_PREP_COMPLETE' && lead.assignedPreparer !== null) return false;
      } else if (activeTab === 'UNDER_PREP') {
        if (lead.currentStage !== 'PREP_ASSIGNED' && lead.currentStage !== 'PREP_IN_PROGRESS') return false;
      } else if (activeTab === 'QA_REVIEW') {
        if (lead.currentStage !== 'QA_REVIEW_QUEUE' && lead.currentStage !== 'QA_IN_REVIEW') return false;
      } else if (activeTab === 'REVISIONS') {
        if (lead.currentStage !== 'QA_REVISION_REQUESTED') return false;
      } else if (activeTab === 'QA_APPROVED') {
        if (lead.currentStage !== 'QA_APPROVED' && lead.currentStage !== 'SALES_PITCH_QUEUE') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lead.taxpayerName.toLowerCase().includes(q);
        const matchesEmail = lead.taxpayerEmail.toLowerCase().includes(q);
        const matchesPhone = lead.taxpayerPhone.includes(q);
        const matchesVisa = lead.visaType.toLowerCase().includes(q);
        const matchesState = lead.stateOfResidence.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesVisa && !matchesState) return false;
      }

      return true;
    });
  }, [leads, activeTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssignClick = () => {
    const selectedLeads = leads.filter((l) => selectedLeadIds.includes(l.id));
    onOpenAssignModal(selectedLeads);
  };

  const counts = tabStats || {
    all: leads.length,
    unassigned: leads.filter((l) => l.currentStage === 'DOC_PREP_COMPLETE' || l.assignedPreparer === null).length,
    underPrep: leads.filter((l) => l.currentStage === 'PREP_ASSIGNED' || l.currentStage === 'PREP_IN_PROGRESS').length,
    qaReview: leads.filter((l) => l.currentStage === 'QA_REVIEW_QUEUE' || l.currentStage === 'QA_IN_REVIEW').length,
    revisions: leads.filter((l) => l.currentStage === 'QA_REVISION_REQUESTED').length,
    qaApproved: leads.filter((l) => l.currentStage === 'QA_APPROVED' || l.currentStage === 'SALES_PITCH_QUEUE').length,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans space-y-0">
      {/* Top Header & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#16A34A]" />
            <span>Tax Preparation &amp; Quality Review Pipeline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {isEffectiveAdmin 
              ? 'Real-time monitoring of taxpayer files moving through 1040 computation and QA compliance sign-off.'
              : 'Assign intake-ready taxpayer files to Preparers and designate Compliance Reviewers.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-64 sm:w-80">
            <AppSearchInput
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search taxpayer, visa, state..."
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs Ribbon */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 bg-slate-50'
          }`}
        >
          All Pipeline ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setTab('UNASSIGNED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'UNASSIGNED'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <span>Unassigned</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {counts.unassigned}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('UNDER_PREP')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'UNDER_PREP'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60'
          }`}
        >
          <span>Under Prep (1040)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {counts.underPrep}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('QA_REVIEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'QA_REVIEW'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/60'
          }`}
        >
          <span>In QA Review</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {counts.qaReview}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('REVISIONS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'REVISIONS'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60'
          }`}
        >
          <span>Revisions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {counts.revisions}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('QA_APPROVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'QA_APPROVED'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60'
          }`}
        >
          <span>Ready for Sales</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {counts.qaApproved}
          </span>
        </button>
      </div>

      {/* Leads Table or AppEmptyState */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading dynamic pipeline queue from database...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-8">
          <AppEmptyState
            icon={FileText}
            title="No Tax Returns in this Queue"
            description={
              searchQuery.trim()
                ? `No returns matched your search query "${searchQuery}".`
                : activeTab !== 'ALL'
                ? `There are currently 0 tax returns under the "${activeTab}" stage.`
                : 'There are currently no taxpayer files in the preparation pipeline.'
            }
            secondaryAction={
              searchQuery.trim() || activeTab !== 'ALL'
                ? {
                    label: 'Reset Filters',
                    onClick: () => {
                      setSearchQuery('');
                      setTab('ALL');
                    },
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                {!isEffectiveAdmin && (
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#16A34A]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="py-3 px-4">Taxpayer Client</th>
                <th className="py-3 px-4">Complexity &amp; Location</th>
                <th className="py-3 px-4 text-center">Intake &amp; Vault</th>
                <th className="py-3 px-4">Assigned Preparer</th>
                <th className="py-3 px-4">QA Reviewer</th>
                <th className="py-3 px-4">Filing Lifecycle Stage</th>
                {!isEffectiveAdmin && <th className="py-3 px-4 text-right">Assign Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    {!isEffectiveAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(lead.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#16A34A]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Taxpayer Client Info */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span
                            onClick={() => onViewLeadDetail(lead)}
                            className="hover:text-[#16A34A] cursor-pointer"
                          >
                            {lead.taxpayerName}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            TY {lead.taxYear}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{lead.taxpayerEmail}</div>
                        <div className="text-[10px] text-slate-400">
                          {lead.visaType} • {lead.maritalStatus}
                        </div>
                      </div>
                    </td>

                    {/* Complexity & Location */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <PrepComplexityBadge complexity={lead.complexity} />
                        <div className="text-[11px] text-slate-500 font-medium">
                          {lead.stateOfResidence}
                        </div>
                      </div>
                    </td>

                    {/* Intake Docs & Vault */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <FileText className="w-3 h-3 text-[#16A34A]" />
                          <span>{lead.verifiedDocumentsCount} Docs Verified</span>
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Organizer: {lead.organizerPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Assigned Preparer */}
                    <td className="py-3.5 px-4">
                      {lead.assignedPreparer ? (
                        <div className="flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{lead.assignedPreparer.name}</div>
                            <div className="text-[10px] text-slate-400">{lead.assignedPreparer.email.split('@')[0]}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Assigned Reviewer */}
                    <td className="py-3.5 px-4">
                      {lead.assignedReviewer ? (
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{lead.assignedReviewer.name}</div>
                            <div className="text-[10px] text-slate-400">{lead.assignedReviewer.email.split('@')[0]}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not Designated</span>
                      )}
                    </td>

                    {/* Lifecycle Stage */}
                    <td className="py-3.5 px-4">
                      <PrepStageBadge 
                        stage={lead.prepStage || lead.currentStage} 
                        assignedPreparerName={lead.assignedPreparer?.name}
                        assignedCloserName={lead.assignedSalesAgent?.name}
                        assignedFileOpName={lead.assignedFileOp?.name}
                      />
                    </td>

                    {/* Assign Action */}
                    {!isEffectiveAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenAssignModal([lead])}
                          className="border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-[#16A34A] text-xs font-bold h-7.5 px-2.5 cursor-pointer shadow-2xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Bar at Bottom (Hidden for Admin) */}
      {!isEffectiveAdmin && selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 shadow-2xl shadow-slate-950/40">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-[#16A34A] border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white tracking-wide">
                  {selectedLeadIds.length} {selectedLeadIds.length === 1 ? 'Lead' : 'Leads'}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Selected</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleBulkAssignClick}
              className="h-9 px-4 rounded-xl font-bold text-xs bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-white" />
              <span>Assign Preparer &amp; QA Reviewer</span>
            </Button>

            <button
              onClick={() => setSelectedLeadIds([])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
