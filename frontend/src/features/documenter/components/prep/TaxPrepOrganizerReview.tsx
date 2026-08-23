import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Globe, 
  FileSpreadsheet, 
  Landmark, 
  TrendingUp, 
  ShieldCheck, 
  Receipt, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Layers,
  LayoutGrid,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { isModuleCompleted } from '@/features/customer/components/organizer/utils/organizer-validation';

// Modular Review Sub-Components
import { ReviewModule1Demographics } from './review-modules/ReviewModule1Demographics';
import { ReviewModule2Dependents } from './review-modules/ReviewModule2Dependents';
import { ReviewModule3Presence } from './review-modules/ReviewModule3Presence';
import { ReviewModule4Wages } from './review-modules/ReviewModule4Wages';
import { ReviewModule5Interest } from './review-modules/ReviewModule5Interest';
import { ReviewModule6Stocks } from './review-modules/ReviewModule6Stocks';
import { ReviewModule7Foreign } from './review-modules/ReviewModule7Foreign';
import { ReviewModule8Deductions } from './review-modules/ReviewModule8Deductions';
import { ReviewModule9DirectDeposit } from './review-modules/ReviewModule9DirectDeposit';

interface TaxPrepOrganizerReviewProps {
  customerName: string;
  taxDraftSummary?: any;
}

export const TaxPrepOrganizerReview: React.FC<TaxPrepOrganizerReviewProps> = ({
  customerName,
  taxDraftSummary,
}) => {
  const organizer = taxDraftSummary?.organizer || {};
  const activeTaxYear = taxDraftSummary?.taxYear || organizer.taxYear || 2025;

  const [viewMode, setViewMode] = useState<'INSPECTOR' | 'GRID'>('INSPECTOR');
  const [selectedModId, setSelectedModId] = useState<string>('m1');
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  const toggleShow = (key: string) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const m1 = organizer.m1_demographics || {};
  const m2 = organizer.m2_dependents || {};
  const m3 = organizer.m3_presence || {};
  const m4 = organizer.m4_wages || {};
  const m5 = organizer.m5_interest || {};
  const m6 = organizer.m6_stocks || {};
  const m7 = organizer.m7_foreign || {};
  const m8 = organizer.m8_deductions || {};
  const m9 = organizer.m9_directDeposit || {};

  const modulesList = [
    { id: 'm1', number: 1, title: 'Personal Info, Visa & Marriage', icon: User, section: 'Demographics & Family' },
    { id: 'm2', number: 2, title: 'Spouse, Dependents & Daycare', icon: Users, section: 'Demographics & Family' },
    { id: 'm3', number: 3, title: 'Substantial Presence & Multi-State', icon: Globe, section: 'Residency & Visa' },
    { id: 'm4', number: 4, title: 'W-2 Wages & Rental Properties', icon: FileSpreadsheet, section: 'Wages & Income' },
    { id: 'm5', number: 5, title: '1099-INT / DIV / OID Interest', icon: Landmark, section: 'Wages & Income' },
    { id: 'm6', number: 6, title: '1099-B Stocks, ESPP, RSU & Losses', icon: TrendingUp, section: 'Wages & Income' },
    { id: 'm7', number: 7, title: 'FBAR / FATCA & Indian Income (INR)', icon: ShieldCheck, section: 'Foreign & FBAR' },
    { id: 'm8', number: 8, title: 'Itemized Deductions & Solar Energy', icon: Receipt, section: 'Deductions & Credits' },
    { id: 'm9', number: 9, title: 'Direct Deposit & $10 Referrals', icon: Building2, section: 'IRS Refund Payout' },
  ];

  const completedCount = modulesList.filter((m) => isModuleCompleted(m.id, organizer)).length;
  const progressPercent = Math.round((completedCount / 9) * 100);
  const currentModIndex = modulesList.findIndex((m) => m.id === selectedModId);

  return (
    <div className="space-y-4 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Header Bar with Dual View Modes & Live Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                9-Module Taxpayer Intake Audit
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                {progressPercent}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live intake responses submitted by <strong>{customerName}</strong>. Verified by Tax Prep Team.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Progress Pill */}
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-emerald-400">{completedCount} of 9 Modules Completed</span>
            <div className="w-28 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('INSPECTOR')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'INSPECTOR'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Module Inspector</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>9-Grid Overview</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs Ribbon */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          {modulesList.map((mod) => {
            const Icon = mod.icon;
            const isSelected = mod.id === selectedModId;
            const isDone = isModuleCompleted(mod.id, organizer);

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedModId(mod.id);
                  if (viewMode !== 'INSPECTOR') setViewMode('INSPECTOR');
                }}
                className={`px-3 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/70 hover:bg-emerald-50 text-slate-800 border-emerald-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : isDone
                      ? 'bg-emerald-100 text-[#16A34A]'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-extrabold uppercase ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                      0{mod.number}
                    </span>
                    <span className={`text-xs font-bold whitespace-nowrap ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {mod.title.split(',')[0]}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 ml-1">
                  {isDone ? (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          : 'bg-emerald-100 text-[#15803D] border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#16A34A]" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                        isSelected
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5 text-amber-500" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VIEW MODE: FULL MODULE INSPECTOR (Detailed Interactive Breakdown) */}
      {viewMode === 'INSPECTOR' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
          {/* Header of Active Module */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200 font-bold shrink-0">
                {React.createElement(modulesList[currentModIndex].icon, { className: 'w-5 h-5' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Module 0{modulesList[currentModIndex].number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                    {modulesList[currentModIndex].section}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {modulesList[currentModIndex].title}
                </h3>
              </div>
            </div>

            <div>
              {isModuleCompleted(selectedModId, organizer) ? (
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Taxpayer Submitted &amp; Verified ✓</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-2 shadow-2xs">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Draft Intake Pending Submission</span>
                </span>
              )}
            </div>
          </div>

          {/* Render Modular Review Subcomponent */}
          {selectedModId === 'm1' && (
            <ReviewModule1Demographics
              m1={m1}
              customerName={customerName}
              showSensitive={showSensitive}
              toggleShow={toggleShow}
            />
          )}

          {selectedModId === 'm2' && (
            <ReviewModule2Dependents
              m2={m2}
              showSensitive={showSensitive}
              toggleShow={toggleShow}
            />
          )}

          {selectedModId === 'm3' && (
            <ReviewModule3Presence
              m3={m3}
              selectedTaxYear={activeTaxYear}
              isSubmitted={isModuleCompleted('m3', organizer)}
            />
          )}

          {selectedModId === 'm4' && (
            <ReviewModule4Wages
              m4={m4}
              selectedTaxYear={activeTaxYear}
              isSubmitted={isModuleCompleted('m4', organizer)}
            />
          )}

          {selectedModId === 'm5' && (
            <ReviewModule5Interest
              m5={m5}
              selectedTaxYear={activeTaxYear}
              isSubmitted={isModuleCompleted('m5', organizer)}
            />
          )}

          {selectedModId === 'm6' && (
            <ReviewModule6Stocks
              m6={m6}
              selectedTaxYear={activeTaxYear}
              isSubmitted={isModuleCompleted('m6', organizer)}
            />
          )}

          {selectedModId === 'm7' && (
            <ReviewModule7Foreign
              m7={m7}
            />
          )}

          {selectedModId === 'm8' && (
            <ReviewModule8Deductions
              m8={m8}
            />
          )}

          {selectedModId === 'm9' && (
            <ReviewModule9DirectDeposit
              m9={m9}
              showSensitive={showSensitive}
              toggleShow={toggleShow}
            />
          )}

          {/* Quick Prev / Next Navigator Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (currentModIndex > 0) setSelectedModId(modulesList[currentModIndex - 1].id);
              }}
              disabled={currentModIndex === 0}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous (0{currentModIndex > 0 ? modulesList[currentModIndex - 1].number : 1})</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Reviewing Section {currentModIndex + 1} of 9
            </span>

            <button
              type="button"
              onClick={() => {
                if (currentModIndex < modulesList.length - 1) setSelectedModId(modulesList[currentModIndex + 1].id);
              }}
              disabled={currentModIndex === modulesList.length - 1}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Next (0{currentModIndex < modulesList.length - 1 ? modulesList[currentModIndex + 1].number : 9})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. VIEW MODE: 9-GRID OVERVIEW (High Level 3x3 Card Scanner) */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {modulesList.map((mod) => {
            const Icon = mod.icon;
            const isDone = isModuleCompleted(mod.id, organizer);

            return (
              <div
                key={mod.id}
                onClick={() => {
                  setSelectedModId(mod.id);
                  setViewMode('INSPECTOR');
                }}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-[#16A34A] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#16A34A] transition-colors">
                        0{mod.number}. {mod.title}
                      </h5>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isDone ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {isDone ? 'Submitted & Verified ✓' : 'Draft In Progress'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-[#16A34A] font-bold">
                  <span>Inspect Full Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
