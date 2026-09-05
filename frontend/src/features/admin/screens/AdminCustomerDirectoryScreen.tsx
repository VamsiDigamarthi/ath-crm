import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileCheck2, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppPagination } from '@/shared/components/AppPagination';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { AppModal } from '@/shared/components/AppModal';
import { useCustomerDirectory } from '../hooks/useCustomerDirectory';

export const AdminCustomerDirectoryScreen: React.FC = () => {
  const {
    loading,
    data,
    stats,
    searchQuery,
    selectedTaxYear,
    selectedFilingStatus,
    selectedCustomer,
    taxYearOptions,
    setSelectedCustomer,
    handleSearchChange,
    handleYearChange,
    handleStatusChange,
    handlePageChange,
    fetchCustomers,
  } = useCustomerDirectory();

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Converted Customers & Clients Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Paid & Retained Clients</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Directory of officially converted taxpayers with Form 1040 certified filings, IRS Acceptance/Rejection outcomes, and payment records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            disabled={loading}
            className="border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Converted Clients */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">Converted Clients</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalConverted}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Retained Taxpayers</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* IRS Accepted */}
        <div className="p-5 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600">IRS Accepted</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalAccepted}</div>
            <div className="text-[11px] text-emerald-500 font-medium mt-0.5">100% E-File Acknowledged</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* IRS Rejected */}
        <div className="p-5 rounded-xl bg-white border border-rose-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600">IRS Rejected</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{stats.totalRejected}</div>
            <div className="text-[11px] text-rose-400 font-medium mt-0.5">Correction Required</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Revenue Realized */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600">Revenue Realized</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ${stats.totalFeesCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Service Fees Paid</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Dual Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Debounced Search bar */}
          <div className="flex-1 max-w-md">
            <AppSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search clients by name, email, phone, SSN, city..."
              enableShortcut={false}
              className="w-full text-xs"
            />
          </div>

          {/* Reusable AppSelect Dropdown for Tax Year Filter */}
          <div className="w-full md:w-56">
            <AppSelect
              options={taxYearOptions}
              value={selectedTaxYear}
              onChange={handleYearChange}
              placeholder="Select Tax Year"
              className="w-full text-xs font-medium"
            />
          </div>
        </div>

        {/* IRS Filing Outcome Quick Filter Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 mr-1">
            Filing Status:
          </span>
          <button
            type="button"
            onClick={() => handleStatusChange('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilingStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Statuses
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('ACCEPTED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilingStatus === 'ACCEPTED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>IRS Accepted ({stats.totalAccepted})</span>
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('REJECTED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilingStatus === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>IRS Rejected ({stats.totalRejected})</span>
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('IN_PROGRESS')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilingStatus === 'IN_PROGRESS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>In Transmission ({stats.totalInProgress})</span>
          </button>
        </div>
      </div>

      {/* 4. Customer Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500">
                <th className="py-3.5 px-4">Client Profile</th>
                <th className="py-3.5 px-4">Contact & Location</th>
                <th className="py-3.5 px-4">Tax Return Summary</th>
                <th className="py-3.5 px-4">Assigned Team</th>
                <th className="py-3.5 px-4">Service Fee & PIN</th>
                <th className="py-3.5 px-4">IRS E-Filing Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                      <span className="text-xs font-medium">Loading converted clients...</span>
                    </div>
                  </td>
                </tr>
              ) : !data?.customers?.length ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <AppEmptyState
                      icon={Users}
                      title="No Converted Clients Found"
                      description="No records match your active Tax Year or IRS Filing Status filter criteria."
                      action={{
                        label: "Reset All Filters",
                        onClick: () => {
                          handleYearChange('ALL');
                          handleStatusChange('ALL');
                          handleSearchChange('');
                        }
                      }}
                    />
                  </td>
                </tr>
              ) : (
                data.customers.map((c) => {
                  const app = c.activeApplication;
                  const hasDue = app && (app.fedDue > 0 || app.stateDue > 0);

                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      {/* Client Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                            app?.irsStatus === 'ACCEPTED'
                              ? 'bg-emerald-500 text-white'
                              : app?.irsStatus === 'REJECTED'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-white'
                          }`}>
                            {c.firstName[0] || 'C'}{c.lastName?.[0] || ''}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                              <span>{c.fullName}</span>
                              <span title="Verified Client">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>SSN: {c.ssnMasked}</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                                {c.visaType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.city}, {c.state}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tax Return Summary */}
                      <td className="py-4 px-4">
                        {app ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-900">TY{app.taxYear}</span>
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {app.currentStage.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {hasDue ? (
                              <div className="text-[11px] font-bold text-rose-600">
                                Total Due: -${(app.fedDue + app.stateDue).toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-[11px] font-bold text-emerald-600">
                                Refund: +${(app.fedRefund + app.stateRefund).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No active draft</span>
                        )}
                      </td>

                      {/* Assigned Specialists */}
                      <td className="py-4 px-4">
                        {app?.assignedTeam ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="text-slate-700">
                              <span className="text-slate-400 font-medium">CPA:</span> {app.assignedTeam.reviewAgent}
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              <span className="text-slate-400 font-medium">Filer:</span> {app.assignedTeam.fileOperator}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Service Fee & PIN */}
                      <td className="py-4 px-4">
                        {app ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                app.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                ${app.paidAmount || 227} {app.paymentStatus}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              PIN: {app.taxpayerPin || '66666'} ({app.esignStatus})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* IRS E-Filing Status */}
                      <td className="py-4 px-4">
                        {app?.irsStatus === 'ACCEPTED' ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>IRS Accepted</span>
                            </span>
                            {app.certificateId && (
                              <div className="text-[10px] text-emerald-700">
                                Cert: {app.certificateId}
                              </div>
                            )}
                          </div>
                        ) : app?.irsStatus === 'REJECTED' ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1 shadow-xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>IRS Rejected</span>
                            </span>
                            {app.rejectionCode && (
                              <div className="text-[10px] text-rose-600 font-medium">
                                Code: {app.rejectionCode}
                              </div>
                            )}
                          </div>
                        ) : app?.irsStatus === 'IN_PROGRESS' ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              <span>Transmitting</span>
                            </span>
                          </div>
                        ) : app?.irsStatus === 'QUEUED' ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Filing Queue</span>
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                              <span>Awaiting E-File</span>
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(c);
                          }}
                          className="border-slate-200 text-xs font-bold flex items-center gap-1 ml-auto cursor-pointer rounded-xl"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Unified AppPagination */}
        {data?.pagination && (
          <div className="p-4 border-t border-slate-100">
            <AppPagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              itemsPerPage={data.pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* 5. Standardized AppModal for Customer 360 Detail View */}
      {selectedCustomer && (
        <AppModal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs text-white ${
                selectedCustomer.activeApplication?.irsStatus === 'ACCEPTED'
                  ? 'bg-emerald-500'
                  : selectedCustomer.activeApplication?.irsStatus === 'REJECTED'
                  ? 'bg-rose-500'
                  : 'bg-slate-800'
              }`}>
                {selectedCustomer.firstName[0]}{selectedCustomer.lastName?.[0] || ''}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">{selectedCustomer.fullName}</span>
                  {selectedCustomer.activeApplication?.irsStatus === 'ACCEPTED' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>IRS Accepted</span>
                    </span>
                  ) : selectedCustomer.activeApplication?.irsStatus === 'REJECTED' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>IRS Rejected</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedCustomer.activeApplication?.irsStatusLabel || 'In Pipeline'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  SSN: {selectedCustomer.ssnMasked} • {selectedCustomer.visaType} ({selectedCustomer.filingStatus})
                </p>
              </div>
            </div>
          }
          width="680px"
          footer={
            <div className="flex items-center justify-end w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="border-slate-200 text-xs font-bold cursor-pointer rounded-xl"
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="p-6 space-y-5 text-xs font-sans">
            {/* Profile & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Contact Coordinates
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedCustomer.city}, {selectedCustomer.state}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Tax Profile Details
                </span>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Visa Classification:</span>
                  <strong className="text-slate-900 font-bold">{selectedCustomer.visaType}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Marital Status:</span>
                  <strong className="text-slate-900 font-bold">{selectedCustomer.filingStatus}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Client Since:</span>
                  <strong className="text-slate-900 font-bold">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            {/* Active Tax Return Details */}
            {selectedCustomer.activeApplication ? (
              <div className="p-5 rounded-xl bg-slate-900 text-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm">
                      Tax Year {selectedCustomer.activeApplication.taxYear} Form 1040 Certified Filing
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedCustomer.activeApplication.irsStatus === 'ACCEPTED'
                      ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                      : selectedCustomer.activeApplication.irsStatus === 'REJECTED'
                      ? 'bg-rose-400/20 text-rose-300 border-rose-400/30'
                      : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                  }`}>
                    {selectedCustomer.activeApplication.irsStatusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Federal Due/Refund</span>
                    <strong className={`text-sm font-bold mt-0.5 block ${selectedCustomer.activeApplication.fedDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedCustomer.activeApplication.fedDue > 0 ? `-$${selectedCustomer.activeApplication.fedDue.toLocaleString()}` : `+$${selectedCustomer.activeApplication.fedRefund.toLocaleString()}`}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">State Due/Refund</span>
                    <strong className={`text-sm font-bold mt-0.5 block ${selectedCustomer.activeApplication.stateDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedCustomer.activeApplication.stateDue > 0 ? `-$${selectedCustomer.activeApplication.stateDue.toLocaleString()}` : `+$${selectedCustomer.activeApplication.stateRefund.toLocaleString()}`}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Service Fee</span>
                    <strong className="text-sm font-bold text-emerald-400 mt-0.5 block">
                      ${selectedCustomer.activeApplication.paidAmount || 227} Paid
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Form 8879 PIN</span>
                    <strong className="text-sm font-bold text-white mt-0.5 block">
                      {selectedCustomer.activeApplication.taxpayerPin || '66666'}
                    </strong>
                  </div>
                </div>

                {/* Submission & Certificate or Rejection Details */}
                {selectedCustomer.activeApplication.irsStatus === 'ACCEPTED' && selectedCustomer.activeApplication.submissionId && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-200">
                    <span>IRS Submission ID: <strong className="text-white font-bold">{selectedCustomer.activeApplication.submissionId}</strong></span>
                    {selectedCustomer.activeApplication.certificateId && (
                      <span>Certificate: <strong className="text-emerald-300 font-bold">{selectedCustomer.activeApplication.certificateId}</strong></span>
                    )}
                  </div>
                )}

                {selectedCustomer.activeApplication.irsStatus === 'REJECTED' && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1 text-[11px] text-rose-200">
                    <div className="flex items-center gap-1.5 font-bold text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>IRS Transmission Rejection (Error Code: {selectedCustomer.activeApplication.rejectionCode || 'R0000-900-01'})</span>
                    </div>
                    <p className="text-[11px] text-rose-300/80">
                      {selectedCustomer.activeApplication.rejectionReason || 'Name and SSN control does not match IRS master file. Please review taxpayer demographics.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                No active tax returns for this client
              </div>
            )}
          </div>
        </AppModal>
      )}
    </div>
  );
};
