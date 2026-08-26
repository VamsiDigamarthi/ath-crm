import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppEmptyState } from '@/shared/components/AppEmptyState';

export const TaxReviewerQueueScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'REVISIONS' | 'APPROVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // QA Reviewer Queue Items (Arjun Varma return awaiting audit)
  const qaReviewItems = [
    {
      id: '3a73c237-e778-45a4-9d57-79171a59cd0e',
      taxpayerName: 'Arjun Varma',
      email: 'arjun.varma@gmail.com',
      taxYear: 2025,
      filingStatus: 'Married Filing Jointly (MFJ)',
      visaType: 'H-1B Specialty Occupation',
      location: 'Springfield, IL',
      complexity: 'STANDARD W-2',
      preparedBy: {
        name: 'Vikram Deshmukh',
        role: 'Tax Preparer',
        email: 'vikram.deshmukh@taxcrm.com'
      },
      computedWages: 130350,
      computedRefund: 5770,
      stateRefund: 840,
      verifiedDocsCount: 3,
      stage: 'QA_IN_REVIEW',
      stageLabel: 'Pending QA Audit',
      slaDueTime: 'Tomorrow, 05:00 PM',
      prepSubmittedAt: '10 mins ago',
      notes: 'Applied standard MFJ deduction ($29,200). Illinois state residency schedule attached.'
    }
  ];

  const filteredItems = qaReviewItems.filter((item) => {
    if (activeTab === 'PENDING' && item.stage !== 'QA_IN_REVIEW') return false;
    if (activeTab === 'REVISIONS' && item.stage !== 'QA_REVISION_REQUESTED') return false;
    if (activeTab === 'APPROVED' && item.stage !== 'QA_APPROVED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.taxpayerName.toLowerCase().includes(q) ||
        item.preparedBy.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* 1. Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-600" />
              <span>QA &amp; Compliance Audit Deck</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Senior QA Reviewer Audit Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Perform 4-Eyes compliance verification on 1040 drafts, audit deduction limits, and sign off returns for Sales pitch.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => {
              if (qaReviewItems.length > 0) {
                navigate(`/prep-review/reviewer/audit/${qaReviewItems[0].id}`);
              }
            }}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Start Priority Audit</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending QA Audits */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending 4-Eyes Audit</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">1</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Awaiting Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Returns submitted by Preparers
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 2: Audited & Signed Off */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Passed QA (Signed Off)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">0</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ready for Sales
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Transferred to sales pitch
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#16A34A] h-full rounded-full w-0" />
          </div>
        </div>

        {/* Card 3: Revisions Dispatched */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Sent Back for Revision</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">0</span>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                0 Discrepancies
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Flagged for calculation fixes
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full w-0" />
          </div>
        </div>

        {/* Card 4: First-Time Pass Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">First-Time Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">100%</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Top Quality
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Zero-defect compliance accuracy
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* 3. Queue Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All In Review ({qaReviewItems.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pending Audit (1)
            </button>
            <button
              onClick={() => setActiveTab('REVISIONS')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'REVISIONS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Revisions Sent (0)
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'APPROVED'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Signed Off (0)
            </button>
          </div>

          {/* Search Box */}
          <div className="w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search taxpayer, preparer..."
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredItems.length === 0 ? (
            <div className="py-12">
              <AppEmptyState
                icon={ShieldCheck}
                title="No Returns Awaiting Audit"
                description="Your QA audit queue is completely clear. Returns will appear here as soon as Preparers complete 1040 drafts."
              />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Taxpayer Client</th>
                  <th className="py-3.5 px-4">Drafted By Preparer</th>
                  <th className="py-3.5 px-4">Computed 1040 Refund</th>
                  <th className="py-3.5 px-4">Documents Vault</th>
                  <th className="py-3.5 px-4">Target SLA Time</th>
                  <th className="py-3.5 px-4 text-center">Audit Stage</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Taxpayer Client */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-purple-100 border border-purple-200 text-purple-800">
                          {item.taxpayerName[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{item.taxpayerName}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              TY {item.taxYear}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {item.email} • {item.filingStatus}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Drafted By Preparer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center border border-blue-200">
                          {item.preparedBy.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.preparedBy.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Submitted {item.prepSubmittedAt}</div>
                        </div>
                      </div>
                    </td>

                    {/* Computed 1040 Refund */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-xs text-emerald-700">
                        +${item.computedRefund.toLocaleString()} Fed Refund
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        State: +${item.stateRefund.toLocaleString()} • Gross: ${item.computedWages.toLocaleString()}
                      </div>
                    </td>

                    {/* Documents Vault */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>{item.verifiedDocsCount} Docs Verified</span>
                      </span>
                    </td>

                    {/* Target SLA Time */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.slaDueTime}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Standard 24h SLA</div>
                    </td>

                    {/* Audit Stage */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                        <span>{item.stageLabel}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/prep-review/reviewer/audit/${item.id}`)}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-3.5 h-8 flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Start Audit</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
