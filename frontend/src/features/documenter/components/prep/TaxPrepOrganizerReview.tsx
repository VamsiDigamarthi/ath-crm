import React, { useState, useEffect } from 'react';
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
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Eye,
  Save,
  X
} from 'lucide-react';
import { isModuleCompleted } from '@/features/customer/components/organizer/utils/organizer-validation';
import { OrganizerModuleContent } from '@/features/customer/components/organizer/OrganizerModuleContent';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';

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
  leadId?: string;
  customerName: string;
  taxDraftSummary?: any;
  onOrganizerSaved?: () => void;
}

export const TaxPrepOrganizerReview: React.FC<TaxPrepOrganizerReviewProps> = ({
  leadId,
  customerName,
  taxDraftSummary,
  onOrganizerSaved,
}) => {
  const organizer = taxDraftSummary?.organizer || {};
  const activeTaxYear = taxDraftSummary?.taxYear || organizer.taxYear || 2025;

  const [viewMode, setViewMode] = useState<'INSPECTOR' | 'GRID' | 'AGENT_EDIT'>('INSPECTOR');
  const [selectedModId, setSelectedModId] = useState<string>('m1');
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  
  // Local state for Agent Editing on Call
  const [localOrganizer, setLocalOrganizer] = useState<any>(organizer);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalOrganizer(taxDraftSummary?.organizer || {});
  }, [taxDraftSummary]);

  const toggleShow = (key: string) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateModuleField = (moduleKey: any, field: any, value: any) => {
    setLocalOrganizer((prev: any) => ({
      ...prev,
      [moduleKey]: {
        ...(prev?.[moduleKey] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveOrganizerOnCall = async () => {
    if (!leadId) {
      toast.error('Application Lead ID is missing');
      return;
    }
    try {
      setIsSaving(true);
      const existingSubmitted: string[] = localOrganizer.submittedModules || ['m1'];
      const submittedModules = Array.from(new Set([...existingSubmitted, selectedModId]));
      
      const payload = {
        ...localOrganizer,
        submittedModules,
      };

      await apiClient.put(`/documenter/leads/${leadId}/organizer`, {
        organizerData: payload,
        taxYear: activeTaxYear,
      });

      setLocalOrganizer(payload);
      toast.success(`Intake module saved & synced to database on call for ${customerName}! ✨`);
      if (onOrganizerSaved) onOrganizerSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save intake data');
    } finally {
      setIsSaving(false);
    }
  };

  const m1 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m1_demographics || {};
  const m2 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m2_dependents || {};
  const m3 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m3_presence || {};
  const m4 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m4_wages || {};
  const m5 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m5_interest || {};
  const m6 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m6_stocks || {};
  const m7 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m7_foreign || {};
  const m8 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m8_deductions || {};
  const m9 = (viewMode === 'AGENT_EDIT' ? localOrganizer : organizer).m9_directDeposit || {};

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

  const currentOrgData = viewMode === 'AGENT_EDIT' ? localOrganizer : organizer;
  const completedCount = modulesList.filter((m) => isModuleCompleted(m.id, currentOrgData)).length;
  const progressPercent = Math.round((completedCount / 9) * 100);
  const currentModIndex = modulesList.findIndex((m) => m.id === selectedModId);

  return (
    <div className="space-y-4 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Header Bar with Mode Toggles & Live Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                9-Module Taxpayer Intake {viewMode === 'AGENT_EDIT' ? '— Agent Live Entry' : 'Audit'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                {progressPercent}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {viewMode === 'AGENT_EDIT'
                ? `Entering / updating responses on call for ${customerName}. All saves are audit logged.`
                : `Live intake responses submitted by ${customerName}. Verified by Tax Prep Team.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
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

          {/* View Mode Toggle: Review Audit vs Fill on Call vs Grid */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('INSPECTOR')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'INSPECTOR'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Review & Audit responses"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('AGENT_EDIT')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'AGENT_EDIT'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
              title="Fill / edit fields on call"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Fill on Call</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="9-Grid overview"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
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
            const isDone = isModuleCompleted(mod.id, currentOrgData);

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedModId(mod.id);
                  if (viewMode === 'GRID') setViewMode('INSPECTOR');
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

                <div className="truncate">
                  <div className="text-xs font-bold leading-tight truncate">
                    0{mod.number}. {mod.title.split('&')[0]}
                  </div>
                  <div className="text-[10px] opacity-75 font-medium flex items-center gap-1 mt-0.5">
                    <span>{mod.section}</span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 inline shrink-0" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3A. AGENT EDIT MODE: Live Editable Module Form with 9-Column Wide Layout & Sticky 3-Column Ledger */}
      {viewMode === 'AGENT_EDIT' && (
        <div className="space-y-4">
          {/* Action Ribbon with Cancel / Exit Button */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                <strong>Agent Assisted Intake:</strong> Editing Module 0{currentModIndex + 1} for {customerName}. Saves will immediately sync to database and log an agent audit event.
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode('INSPECTOR')}
                className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 h-8 px-3 cursor-pointer"
                title="Cancel and return to Review Mode"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Cancel / Exit Edit</span>
              </Button>

              <Button
                size="sm"
                loading={isSaving}
                onClick={handleSaveOrganizerOnCall}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer h-8 px-3"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save &amp; Sync to File</span>
              </Button>
            </div>
          </div>

          {/* 9-Column Wide Form + 3-Column Sticky Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <OrganizerModuleContent
              className="lg:col-span-9 bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6"
              selectedModId={selectedModId}
              selectedTaxYear={activeTaxYear}
              organizerData={localOrganizer}
              updateModuleField={updateModuleField}
              onNext={() => {
                if (currentModIndex < modulesList.length - 1) {
                  setSelectedModId(modulesList[currentModIndex + 1].id);
                }
              }}
              onPrev={() => {
                if (currentModIndex > 0) {
                  setSelectedModId(modulesList[currentModIndex - 1].id);
                }
              }}
              onSave={handleSaveOrganizerOnCall}
              currentModIndex={currentModIndex}
              saving={isSaving}
            />

            {/* Right Summary Helper: Sticky & Slim */}
            <div className="lg:col-span-3 sticky top-4 self-start space-y-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Intake Ledger
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
                    {completedCount}/9 Done
                  </span>
                </div>

                <div className="space-y-1.5">
                  {modulesList.map((m) => {
                    const done = isModuleCompleted(m.id, localOrganizer);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModId(m.id)}
                        className={`w-full p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          m.id === selectedModId
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : done
                            ? 'bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100 border border-emerald-200/60'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        <span className="truncate pr-1">0{m.number}. {m.title.split(',')[0].split('&')[0]}</span>
                        {done ? (
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${m.id === selectedModId ? 'text-emerald-400' : 'text-[#16A34A]'}`} />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <Button
                    size="sm"
                    loading={isSaving}
                    onClick={handleSaveOrganizerOnCall}
                    className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center justify-center gap-1.5 h-8.5 cursor-pointer shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Current Module</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode('INSPECTOR')}
                    className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1 h-8 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cancel &amp; Back to Review</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3B. INSPECTOR VIEW (Audit Review with Edit CTA - Full Width) */}
      {viewMode === 'INSPECTOR' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Viewing Module 0{currentModIndex + 1}: {modulesList[currentModIndex]?.title}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode('AGENT_EDIT')}
              className="border-emerald-300 text-[#16A34A] hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 h-7.5 px-3 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit this Module on Call</span>
            </Button>
          </div>

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
            />
          )}

          {selectedModId === 'm4' && (
            <ReviewModule4Wages
              m4={m4}
            />
          )}

          {selectedModId === 'm5' && (
            <ReviewModule5Interest
              m5={m5}
            />
          )}

          {selectedModId === 'm6' && (
            <ReviewModule6Stocks
              m6={m6}
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

          {/* Module Navigation Footer */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentModIndex === 0}
              onClick={() => {
                if (currentModIndex > 0) {
                  setSelectedModId(modulesList[currentModIndex - 1].id);
                }
              }}
              className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Module</span>
            </Button>

            <span className="text-xs font-semibold text-slate-500">
              Module {currentModIndex + 1} of {modulesList.length}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentModIndex === modulesList.length - 1}
              onClick={() => {
                if (currentModIndex < modulesList.length - 1) {
                  setSelectedModId(modulesList[currentModIndex + 1].id);
                }
              }}
              className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <span>Next Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 3C. 9-GRID OVERVIEW */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
