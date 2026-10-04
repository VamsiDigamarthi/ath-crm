import React, { useMemo } from 'react';
import { Check, Mail } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import toast from 'react-hot-toast';

export interface AssignedStaffMember {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface StaffTaxApplicationStageStepperProps {
  currentStage: string;
  taxDraftSummary?: any;
  assignedDocAgent?: AssignedStaffMember | null;
  assignedPrepAgent?: AssignedStaffMember | null;
  assignedReviewAgent?: AssignedStaffMember | null;
  assignedSalesAgent?: AssignedStaffMember | null;
  assignedFileOp?: AssignedStaffMember | null;
  className?: string;
}

interface StepConfig {
  id: number;
  key: string;
  title: string;
  defaultRole: string;
  assignee: AssignedStaffMember | null;
}

export const StaffTaxApplicationStageStepper: React.FC<StaffTaxApplicationStageStepperProps> = ({
  currentStage,
  taxDraftSummary,
  assignedDocAgent,
  assignedPrepAgent,
  assignedReviewAgent,
  assignedSalesAgent,
  assignedFileOp,
  className = '',
}) => {
  const { user } = useAuthStore();
  const isClientUser = user?.role === 'TAXPAYER_USER' || user?.role === 'CLIENT';

  // Only hide from client/taxpayer portal users
  if (isClientUser) {
    return null;
  }

  const stageUpper = String(currentStage || '').toUpperCase();
  const draftStatus = String(taxDraftSummary?.status || '').toUpperCase();
  const lastRevert = taxDraftSummary?.lastRevert;

  // Determine active step index (0: Doc, 1: Prep, 2: QA, 3: Sales, 4: Filing, 5: Completed)
  const activeStepIndex = useMemo(() => {
    if (stageUpper === 'FILING_SUCCESS' || stageUpper === 'COMPLETED') {
      return 5;
    }
    if (
      stageUpper === 'FILING_QUEUE' ||
      stageUpper === 'FILING_IN_PROGRESS' ||
      stageUpper === 'FILING_FAILED'
    ) {
      return 4; // IRS E-Filing
    }
    if (
      stageUpper.startsWith('SALES') ||
      stageUpper === 'QA_APPROVED' ||
      stageUpper === 'PAYMENT_PENDING' ||
      stageUpper === 'PAID_AND_AUTHORIZED'
    ) {
      return 3; // Sales & Pitch
    }
    if (
      stageUpper === 'QA_IN_REVIEW' ||
      stageUpper === 'QA_AUDIT' ||
      draftStatus === 'SUBMITTED_FOR_QA'
    ) {
      return 2; // QA Review
    }
    if (
      stageUpper === 'PREP_IN_PROGRESS' ||
      stageUpper === 'TAX_PREPARATION' ||
      stageUpper === 'CORRECTION_NEEDED' ||
      stageUpper === 'QA_REVISION_REQUESTED' ||
      (lastRevert && !lastRevert.resolved && lastRevert.targetDepartment === 'PREPARATION')
    ) {
      return 1; // Tax Preparation
    }
    // Default to Documentation
    return 0;
  }, [stageUpper, draftStatus, lastRevert]);

  // Define the 5 department steps
  const steps: StepConfig[] = [
    {
      id: 1,
      key: 'DOC',
      title: 'Documentation',
      defaultRole: 'Documenter (Manager Stage)',
      assignee: assignedDocAgent || (taxDraftSummary as any)?.assignedDocAgent || null,
    },
    {
      id: 2,
      key: 'PREP',
      title: 'Tax Preparation',
      defaultRole: 'Preparer (Manager Stage)',
      assignee: assignedPrepAgent || (taxDraftSummary as any)?.assignedPreparer || null,
    },
    {
      id: 3,
      key: 'QA',
      title: 'QA Review',
      defaultRole: 'QA Reviewer (Manager Stage)',
      assignee: assignedReviewAgent || (taxDraftSummary as any)?.assignedReviewer || null,
    },
    {
      id: 4,
      key: 'SALES',
      title: 'Sales & Pitch',
      defaultRole: 'Sales Closer (Manager Stage)',
      assignee: assignedSalesAgent || (taxDraftSummary as any)?.assignedSalesAgent || null,
    },
    {
      id: 5,
      key: 'FILING',
      title: 'IRS E-Filing',
      defaultRole: 'Filing Op (Manager Stage)',
      assignee: assignedFileOp || (taxDraftSummary as any)?.assignedFileOp || null,
    },
  ];

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    toast.success(`Copied ${email} to clipboard!`);
  };

  return (
    <div className={`w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs py-4 px-3 sm:px-6 font-sans ${className}`}>
      <div className="flex items-start justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative text-center">
              {/* Connector Line to next step */}
              {!isLast && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-[2px] -translate-y-1/2 z-0 transition-colors ${
                    idx < activeStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-white border-2 border-emerald-600 text-emerald-700 ring-4 ring-emerald-100 font-extrabold'
                    : 'bg-white border-2 border-slate-200 text-slate-400 font-semibold'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Labels Below Circle */}
              <div className="mt-2.5 flex flex-col items-center max-w-[120px] sm:max-w-[150px] text-center">
                {/* Stage Name */}
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent
                      ? 'text-emerald-800 font-bold'
                      : isCompleted
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </span>

                {/* Email if assigned / Role (Manager Stage) if not assigned */}
                <div className="mt-1">
                  {step.assignee?.email ? (
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmail(step.assignee!.email!, e)}
                      title={`Click to copy: ${step.assignee.email}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[100px] sm:max-w-[130px]">{step.assignee.email}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] sm:text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 inline-block leading-tight">
                      {step.defaultRole}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
