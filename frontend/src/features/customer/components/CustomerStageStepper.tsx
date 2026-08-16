import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  CreditCard, 
  FileSignature, 
  SendHorizontal,
  Sparkles
} from 'lucide-react';

interface CustomerStageStepperProps {
  isConvertedCustomer?: boolean;
}

export const CustomerStageStepper: React.FC<CustomerStageStepperProps> = ({
  isConvertedCustomer = false,
}) => {
  const steps = isConvertedCustomer
    ? [
        { id: 1, name: 'Intake Started', description: 'Account verified & organizer completed', icon: CheckCircle2, status: 'COMPLETED' },
        { id: 2, name: 'Tax Prep & W-2 Review', description: 'W-2 wages & documents verified', icon: CheckCircle2, status: 'COMPLETED' },
        { id: 3, name: 'Quotation Approved', description: '$199 CPA service fee paid via Stripe', icon: CheckCircle2, status: 'COMPLETED' },
        { id: 4, name: 'Form 1040 Preparation', description: 'CPA prepared Federal & State returns', icon: CheckCircle2, status: 'COMPLETED' },
        { id: 5, name: 'Form 8879 Signed', description: 'Taxpayer signature authorized', icon: CheckCircle2, status: 'COMPLETED' },
        { id: 6, name: 'IRS E-Filed & Accepted', description: 'Refund direct deposit scheduled by IRS', icon: SendHorizontal, status: 'COMPLETED' },
      ]
    : [
        { id: 1, name: 'Intake Started', description: 'Account activated & organizer initiated', icon: CheckCircle2, status: 'COMPLETED' },
        { id: 2, name: 'Tax Prep & W-2 Review', description: 'Documenter reviewing wage slips & deductions', icon: Clock, status: 'ACTIVE' },
        { id: 3, name: 'Quotation & Fee Approval', description: 'Review transparent CPA fee quotation ($199)', icon: CreditCard, status: 'UPCOMING' },
        { id: 4, name: 'Form 1040 Preparation', description: 'Senior CPA preparing Federal & State returns', icon: FileCheck2, status: 'UPCOMING' },
        { id: 5, name: 'Form 8879 E-Signature', description: 'Verify draft & electronically sign', icon: FileSignature, status: 'UPCOMING' },
        { id: 6, name: 'IRS E-Filed & Accepted', description: 'Return transmitted to IRS & State Dept', icon: SendHorizontal, status: 'UPCOMING' },
      ];

  const currentStepNum = isConvertedCustomer ? 6 : 2;
  const progressPercent = isConvertedCustomer ? 100 : 33;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">TY 2025 Tax Return Filing Progress</span>
            {isConvertedCustomer ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                Stage: IRS E-Filed & Accepted
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Stage: Active in Tax Prep Review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isConvertedCustomer 
              ? 'Your return is certified and transmitted to the IRS. Payout scheduled to your Chase account.'
              : 'Track your return through our 6-step IRS filing certification pipeline.'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-700">Step {currentStepNum} of 6</span>
          <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-[#16A34A] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Stepper Node Flow */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'COMPLETED';
          const isActive = step.status === 'ACTIVE';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 relative ${
                isActive
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : isCompleted
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-white border-slate-200/70 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isActive
                      ? 'bg-[#16A34A] text-white shadow-2xs'
                      : isCompleted
                      ? 'bg-emerald-100 text-[#16A34A]'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">0{step.id}</span>
              </div>

              <div>
                <div className={`text-xs font-bold ${isActive ? 'text-emerald-950' : isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.name}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 font-medium line-clamp-2">
                  {step.description}
                </p>
              </div>

              {isActive && (
                <div className="pt-1.5 border-t border-emerald-200/80 flex items-center gap-1 text-[10px] font-bold text-[#16A34A]">
                  <Sparkles className="w-3 h-3" />
                  <span>In Progress</span>
                </div>
              )}
              {isCompleted && (
                <div className="pt-1.5 border-t border-slate-200 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  <span>Done</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
