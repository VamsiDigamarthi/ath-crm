import React from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck2 
} from 'lucide-react';

export interface FilingManagerMetricsProps {
  readyCount: number;
  inProgressCount: number;
  acceptedCount: number;
  failedCount: number;
  totalCount: number;
}

export const FilingManagerMetrics: React.FC<FilingManagerMetricsProps> = ({
  readyCount,
  inProgressCount,
  acceptedCount,
  failedCount,
  totalCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Ready for MeF E-File */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Ready for MeF
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {readyCount}
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
            Paid &amp; PIN Signed
          </div>
        </div>
      </div>

      {/* 2. In MeF Transmission */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Transmitting MeF
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {inProgressCount}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            Gateway Handshake Active
          </div>
        </div>
      </div>

      {/* 3. Accepted by IRS */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Accepted by IRS
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {acceptedCount}
          </div>
          <div className="text-[10px] text-[#16A34A] font-semibold mt-0.5">
            Ack: 0000 Verified
          </div>
        </div>
      </div>

      {/* 4. Rejected / Error */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Rejected / Errors
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {failedCount}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
            0% Reject Rate
          </div>
        </div>
      </div>

      {/* 5. Total Department Returns */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total MeF Returns
          </span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalCount}
          </div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
            Department Pipeline
          </div>
        </div>
      </div>
    </div>
  );
};
