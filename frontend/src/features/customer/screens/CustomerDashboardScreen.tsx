import React from 'react';
import { CustomerStageStepper } from '../components/CustomerStageStepper';
import { CustomerRefundHeroCard } from '../components/CustomerRefundHeroCard';
import { 
  CheckSquare, 
  FolderArchive, 
  PhoneCall, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useNavigate, useOutletContext } from 'react-router-dom';

export const CustomerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isConvertedCustomer } = useOutletContext<{ isConvertedCustomer?: boolean }>() || {};

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Standard Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isConvertedCustomer ? 'Taxpayer Certified Return & Filing Center' : 'Taxpayer Return Lifecycle & Filing Hub'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              H-1B Dual-Status
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {isConvertedCustomer
              ? 'Congratulations, Naveen Krishnan! Your TY 2025 Form 1040 has been certified and successfully e-filed with the IRS.'
              : 'Welcome back, Naveen Krishnan. Your TY 2025 return is currently active in Tax Prep Review with agent Kavya R.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/customer/documents')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{isConvertedCustomer ? 'View Filed 1040 Vault' : 'Upload Tax Slips'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Visual 6-Step Lifecycle Stepper Tracker */}
      <CustomerStageStepper isConvertedCustomer={Boolean(isConvertedCustomer)} />

      {/* 3. Refund Hero Calculation Card */}
      <CustomerRefundHeroCard
        fedRefund={2840}
        stateRefund={0}
        stateName="Texas (TX)"
        bankMasked="Chase Bank (•••• 4819)"
        isConvertedCustomer={Boolean(isConvertedCustomer)}
      />

      {/* 4. Quick Action Cards (3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 9-Module Organizer Action */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-100">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">9-Module Tax Organizer</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              You are <strong>85% complete</strong> (7 of 9 modules verified). Review stock trades & direct deposit routing.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/customer/organizer')}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-between cursor-pointer w-full"
          >
            <span>Resume Organizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Card 2: Documents Vault Action */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold border border-purple-100">
              <FolderArchive className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Multi-Year Documents Vault</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Access your historical Form 1040 returns (TY 2024, TY 2023) or upload missing TY 2025 W-2 statements.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/customer/documents')}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-between cursor-pointer w-full"
          >
            <span>Open Vault (3 Files)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Card 3: Dedicated Tax Team Contact */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold border border-emerald-100">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Dedicated CPA & Agent</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Have questions about deductions or dual-status filing? Contact <strong>Kavya R</strong> or your certifying CPA.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/customer/expert')}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-between cursor-pointer w-full"
          >
            <span>Chat / Request Call</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
