import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface ReviewModule4WagesProps {
  m4: any;
}

export const ReviewModule4Wages: React.FC<ReviewModule4WagesProps> = ({ m4 }) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>W-2 Wages Breakdown</span>
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
            <span className="text-slate-400 block text-[10px]">Primary Employer Name:</span>
            <span className="font-bold text-slate-900 text-sm block">{m4.employerName || 'Energy Grid Systems Inc.'}</span>
            <span className="text-slate-400 block text-[10px] mt-2">Estimated Wages (Box 1):</span>
            <span className="font-extrabold text-emerald-700 text-base">
              ${Number(m4.estimatedWages || 135000).toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
            <span className="text-slate-400 block text-[10px]">W-2 Slips Reported:</span>
            <span className="font-bold text-slate-900 text-sm block">{m4.w2List?.length || (m4.hasW2 ? 1 : 0)} Employer(s)</span>
            <span className="text-slate-400 block text-[10px] mt-2">Rental Properties (Schedule E):</span>
            <span className="font-bold text-slate-900 text-sm block">
              {m4.rentalProperties?.length || (m4.hasRentalProperty ? 1 : 0)} Property(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
