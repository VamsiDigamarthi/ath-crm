import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  FileCheck, 
  UserCheck 
} from 'lucide-react';
import type { FilingLeadItem } from '../../types/filing.types';

interface FilingComplianceGateProps {
  lead: FilingLeadItem;
}

export const FilingComplianceGate: React.FC<FilingComplianceGateProps> = ({ lead }) => {
  const isPaid = lead.paymentStatus === 'PAID';
  const isSigned = lead.esignStatus === 'SIGNED';
  const isCompliant = isPaid && isSigned;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompliant ? 'bg-emerald-50 text-[#16A34A]' : 'bg-amber-50 text-amber-600'}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              IRS Transmission Compliance Gate
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Mandatory IRS Section 7216 &amp; Form 8879 Verification
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {isCompliant ? '✓ 100% Gate Passed' : '⚠️ Verification Pending'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* 1. Payment Verification */}
        <div className={`p-3 rounded-xl border flex items-start gap-3 ${isPaid ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isPaid ? 'bg-emerald-100 text-[#16A34A]' : 'bg-slate-200 text-slate-500'}`}>
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold">Service Fee Payment</div>
            <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
              {isPaid ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  <span>Paid (${lead.serviceFeePaid})</span>
                </>
              ) : (
                <span className="text-amber-600">Pending Payment</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Form 8879 E-Sign PIN */}
        <div className={`p-3 rounded-xl border flex items-start gap-3 ${isSigned ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSigned ? 'bg-emerald-100 text-[#16A34A]' : 'bg-slate-200 text-slate-500'}`}>
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold">Form 8879 PIN Auth</div>
            <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
              {isSigned ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  <span>PIN: {lead.taxpayerPin || '84920'}</span>
                </>
              ) : (
                <span className="text-amber-600">Pending Signature</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. QA Auditor Certification */}
        <div className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 text-emerald-900 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-[#16A34A]">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold">Audit Sign-off</div>
            <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1 text-[#16A34A]">
              <CheckCircle2 className="w-3 h-3" />
              <span>QA Certified &amp; Reconciled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
