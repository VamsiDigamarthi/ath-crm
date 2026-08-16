import React from 'react';
import { FileCheck, ShieldAlert, CheckCircle2, UploadCloud } from 'lucide-react';

export const FilingDepartmentScreen: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            File Operator & CPA E-Filing Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Final review of Tax Returns, CPA signature verification, IRS MEF e-filing transmission, and confirmation acceptance tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <div className="text-xs text-slate-500 font-medium">Ready for IRS E-Filing</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <div className="text-xs text-slate-500 font-medium">IRS Transmission Pending</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <div className="text-xs text-slate-500 font-medium">Accepted by IRS & Completed</div>
          </div>
        </div>
      </div>

      <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto mb-3">
          <FileCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">CPA Filing Engine Active</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Applications will automatically appear here once fee payment is verified by Sales.
        </p>
      </div>
    </div>
  );
};
