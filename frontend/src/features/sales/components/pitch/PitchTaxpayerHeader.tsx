import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { SalesStageBadge } from '../common/SalesStageBadge';
import type { SalesLeadItem } from '../../types/sales.types';

interface PitchTaxpayerHeaderProps {
  lead: SalesLeadItem;
}

export const PitchTaxpayerHeader: React.FC<PitchTaxpayerHeaderProps> = ({ lead }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN';
  const backQueuePath = isManager ? '/sales/manager/queue' : '/sales/agent/queue';
  const [isExpandedRemarks, setIsExpandedRemarks] = useState(false);

  const rawRemarks = lead.qaAuditorRemarks || 'Form 1040 certified and approved for Sales pitch.';
  const isLongRemarks = rawRemarks.length > 160;
  const displayedRemarks = isLongRemarks && !isExpandedRemarks 
    ? `${rawRemarks.slice(0, 160)}...` 
    : rawRemarks;

  return (
    <div className="space-y-4">
      {/* 1. Navigation & Quick Meta Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(backQueuePath)}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isManager ? 'Back to Department Queue' : 'Back to Pitch Queue'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {lead.taxpayerName}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              TY {lead.taxYear} Form 1040
            </span>
            <SalesStageBadge stage={lead.currentStage} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mt-1">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {lead.taxpayerEmail}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {lead.taxpayerPhone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {lead.stateOfResidence} • {lead.visaType}
            </span>
          </div>
        </div>

        {/* Assigned Closer Pill */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            {lead.assignedSalesAgent?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Assigned Closer
            </div>
            <div className="text-xs font-bold text-slate-900">
              {lead.assignedSalesAgent?.name || 'Unassigned'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Certified 1040 Refund / Balance Due Banner */}
      <div className={`text-white p-6 rounded-2xl shadow-md space-y-4 ${
        lead.federalRefund > 0 
          ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800' 
          : lead.balanceDue > 0 
            ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950' 
            : 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-white/80">
              <ShieldCheck className={`w-4 h-4 ${lead.federalRefund > 0 ? 'text-emerald-300' : 'text-rose-300'}`} />
              <span>4-Eyes QA Certified Form 1040 Calculation Result</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
              {lead.federalRefund > 0 ? (
                <span className="text-emerald-200">+{lead.federalRefund.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              ) : lead.balanceDue > 0 ? (
                <span className="text-rose-300">-{lead.balanceDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              ) : (
                <span>$0.00</span>
              )}
              <span className={`text-base font-bold ${lead.federalRefund > 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                {lead.federalRefund > 0 ? 'Federal Tax Refund' : lead.balanceDue > 0 ? 'Federal Balance Due' : 'Federal Tax Balanced'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
            <div>
              <div className="text-[10px] text-white/70 font-bold uppercase">State Refund</div>
              <div className="text-base font-black text-white">
                {lead.stateRefund > 0 ? `+$${lead.stateRefund.toLocaleString()}` : '$0'}
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <div className="text-[10px] text-white/70 font-bold uppercase">Gross Income (Line 9)</div>
              <div className="text-base font-black text-white">
                ${lead.grossIncome.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Auditor Remarks Stamp with Interactive Read More / Read Less Toggle */}
        <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs text-white/90 font-medium">
          <div className="flex-1 min-w-0">
            <span className="font-bold text-white mr-1.5">Audited by {lead.qaAuditorName}:</span>
            <span className="italic break-words">
              "{displayedRemarks}"
            </span>
            {isLongRemarks && (
              <button
                type="button"
                onClick={() => setIsExpandedRemarks(!isExpandedRemarks)}
                className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-amber-100 underline underline-offset-2 cursor-pointer transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded"
              >
                <span>{isExpandedRemarks ? 'Read Less' : 'Read More'}</span>
                {isExpandedRemarks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
          <span className="text-[10px] text-white/70 shrink-0 self-start sm:self-center">
            Sign-Off: {new Date(lead.qaApprovedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
