import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  CreditCard, 
  FileSignature, 
  SendHorizontal
} from 'lucide-react';

interface CustomerStageStepperProps {
  isConvertedCustomer?: boolean;
  currentStage?: string;
}

export const CustomerStageStepper: React.FC<CustomerStageStepperProps> = ({
  isConvertedCustomer = false,
  currentStage = 'DOC_PREP',
}) => {
  // Determine active step from currentStage
  let activeStepId = 2;
  if (currentStage === 'RAW_PROSPECT' || currentStage === 'DOC_OUTREACH') activeStepId = 1;
  else if (currentStage === 'DOC_PREP') activeStepId = 2;
  else if (currentStage === 'SALES_PITCH_QUEUE' || currentStage === 'SALES_PITCHING') activeStepId = 3;
  else if (currentStage === 'FILING_QUEUE' || currentStage === 'FILING_IN_PROGRESS') activeStepId = 4;
  else if (currentStage === 'FILING_SUCCESS' || isConvertedCustomer) activeStepId = 6;

  const baseSteps = [
    { id: 1, name: 'Intake Started', description: 'Account verified & organizer initiated', icon: CheckCircle2 },
    { id: 2, name: 'Tax Prep & W-2 Review', description: 'Documenter reviewing wage slips & deductions', icon: Clock },
    { id: 3, name: 'Quotation & Fee Approval', description: 'Review transparent CPA fee quotation ($199)', icon: CreditCard },
    { id: 4, name: 'Form 1040 Preparation', description: 'Senior CPA preparing Federal & State returns', icon: FileCheck2 },
    { id: 5, name: 'Form 8879 E-Signature', description: 'Verify draft & electronically sign', icon: FileSignature },
    { id: 6, name: 'IRS E-Filed & Accepted', description: 'Return transmitted to IRS & State Dept', icon: SendHorizontal },
  ];

  const steps = baseSteps.map((s) => {
    let status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING' = 'UPCOMING';
    if (s.id < activeStepId || isConvertedCustomer) {
      status = 'COMPLETED';
    } else if (s.id === activeStepId) {
      status = 'ACTIVE';
    }
    return { ...s, status };
  });

  const progressPercent = isConvertedCustomer ? 100 : Math.round((activeStepId / 6) * 100);

  const getStageBadge = () => {
    if (isConvertedCustomer || currentStage === 'FILING_SUCCESS') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          Stage: IRS E-Filed & Accepted
        </span>
      );
    }
    if (activeStepId === 2) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Stage: Active in Tax Prep Review
        </span>
      );
    }
    if (activeStepId === 3) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Stage: Quotation Ready for Approval
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        Stage: CPA Filing in Progress
      </span>
    );
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">TY 2025 Tax Return Filing Progress</span>
            {getStageBadge()}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isConvertedCustomer || currentStage === 'FILING_SUCCESS'
              ? 'Your return is certified and transmitted to the IRS. Payout scheduled to your bank account.'
              : 'Our expert team is reviewing your documents to maximize your deductions.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-extrabold text-slate-700">
            Step {isConvertedCustomer ? 6 : activeStepId} of 6
          </span>
          <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isConvertedCustomer ? 'bg-[#16A34A]' : 'bg-[#16A34A]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Responsive 6-Step Stepper Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isActive = step.status === 'ACTIVE';

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[92px] ${
                isActive
                  ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                  : isDone
                  ? 'bg-emerald-50/30 border-emerald-200 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200/80 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isActive
                      ? 'bg-amber-500 text-white'
                      : isDone
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isActive ? (
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <step.icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400">0{step.id}</span>
              </div>

              <div className="mt-2">
                <h4
                  className={`text-xs font-bold leading-tight ${
                    isActive ? 'text-amber-900' : isDone ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                  {step.description}
                </p>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-100/80 flex items-center gap-1">
                {isDone ? (
                  <span className="text-[10px] font-bold text-[#16A34A] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : isActive ? (
                  <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-amber-500" /> In Progress
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">Upcoming</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
