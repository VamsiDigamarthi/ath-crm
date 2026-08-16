import React from 'react';
import { 
  Landmark, 
  ShieldCheck, 
  ArrowUpRight, 
  Building2
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';

interface CustomerRefundHeroCardProps {
  fedRefund?: number;
  stateRefund?: number;
  stateName?: string;
  bankMasked?: string;
  isDraft?: boolean;
  isConvertedCustomer?: boolean;
}

export const CustomerRefundHeroCard: React.FC<CustomerRefundHeroCardProps> = ({
  fedRefund = 2840,
  stateRefund = 0,
  stateName = 'Texas (TX)',
  bankMasked = 'Chase Bank (•••• 4819)',
  isConvertedCustomer = false,
}) => {
  const navigate = useNavigate();
  const totalRefund = fedRefund + stateRefund;

  return (
    <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xs p-6 relative overflow-hidden flex flex-col justify-between gap-6">
      
      {/* Background Glowing Ambient Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {isConvertedCustomer ? 'TY 2025 Certified IRS Return Payout' : 'TY 2025 Preliminary Refund Calculation'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
              isConvertedCustomer
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isConvertedCustomer ? 'Official IRS Accepted' : 'Intake Estimate'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {isConvertedCustomer ? 'Certified Total Tax Refund' : 'Estimated Total Tax Refund'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/customer/organizer')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>{isConvertedCustomer ? 'View Claimed Deductions' : 'Review Deductions'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Refund Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Box 1: Total Refund Hero */}
        <div className="p-5 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Net Total Refund</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
            +${totalRefund.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Federal + State combined payout
          </p>
        </div>

        {/* Box 2: Federal Refund */}
        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Federal Refund (IRS)</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            +${fedRefund.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Form 1040 Line 34 Preliminary
          </p>
        </div>

        {/* Box 3: State Refund */}
        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">{stateName}</span>
            <Landmark className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${stateRefund}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            No State Personal Income Tax in TX
          </p>
        </div>
      </div>

      {/* Bottom Payout & Security Banner */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-medium relative z-10">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Payout Method: <strong className="text-white">IRS Direct Deposit ({bankMasked})</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Maximum Refund Guarantee Certified</span>
        </div>
      </div>
    </div>
  );
};
