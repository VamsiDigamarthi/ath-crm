import React from 'react';
import { CustomerStageStepper } from '../components/CustomerStageStepper';
import { CustomerRefundHeroCard } from '../components/CustomerRefundHeroCard';
import { 
  CheckSquare, 
  FolderArchive, 
  PhoneCall, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';

export const CustomerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTaxYear, isConvertedCustomer: contextConverted } = useOutletContext<{
    selectedTaxYear?: string;
    isConvertedCustomer?: boolean;
    customerProfile?: any;
    user?: any;
  }>() || {};

  // Real Backend Data from GET /api/v1/customer/dashboard
  const { dashboardData, loading, refetch } = useCustomerDashboard(selectedTaxYear);

  const isConverted = dashboardData?.taxpayer?.isConvertedCustomer ?? contextConverted ?? false;
  const taxpayerName = dashboardData?.taxpayer?.name || 'Naveen Krishnan';
  const visaBadge = dashboardData?.taxpayer?.visaType ? `${dashboardData.taxpayer.visaType} Taxpayer` : 'H-1B Dual-Status';
  const assignedAgentName = dashboardData?.assignedTeam?.docAgent?.name || 'Kavya R';

  const fedRefund = dashboardData?.refund?.fedRefund ?? 2840;
  const stateRefund = dashboardData?.refund?.stateRefund ?? 0;
  const stateLabel = dashboardData?.refund?.stateName || 'Texas (TX - 0% State Tax)';
  const bankMasked = dashboardData?.refund?.bankMasked || 'Chase Bank (•••• 4819)';

  const currentStage = dashboardData?.application?.currentStage || 'DOC_PREP';
  const docCount = dashboardData?.stats?.docCount ?? 0;
  const organizerPercent = dashboardData?.stats?.organizerPercent ?? 85;
  const organizerVerifiedCount = dashboardData?.stats?.organizerVerifiedCount ?? 7;
  const getGreetingMessage = () => {
    if (isConverted || currentStage === 'FILING_SUCCESS') {
      return `Congratulations, ${taxpayerName}! Your TY ${selectedTaxYear || '2025'} Form 1040 has been certified and successfully e-filed with the IRS.`;
    }
    if (currentStage === 'RAW_PROSPECT' || currentStage === 'DOC_OUTREACH') {
      return `Welcome back, ${taxpayerName}. Your TY ${selectedTaxYear || '2025'} file is in Document Intake. Please complete your 9-Module Organizer and upload your W-2 & 1099 slips.`;
    }
    if (currentStage === 'DOC_PREP') {
      return `Welcome back, ${taxpayerName}. Your TY ${selectedTaxYear || '2025'} return has been transferred to the Tax Preparation Department. Our CPA team is calculating your deductions.`;
    }
    if (currentStage === 'SALES_PITCH_QUEUE' || currentStage === 'SALES_PITCHING') {
      return `Welcome back, ${taxpayerName}. Your tax return draft is ready! Review your transparent fee quote and approve to initiate CPA e-filing.`;
    }
    if (currentStage === 'QA_IN_REVIEW' || currentStage === 'QA_APPROVED' || currentStage === 'FILING_QUEUE') {
      return `Welcome back, ${taxpayerName}. Your return is in Senior CPA Quality Assurance audit before IRS electronic submission.`;
    }
    return `Welcome back, ${taxpayerName}. Your return is actively in progress with agent ${assignedAgentName}.`;
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Standard Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isConverted ? 'Taxpayer Certified Return & Filing Center' : 'Taxpayer Return Lifecycle & Filing Hub'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {visaBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {getGreetingMessage()}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={loading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Refresh Live Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/customer/documents')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{isConverted ? 'View Filed 1040 Vault' : 'Upload Tax Slips'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Visual 6-Step Lifecycle Stepper Tracker */}
      <CustomerStageStepper 
        isConvertedCustomer={isConverted} 
        currentStage={currentStage} 
      />

      {/* 3. Refund Hero Calculation Card */}
      <CustomerRefundHeroCard
        fedRefund={fedRefund}
        stateRefund={stateRefund}
        stateName={stateLabel}
        bankMasked={bankMasked}
        isConvertedCustomer={isConverted}
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
              You are <strong>{organizerPercent}% complete</strong> ({organizerVerifiedCount} of 9 modules verified). Review stock trades & direct deposit routing.
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
              {isConverted 
                ? 'Access your certified Form 1040 return PDFs and official IRS electronic acceptance proofs.'
                : 'Upload your TY 2025 W-2 wage slips, 1099-INT bank statements, and Robinhood stock trades.'}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/customer/documents')}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-between cursor-pointer w-full"
          >
            <span>{isConverted ? 'Open Vault (5 Files Unlocked)' : `Open Vault (${docCount} Files)`}</span>
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
              Have questions about deductions or dual-status filing? Contact <strong>{assignedAgentName}</strong> or your certifying CPA.
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
