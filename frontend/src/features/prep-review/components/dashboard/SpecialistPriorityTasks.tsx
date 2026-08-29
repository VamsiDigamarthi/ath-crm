import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface SpecialistPriorityTasksProps {
  priorityPrepTask: {
    id: string;
    taxpayerName: string;
    taxYear: number;
    filingStatus: string;
    complexity?: string;
    designatedReviewer?: string;
    slaDueTime: string;
    status: string;
  } | null;
  priorityQATask: {
    id: string;
    taxpayerName: string;
    taxYear: number;
    filingStatus: string;
    preparedBy?: string;
    computedRefund: number;
    slaDueTime: string;
    status: string;
  } | null;
}

export const SpecialistPriorityTasks: React.FC<SpecialistPriorityTasksProps> = ({
  priorityPrepTask,
  priorityQATask,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Priority Preparer Task */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                My Priority 1040 Drafting Task
              </h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/prep-review/preparer')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Prep Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {priorityPrepTask ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{priorityPrepTask.taxpayerName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      TY {priorityPrepTask.taxYear || 2025}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {priorityPrepTask.filingStatus} • QA: <strong className="text-slate-700">{priorityPrepTask.designatedReviewer || '-'}</strong>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {priorityPrepTask.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{priorityPrepTask.slaDueTime}</span>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate(`/prep-review/preparer/workspace/${priorityPrepTask.id}`)}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Open 1040 Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No pending tax returns assigned for preparation drafting.
            </div>
          )}
        </div>
      </div>

      {/* 2. Priority QA Audit Task */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                My Priority QA Compliance Audit
              </h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/prep-review/reviewer')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Audit Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {priorityQATask ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{priorityQATask.taxpayerName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      TY {priorityQATask.taxYear || 2025}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-[#16A34A] border border-emerald-200">
                      +${priorityQATask.computedRefund.toLocaleString()} Fed Refund
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Drafted by: <strong className="text-slate-700">{priorityQATask.preparedBy || '-'}</strong> • {priorityQATask.filingStatus}
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {priorityQATask.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{priorityQATask.slaDueTime}</span>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate(`/prep-review/reviewer/audit/${priorityQATask.id}`)}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Start Compliance Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No pending tax returns awaiting your 4-Eyes QA audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
