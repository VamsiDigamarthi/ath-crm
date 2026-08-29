import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { SalesStageBadge } from '../common/SalesStageBadge';
import type { SalesLeadItem } from '../../types/sales.types';

interface PitchTaxpayerHeaderProps {
  lead: SalesLeadItem;
}

export const PitchTaxpayerHeader: React.FC<PitchTaxpayerHeaderProps> = ({ lead }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* 1. Navigation & Quick Meta Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/sales/agent/queue')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Pitch Queue</span>
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

      {/* 2. Hero Certified 1040 Refund Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>4-Eyes QA Certified Form 1040 Calculation Result</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
              {lead.federalRefund > 0 ? (
                <span>+${lead.federalRefund.toLocaleString()}</span>
              ) : (
                <span>-${lead.balanceDue.toLocaleString()}</span>
              )}
              <span className="text-base font-bold text-emerald-200">
                {lead.federalRefund > 0 ? 'Federal Tax Refund' : 'Federal Tax Due'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
            <div>
              <div className="text-[10px] text-emerald-200 font-bold uppercase">State Refund</div>
              <div className="text-base font-black text-white">
                {lead.stateRefund > 0 ? `+$${lead.stateRefund.toLocaleString()}` : '$0'}
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <div className="text-[10px] text-emerald-200 font-bold uppercase">Gross Income (Line 9)</div>
              <div className="text-base font-black text-white">
                ${lead.grossIncome.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Auditor Remarks Stamp */}
        <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-100 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Audited by {lead.qaAuditorName}:</span>
            <span className="italic">"{lead.qaAuditorRemarks}"</span>
          </div>
          <span className="text-[10px] text-emerald-200 shrink-0">
            Sign-Off: {new Date(lead.qaApprovedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
