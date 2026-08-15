import React from 'react';
import { FileSpreadsheet, Calendar, Sparkles } from 'lucide-react';

interface BulkImportHeroProps {
  taxYear: number;
  onTaxYearChange: (year: number) => void;
  totalLeadsCount: number;
}

export const BulkImportHero: React.FC<BulkImportHeroProps> = ({
  taxYear,
  onTaxYearChange,
  totalLeadsCount,
}) => {
  const availableYears = [2024, 2025, 2026];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-[#16A34A] to-emerald-700 p-6 sm:p-7 text-white border border-emerald-600 shadow-sm">
      {/* Background ambient pattern */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
        <FileSpreadsheet className="w-80 h-80 text-white" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            Operations ➔ Ingestion & Deduplication Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Bulk Lead CSV Ingestion
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 mt-1.5 leading-relaxed">
            Upload raw prospect sheets to deduplicate against master customer profiles and route qualified cases directly to Documenter outreach queues.
          </p>
        </div>

        {/* Tax Year Selector Pills */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-100">
            <Calendar className="w-3.5 h-3.5 text-emerald-200" />
            <span>Target Filing Tax Year</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/15 p-1 rounded-xl">
            {availableYears.map((year) => {
              const isSelected = taxYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => onTaxYearChange(year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#16A34A] shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  TY {year}
                </button>
              );
            })}
          </div>
          {totalLeadsCount > 0 && (
            <div className="text-[11px] text-emerald-200 font-medium text-center">
              {totalLeadsCount} leads ready for review
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
