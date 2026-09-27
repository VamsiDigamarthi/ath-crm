import React, { useState, useEffect } from 'react';
import { User, Users, Building2, LayoutGrid, Edit3, Eye, Save, ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { 
  isModuleCompleted,
  validateModule1,
  validateModule2,
  validateModule3,
  validateModule4,
  validateModule5,
  validateModule6,
  validateModule7,
  validateModule8,
  validateModule9
} from '@/features/customer/components/organizer/utils/organizer-validation';
import { OrganizerModuleContent } from '@/features/customer/components/organizer/OrganizerModuleContent';
import { ORGANIZER_MODULES } from '@/features/customer/components/organizer/OrganizerModuleSidebar';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { AppTabs } from '@/shared/components/AppTabs';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';
import { CustomerDocumentVault } from '@/features/customer/components/CustomerDocumentVault';

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
  allowEdit?: boolean;
  readOnly?: boolean;
}

export const TaxPrepOrganizerReview: React.FC<TaxPrepOrganizerReviewProps> = ({
  leadId,
  customerName,
  taxDraftSummary,
  onOrganizerSaved,
  allowEdit = true,
  readOnly = false,
}) => {
  const canEdit = allowEdit && !readOnly;
  const organizer = taxDraftSummary?.organizer || taxDraftSummary?.organizerData || {};
  const activeTaxYear = taxDraftSummary?.taxYear || organizer.taxYear || 2025;

  const [viewMode, setViewMode] = useState<'INSPECTOR' | 'GRID' | 'AGENT_EDIT'>(canEdit ? 'AGENT_EDIT' : 'INSPECTOR');
  const [selectedModId, setSelectedModId] = useState<string>('m1');
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  
  // Local state for Agent Editing on Call
  const [localOrganizer, setLocalOrganizer] = useState<any>(() => {
    const raw = taxDraftSummary?.organizer || taxDraftSummary?.organizerData || {};
    return {
      ...raw,
      m1_demographics: raw.m1_demographics || {
        fullName: customerName,
        firstName: customerName ? customerName.split(' ')[0] : '',
        lastName: customerName ? customerName.split(' ').slice(1).join(' ') : '',
      },
    };
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const raw = taxDraftSummary?.organizer || taxDraftSummary?.organizerData || {};
    setLocalOrganizer({
      ...raw,
      m1_demographics: raw.m1_demographics || {
        fullName: customerName,
        firstName: customerName ? customerName.split(' ')[0] : '',
        lastName: customerName ? customerName.split(' ').slice(1).join(' ') : '',
      },
    });
  }, [taxDraftSummary, customerName]);

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

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateActiveModule = (): boolean => {
    let errs: Record<string, string> = {};
    if (selectedModId === 'm1') {
      errs = validateModule1(localOrganizer.m1_demographics);
    } else if (selectedModId === 'm2') {
      errs = validateModule2(localOrganizer.m2_dependents, localOrganizer.m1_demographics?.maritalStatus);
    } else if (selectedModId === 'm3') {
      errs = validateModule3(localOrganizer.m3_presence, activeTaxYear);
    } else if (selectedModId === 'm4') {
      errs = validateModule4(localOrganizer.m4_wages, activeTaxYear);
    } else if (selectedModId === 'm5') {
      errs = validateModule5(localOrganizer.m5_interest, activeTaxYear);
    } else if (selectedModId === 'm6') {
      errs = validateModule6(localOrganizer.m6_stocks, activeTaxYear);
    } else if (selectedModId === 'm7') {
      errs = validateModule7(localOrganizer.m7_foreign, activeTaxYear);
    } else if (selectedModId === 'm8') {
      errs = validateModule8(localOrganizer.m8_deductions, activeTaxYear);
    } else if (selectedModId === 'm9') {
      errs = validateModule9(localOrganizer.m9_directDeposit, activeTaxYear);
    }

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      const firstError = Object.values(errs)[0];
      toast.error(`Please complete required field: ${firstError}`);
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const handleSaveOrganizerOnCall = async () => {
    if (!leadId) {
      toast.error('Application Lead ID is missing');
      return;
    }
    if (!validateActiveModule()) {
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
      setValidationErrors({});
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

  const modulesList = ORGANIZER_MODULES;
  const currentOrgData = viewMode === 'AGENT_EDIT' ? localOrganizer : organizer;
  const completedCount = modulesList.filter((m) => isModuleCompleted(m.id, currentOrgData)).length;
  const progressPercent = Math.round((completedCount / modulesList.length) * 100);
  const currentModIndex = Math.max(0, modulesList.findIndex((m) => m.id === selectedModId));

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      {/* 1. Header Bar matching Client Side Tax Organizer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Tax Organizer {viewMode === 'AGENT_EDIT' ? '' : '— Audit'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-300">
              {progressPercent}% Complete
            </span>
          </div>
          <p className="text-xs sm:text-sm text-black/80 mt-1 font-medium">
            ATH Tax Services IRS-compliant intake wizard. Entering responses for {customerName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Mode Toggles */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
            {canEdit && (
              <button
                type="button"
                onClick={() => setViewMode('AGENT_EDIT')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'AGENT_EDIT'
                    ? 'bg-[#16A34A] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-black'
                }`}
                title="Fill / edit fields on call"
              >
                <Edit3 className="w-3 h-3" />
                <span>Live Entry</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewMode('INSPECTOR')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'INSPECTOR'
                  ? 'bg-[#16A34A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-black'
              }`}
              title="Review & Audit responses"
            >
              <Eye className="w-3 h-3" />
              <span>Review</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-[#16A34A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-black'
              }`}
              title="Grid overview"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Grid</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleSaveOrganizerOnCall}
            disabled={isSaving}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving to DB...' : 'Save All Drafts'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Horizontal 5-Module Navigator Bar */}
      <AppTabs
        tabs={modulesList.map((m) => ({
          id: m.id,
          label: m.label,
        }))}
        activeTab={selectedModId}
        onChange={(tabId) => {
          setSelectedModId(tabId);
          if (viewMode === 'GRID') setViewMode(canEdit ? 'AGENT_EDIT' : 'INSPECTOR');
        }}
        size="sm"
      />

      {/* 3A. AGENT EDIT MODE: Full-Width Client-Styled Organizer Workspace */}
      {viewMode === 'AGENT_EDIT' && (
        <div className="w-full">
          <OrganizerModuleContent
            selectedModId={selectedModId}
            selectedTaxYear={activeTaxYear}
            organizerData={localOrganizer}
            updateModuleField={updateModuleField}
            errors={validationErrors}
            clearError={clearError}
            onNext={() => {
              if (!validateActiveModule()) return;
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
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode('AGENT_EDIT')}
                className="border-emerald-300 text-[#16A34A] hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 h-7.5 px-3 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit this Module on Call</span>
              </Button>
            )}
          </div>

          {selectedModId === 'm1' && (
            <div className="space-y-4">
              <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
                <AppAccordionItem
                  index={0}
                  title="Personal Details"
                  icon={<User className="w-4 h-4" />}
                >
                  <ReviewModule1Demographics
                    m1={m1}
                    customerName={customerName}
                    showSensitive={showSensitive}
                    toggleShow={toggleShow}
                  />
                </AppAccordionItem>

                <AppAccordionItem
                  index={1}
                  title="Dependents"
                  icon={<Users className="w-4 h-4" />}
                >
                  <ReviewModule2Dependents
                    m2={m2}
                    showSensitive={showSensitive}
                    toggleShow={toggleShow}
                  />
                </AppAccordionItem>

                <AppAccordionItem
                  index={2}
                  title="Bank Details"
                  icon={<Building2 className="w-4 h-4" />}
                >
                  <ReviewModule9DirectDeposit
                    m9={m9}
                    showSensitive={showSensitive}
                    toggleShow={toggleShow}
                  />
                </AppAccordionItem>
              </AppAccordion>
            </div>
          )}

          {selectedModId === 'm3' && (
            <ReviewModule3Presence
              m3={m3}
            />
          )}

          {selectedModId === 'm7' && (
            <ReviewModule7Foreign
              m7={m7}
            />
          )}

          {selectedModId === 'm_vault' && (
            <CustomerDocumentVault
              selectedTaxYear={activeTaxYear}
              lockTaxYear={true}
              isOrganizerMode={true}
            />
          )}

          {(selectedModId === 'm_income_expenses' || selectedModId === 'm4' || selectedModId === 'm5' || selectedModId === 'm6' || selectedModId === 'm8') && (
            <div className="space-y-6">
              {/* Part 1: W-2 Wages */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Part 1</span>
                  <h4 className="text-xs font-bold text-slate-800">Form W-2 Wages &amp; Taxable Earnings</h4>
                </div>
                <ReviewModule4Wages m4={m4} />
              </div>

              {/* Part 2: 1099 Interest & Dividends */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Part 2</span>
                  <h4 className="text-xs font-bold text-slate-800">1099-INT / DIV / OID Interest &amp; Dividends</h4>
                </div>
                <ReviewModule5Interest m5={m5} />
              </div>

              {/* Part 3: 1099-B Stocks & Gains */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Part 3</span>
                  <h4 className="text-xs font-bold text-slate-800">1099-B Stocks, ESPP, RSU &amp; Capital Gains / Losses</h4>
                </div>
                <ReviewModule6Stocks m6={m6} />
              </div>

              {/* Part 4: Itemized Deductions & Expenses */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Part 4</span>
                  <h4 className="text-xs font-bold text-slate-800">Itemized Deductions, State Rent &amp; Expenses</h4>
                </div>
                <ReviewModule8Deductions m8={m8} />
              </div>
            </div>
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
