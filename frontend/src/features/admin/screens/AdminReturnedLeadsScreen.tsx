import React, { useMemo } from 'react';
import { useReturnedLeads, type ReturnedLeadItem } from '../hooks/useReturnedLeads';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppDrawer } from '@/shared/components/AppDrawer';
import { Button } from '@/shared/components/Button';
import { LeadAssignmentModal } from '@/features/documenter/components/LeadAssignmentModal';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import {
  RotateCcw,
  RefreshCw,
  Zap,
  UserCheck,
  Globe,
  Eye,
  PhoneCall,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';

export const AdminReturnedLeadsScreen: React.FC = () => {
  const {
    leads,
    agents,
    isLoading,
    isActionLoading,
    searchQuery,
    visaFilter,
    taxYearFilter,
    priorityFilter,
    departmentFilter,
    page,
    limit,
    totalPages,
    totalItems,
    selectedRows,
    setSelectedRows,
    isAssignModalOpen,
    isAuditDrawerOpen,
    activeLeadForAudit,
    handleSearchChange,
    handleVisaChange,
    handleTaxYearChange,
    handlePriorityChange,
    handleDepartmentChange,
    handlePageChange,
    handleLimitChange,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleOpenAuditDrawer,
    handleCloseAuditDrawer,
    handleDirectAssign,
    handleAutoRoundRobin,
    refreshData,
  } = useReturnedLeads();

  // Define Table Columns
  const columns: ColumnDef<ReturnedLeadItem>[] = useMemo(
    () => [
      {
        header: 'Taxpayer Client',
        render: (lead: ReturnedLeadItem) => {
          const initials = `${lead.customer?.firstName?.[0] || ''}${lead.customer?.lastName?.[0] || ''}`.toUpperCase() || 'TX';
          const isSales = lead.department === 'SALES';
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border shrink-0 ${
                  isSales
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {initials}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>{lead.customer?.firstName} {lead.customer?.lastName}</span>
                  <ClientPaymentStatusChip lead={lead} size="xs" />
                  {lead.customer?.visaType && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {lead.customer.visaType}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {lead.customer?.occupation || 'Taxpayer'} {lead.customer?.ssnTin ? `• SSN: ***-**-${lead.customer.ssnTin.slice(-4)}` : ''}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Department / Source',
        render: (lead: ReturnedLeadItem) => {
          const isSales = lead.department === 'SALES';
          return (
            <div className="space-y-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isSales
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSales ? 'bg-blue-600' : 'bg-amber-600'}`} />
                <span>{isSales ? 'Sales Closer Return' : 'Documenter Return'}</span>
              </span>
              <div className="text-[10px] text-slate-400 font-medium">
                {isSales ? 'Fee Quotation & Pitch' : 'Calling Outreach & Intake'}
              </div>
            </div>
          );
        },
      },
      {
        header: 'Contact Information',
        render: (lead: ReturnedLeadItem) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[160px]">{lead.customer?.email || 'No email'}</span>
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
        header: 'Location & Year',
        render: (lead: ReturnedLeadItem) => (
          <div>
            <div className="text-xs font-semibold text-slate-800">
              {lead.customer?.city ? `${lead.customer.city}, ${lead.customer.state || ''}` : 'Location N/A'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              TY {lead.taxYear} • {lead.filingType || 'INDIVIDUAL'}
            </div>
          </div>
        ),
      },
      {
        header: 'Priority',
        render: (lead: ReturnedLeadItem) => (
          <PriorityBadge priority={lead.priority || 'NO_PRIORITY'} size="sm" />
        ),
      },
      {
        header: 'Return Details',
        render: (lead: ReturnedLeadItem) => {
          const isSales = lead.department === 'SALES';
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                    isSales
                      ? 'bg-blue-100/70 text-blue-950 border-blue-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  <RotateCcw className={`w-2.5 h-2.5 ${isSales ? 'text-blue-700' : 'text-amber-700'}`} />
                  <span className="truncate max-w-[200px]" title={lead.returnedReason}>
                    {lead.returnedReason || (isSales ? 'Client Not Converting' : 'Not Interested')}
                  </span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>By {lead.returnedBy}</span>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Last Call / Previous Agent',
        render: (lead: ReturnedLeadItem) => (
          <div>
            <div className="text-xs font-semibold text-slate-800">
              {lead.previousAgentName || 'Unassigned'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-slate-400" />
              <span>{lead.totalCalls} dial{lead.totalCalls === 1 ? '' : 's'} logged</span>
              {lead.lastCallLog?.disposition && (
                <span className="text-slate-500">({lead.lastCallLog.disposition})</span>
              )}
            </div>
          </div>
        ),
      },
      {
        header: 'Actions',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        render: (lead: ReturnedLeadItem) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenAuditDrawer(lead)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Audit</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenAssignModal(lead)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign</span>
            </Button>
          </div>
        ),
      },
    ],
    [handleOpenAuditDrawer, handleOpenAssignModal]
  );

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Returned &amp; Unassigned Leads Pool
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
              Admin Direct Routing
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Super Admin queue of prospect and quotation leads released by Calling Agents and Sales Closers. Directly assign or auto-distribute to Documenter Calling Agents or Sales Closers without manager intermediaries.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleAutoRoundRobin()}
            disabled={leads.length === 0 || isActionLoading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer px-3.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>1-Click Auto Round-Robin</span>
          </Button>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          <div className="w-full sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by taxpayer name, phone, email, SSN..."
              debounceMs={300}
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="DOCUMENTER">Documenter Outreach</option>
              <option value="SALES">Sales Closer Pitch</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Visa:</span>
            <select
              value={visaFilter}
              onChange={(e) => handleVisaChange(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Visas</option>
              <option value="H-1B">H-1B</option>
              <option value="L-1">L-1</option>
              <option value="F-1 OPT">F-1 OPT</option>
              <option value="H-4">H-4</option>
              <option value="GREEN_CARD">Green Card</option>
              <option value="US_CITIZEN">US Citizen</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Tax Year:</span>
            <select
              value={taxYearFilter || ''}
              onChange={(e) => handleTaxYearChange(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="">All Years</option>
              <option value="2025">TY 2025</option>
              <option value="2024">TY 2024</option>
              <option value="2023">TY 2023</option>
            </select>
          </div>

          <PriorityFilterSelect
            value={priorityFilter}
            onChange={handlePriorityChange}
          />
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleOpenAssignModal()}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer px-4 animate-in fade-in"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Selected ({selectedRows.length})</span>
            </Button>
          </div>
        )}
      </div>

      {/* 3. Data Table */}
      <AppTable<ReturnedLeadItem>
        data={leads}
        columns={columns}
        selectable
        selectedRows={selectedRows}
        rowKey="id"
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        emptyText="No returned leads in the pool. All prospects and sales returns have been successfully assigned!"
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          perPageOptions: [5, 10, 20, 50],
          onPageChange: handlePageChange,
          onPerPageChange: handleLimitChange,
        }}
      />

      {/* 4. Floating Action Bar when rows are checked */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
              {selectedRows.length}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {selectedRows.length} Returned Lead{selectedRows.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => handleAutoRoundRobin(selectedRows.map((r) => r.id))}
            disabled={isActionLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-3.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-200" />
            <span>Auto Round-Robin</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAssignModal()}
            disabled={isActionLoading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Direct Assign Agent / Closer</span>
          </Button>

          <button
            type="button"
            onClick={() => setSelectedRows([])}
            className="text-slate-400 hover:text-white text-xs font-medium cursor-pointer ml-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 5. Lead Assignment Modal (Supporting Documenter Calling Agents & Sales Closers) */}
      <LeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        selectedLeads={selectedRows as any}
        agents={agents}
        onConfirmDirectAssign={handleDirectAssign}
        onConfirmRoundRobin={() => handleAutoRoundRobin(selectedRows.map((r) => r.id))}
        isLoading={isActionLoading}
      />

      {/* 6. Taxpayer 360 & Audit Trail Drawer */}
      <AppDrawer
        isOpen={isAuditDrawerOpen}
        onClose={handleCloseAuditDrawer}
        className="sm:max-w-[700px] md:max-w-[820px] lg:max-w-[920px]"
        title={
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center border ${
                activeLeadForAudit?.department === 'SALES'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {activeLeadForAudit?.customer?.firstName?.[0] || 'T'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{activeLeadForAudit?.customer?.firstName} {activeLeadForAudit?.customer?.lastName}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    activeLeadForAudit?.department === 'SALES'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {activeLeadForAudit?.department === 'SALES' ? 'Sales Closer Return' : 'Documenter Return'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                TY {activeLeadForAudit?.taxYear} • SSN: ***-**-{activeLeadForAudit?.customer?.ssnTin?.slice(-4) || 'N/A'} • {activeLeadForAudit?.customer?.email}
              </p>
            </div>
          </div>
        }
      >
        {activeLeadForAudit && (
          <div className="space-y-6">
            {/* Return Summary Alert */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                activeLeadForAudit.department === 'SALES'
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  activeLeadForAudit.department === 'SALES' ? 'text-blue-600' : 'text-amber-600'
                }`}
              />
              <div>
                <h4 className="text-xs font-bold">
                  Released by {activeLeadForAudit.department === 'SALES' ? 'Sales Closer' : 'Calling Agent'}: {activeLeadForAudit.returnedBy}
                </h4>
                <p className="text-xs mt-1 leading-relaxed">
                  <strong>Reason:</strong> {activeLeadForAudit.returnedReason}
                </p>
                <div className="text-[11px] font-medium mt-1 opacity-80">
                  Released at: {new Date(activeLeadForAudit.returnedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Audit Trail Section */}
            <LeadAuditTrailSection
              taxpayerName={`${activeLeadForAudit.customer?.firstName} ${activeLeadForAudit.customer?.lastName}`}
              taxpayerEmail={activeLeadForAudit.customer?.email}
              currentStage={activeLeadForAudit.currentStage}
              stageHistories={activeLeadForAudit.stageHistories || []}
              callLogs={activeLeadForAudit.callLogs || []}
              auditLogs={activeLeadForAudit.auditLogs || []}
            />
          </div>
        )}
      </AppDrawer>
    </div>
  );
};
