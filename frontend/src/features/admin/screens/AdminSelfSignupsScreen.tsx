import React, { useMemo } from 'react';
import { useSelfSignups } from '../hooks/useSelfSignups';
import type { SelfSignupLeadItem } from '../services/self-signups-service';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppDrawer } from '@/shared/components/AppDrawer';
import { Button } from '@/shared/components/Button';
import { LeadAssignmentModal } from '@/features/documenter/components/LeadAssignmentModal';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import {
  Globe,
  UserPlus,
  Clock,
  CheckCircle2,
  RefreshCw,
  Zap,
  UserCheck,
  Eye,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
import { generateTaxYears } from '@/features/auth/components/TaxpayerSignupForm';

const VISA_OPTIONS = [
  { value: 'ALL', label: 'All Visa Types' },
  { value: 'H1B', label: 'H-1B (Work Visa)' },
  { value: 'F1_OPT', label: 'F-1 Student (OPT / STEM)' },
  { value: 'L1', label: 'L-1 (Intracompany)' },
  { value: 'GREEN_CARD', label: 'Permanent Resident (Green Card)' },
  { value: 'US_CITIZEN', label: 'U.S. Citizen' },
  { value: 'B1_B2', label: 'B-1 / B-2 (Visitor)' },
  { value: 'OTHER', label: 'Other Visa' },
];

const STAGE_OPTIONS = [
  { value: 'ALL', label: 'All Filing Stages' },
  { value: 'RAW_PROSPECT', label: 'Raw Prospect (New Ingest)' },
  { value: 'DOC_OUTREACH', label: 'Documenter Outreach' },
  { value: 'DOC_PREP', label: 'Tax Prep In Progress' },
  { value: 'SALES_PITCH_QUEUE', label: 'Sales Pitch Queue' },
  { value: 'SALES_PITCHING', label: 'Sales Pitching' },
  { value: 'FILING_QUEUE', label: 'Filing Queue' },
  { value: 'FILING_SUCCESS', label: 'Filing Success (Completed)' },
];

export const AdminSelfSignupsScreen: React.FC = () => {
  const {
    leads,
    agents,
    stats,
    isLoading,
    isActionLoading,
    searchQuery,
    visaFilter,
    taxYearFilter,
    stageFilter,
    priorityFilter,
    page,
    limit,
    totalPages,
    totalItems,
    selectedRows,
    setSelectedRows,
    isAssignModalOpen,
    setIsAssignModalOpen,
    isAuditDrawerOpen,
    setIsAuditDrawerOpen,
    activeLeadForAudit,
    handleSearchChange,
    handleVisaChange,
    handleTaxYearChange,
    handleStageChange,
    handlePriorityChange,
    handlePageChange,
    handleLimitChange,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleOpenAuditDrawer,
    handleCloseAuditDrawer,
    handleDirectAssign,
    handleAutoRoundRobin,
    refreshData,
  } = useSelfSignups();

  const dynamicTaxYears = useMemo(() => generateTaxYears(2, 6), []);

  const renderStageBadge = (stage: string) => {
    switch (stage) {
      case 'RAW_PROSPECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Raw Prospect</span>
          </span>
        );
      case 'DOC_OUTREACH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            <Phone className="w-3 h-3 text-blue-500" />
            <span>Doc Outreach</span>
          </span>
        );
      case 'DOC_PREP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
            <Layers className="w-3 h-3 text-purple-500" />
            <span>Prep & Review</span>
          </span>
        );
      case 'SALES_PITCH_QUEUE':
      case 'SALES_PITCHING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            <span>Sales Pitching</span>
          </span>
        );
      case 'FILING_QUEUE':
      case 'FILING_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            <span>IRS Filing</span>
          </span>
        );
      case 'FILING_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span>{stage.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  // Define Table Columns
  const columns: ColumnDef<SelfSignupLeadItem>[] = useMemo(
    () => [
      {
        header: 'Taxpayer Client',
        render: (lead: SelfSignupLeadItem) => {
          const initials =
            `${lead.customer?.firstName?.[0] || ''}${lead.customer?.lastName?.[0] || ''}`.toUpperCase() ||
            'TX';
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                {initials}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>
                    {lead.customer?.firstName} {lead.customer?.lastName}
                  </span>
                  {lead.customer?.visaType && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {lead.customer.visaType}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {lead.customer?.ssnTin
                    ? `SSN: ***-**-${lead.customer.ssnTin.slice(-4)}`
                    : 'Online Registered Lead'}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Contact Information',
        render: (lead: SelfSignupLeadItem) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[170px]">{lead.customer?.email || 'No email'}</span>
              {lead.customer?.email && <AppCopyButton text={lead.customer.email} size="sm" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{lead.customer?.phone || 'No phone'}</span>
              {lead.customer?.phone && <AppCopyButton text={lead.customer.phone} size="sm" />}
            </div>
          </div>
        ),
      },
      {
        header: 'Tax Year & Source',
        render: (lead: SelfSignupLeadItem) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tax Year {lead.taxYear}</span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <Globe className="w-2.5 h-2.5" />
              <span>Direct Sign-Up</span>
            </span>
          </div>
        ),
      },
      {
        header: 'Registered On',
        render: (lead: SelfSignupLeadItem) => {
          const dateStr = lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—';
          return (
            <div className="text-xs text-slate-600 font-medium whitespace-nowrap">
              {dateStr}
            </div>
          );
        },
      },
      {
        header: 'Filing Stage',
        render: (lead: SelfSignupLeadItem) => renderStageBadge(lead.currentStage),
      },
      {
        header: 'Assigned Agent',
        render: (lead: SelfSignupLeadItem) => {
          if (lead.assignedDocAgent) {
            return (
              <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[140px]">
                  {lead.assignedDocAgent.firstName
                    ? `${lead.assignedDocAgent.firstName} ${lead.assignedDocAgent.lastName || ''}`
                    : lead.assignedDocAgent.email}
                </span>
              </div>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Unassigned (Pool)</span>
            </span>
          );
        },
      },
      {
        header: 'Actions',
        render: (lead: SelfSignupLeadItem) => (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRows([lead]);
                setIsAssignModalOpen(true);
              }}
              className="text-xs px-2.5 py-1 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 font-semibold cursor-pointer"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              <span>Assign</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenAuditDrawer(lead)}
              className="text-xs px-2 py-1 text-slate-600 hover:text-slate-900 border-slate-200 cursor-pointer"
              title="View Complete Audit Trail"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [setSelectedRows, setIsAssignModalOpen, handleOpenAuditDrawer]
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mb-2">
            <Globe className="w-3.5 h-3.5" />
            Direct Online Self-Registration Channel
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Direct &amp; Online Sign-Ups
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of taxpayers who registered directly through the public client onboarding portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            loading={isLoading}
            className="text-xs border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAutoRoundRobin}
            loading={isActionLoading}
            disabled={leads.length === 0}
            className="text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            <span>
              Round-Robin Distribute {selectedRows.length > 0 ? `(${selectedRows.length})` : 'All'}
            </span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Direct Signups</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.totalSelfSignups.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            Public portal registrations
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Raw Intake</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.rawProspectsCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">
            Awaiting Documenter outreach
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active In Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.inProgressCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">
            Doc / Prep / Sales / Filing
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Filings</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.completedFilingsCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-teal-600 font-medium mt-0.5">
            Successfully e-Filed with IRS
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <AppSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by taxpayer name, email, phone, or SSN..."
              size="md"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tax Year Filter */}
            <select
              value={taxYearFilter || ''}
              onChange={(e) => handleTaxYearChange(e.target.value ? Number(e.target.value) : undefined)}
              className="h-10 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
            >
              <option value="">All Tax Years</option>
              {dynamicTaxYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tax Year {yr}
                </option>
              ))}
            </select>

            {/* Visa Filter */}
            <select
              value={visaFilter}
              onChange={(e) => handleVisaChange(e.target.value)}
              className="h-10 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
            >
              {VISA_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => handleStageChange(e.target.value)}
              className="h-10 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <PriorityFilterSelect
              value={priorityFilter}
              onChange={handlePriorityChange}
              size="md"
            />
          </div>
        </div>

        {/* Selected Rows Action Banner */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#16A34A]">
                {selectedRows.length} lead(s) selected
              </span>
              <span className="text-slate-500">• Ready for direct assignment or round-robin</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRows([])}
                className="text-xs text-slate-600 bg-white border-slate-200"
              >
                Clear Selection
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAssignModal}
                className="text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Assign Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <AppTable
          columns={columns}
          data={leads}
          loading={isLoading}
          enableSelection
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowKey="id"
          emptyState={
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Direct Sign-Ups Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || visaFilter !== 'ALL' || taxYearFilter || stageFilter !== 'ALL'
                  ? 'No online registered leads match your current search and filter criteria.'
                  : 'New taxpayer registrations from the public sign-up portal will appear here in real time.'}
              </p>
            </div>
          }
          pagination={{
            page,
            pageSize: limit,
            totalPages,
            totalRows: totalItems,
            onPageChange: handlePageChange,
            onPageSizeChange: handleLimitChange,
          }}
        />
      </div>

      {/* Direct Assignment Modal */}
      {isAssignModalOpen && (
        <LeadAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          agents={agents}
          selectedCount={selectedRows.length}
          onAssign={handleDirectAssign}
          loading={isActionLoading}
        />
      )}

      {/* Audit Drawer */}
      <AppDrawer
        isOpen={isAuditDrawerOpen}
        onClose={handleCloseAuditDrawer}
        title={
          activeLeadForAudit
            ? `Audit History: ${activeLeadForAudit.customer?.firstName} ${activeLeadForAudit.customer?.lastName}`
            : 'Lead Audit Trail'
        }
        size="lg"
      >
        {activeLeadForAudit && (
          <LeadAuditTrailSection leadId={activeLeadForAudit.id} />
        )}
      </AppDrawer>
    </div>
  );
};
