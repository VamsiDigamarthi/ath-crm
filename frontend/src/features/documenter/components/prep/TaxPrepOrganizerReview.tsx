import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import {
  isModuleCompleted,
  validateModule1,
  validateModule2,
  validateModule3,
  validateModule4,
  validateModule5,
  validateModule10Retirement,
  validateModule6,
  validateModule7,
  validateModule8,
  validateModule9,
  validateBusinessCompanyInfo,
  validateBusinessIncome,
  validateBusinessExpenses,
  validateEntireOrganizer,
} from '@/features/customer/components/organizer/utils/organizer-validation';
import { OrganizerModuleContent } from '@/features/customer/components/organizer/OrganizerModuleContent';
import {
  getModulesForFilingType,
} from '@/features/customer/components/organizer/OrganizerModuleSidebar';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { AppTabs } from '@/shared/components/AppTabs';
import { TaxOrganizerDocumentPreviewModal } from './TaxOrganizerDocumentPreviewModal';

interface TaxPrepOrganizerReviewProps {
  leadId?: string;
  customerName: string;
  taxDraftSummary?: any;
  onOrganizerSaved?: () => void;
  allowEdit?: boolean;
  readOnly?: boolean;
  filingType?: string;
  hideHeader?: boolean;
  taxYear?: number;
  extraTabs?: { id: string; label: string; count?: number; content: React.ReactNode }[];
  requestedTabId?: string;
  onTabChange?: (tabId: string) => void;
}

export const TaxPrepOrganizerReview: React.FC<TaxPrepOrganizerReviewProps> = ({
  leadId,
  customerName,
  taxDraftSummary,
  onOrganizerSaved,
  allowEdit = true,
  readOnly = false,
  filingType,
  hideHeader = false,
  taxYear,
  extraTabs = [],
  requestedTabId,
  onTabChange,
}) => {
  const canEdit = allowEdit && !readOnly;
  const organizer = taxDraftSummary?.organizer || taxDraftSummary?.organizerData || {};
  const activeTaxYear = taxYear || taxDraftSummary?.taxYear || organizer.taxYear || new Date().getFullYear();
  const rawFilingType =
    filingType ||
    taxDraftSummary?.filingType ||
    (organizer?.b1_companyInfo?.companyName || organizer?.b1_companyInfo?.ein ? 'BUSINESS' : undefined) ||
    'INDIVIDUAL';
  const effectiveFilingType = String(rawFilingType || 'INDIVIDUAL').toUpperCase();
  const isBusiness = effectiveFilingType === 'BUSINESS';
  const modulesList = getModulesForFilingType(effectiveFilingType);
  const initialModId = isBusiness ? 'b1_companyInfo' : 'm1';

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [selectedModId, setSelectedModId] = useState<string>(
    requestedTabId && extraTabs.some((t) => t.id === requestedTabId) ? requestedTabId : initialModId
  );

  useEffect(() => {
    if (!requestedTabId) return;
    if (extraTabs.some((t) => t.id === requestedTabId)) setSelectedModId(requestedTabId);
    else if (requestedTabId === 'MODULES' && extraTabs.some((t) => t.id === selectedModId)) setSelectedModId(initialModId);
  }, [requestedTabId, initialModId]);

  // Synchronize module selection when filing type (Business vs Individual) changes
  useEffect(() => {
    if (extraTabs.some((t) => t.id === selectedModId)) return;
    const currentValidIds = modulesList.map((m) => m.id);
    if (!currentValidIds.includes(selectedModId)) {
      if (isBusiness) {
        if (selectedModId === 'm1') setSelectedModId('b1_companyInfo');
        else if (selectedModId === 'm_income') setSelectedModId('b2_businessIncome');
        else if (selectedModId === 'm_expenses') setSelectedModId('b3_businessExpenses');
        else setSelectedModId(initialModId);
      } else {
        if (selectedModId === 'b1_companyInfo') setSelectedModId('m1');
        else if (selectedModId === 'b2_businessIncome') setSelectedModId('m_income');
        else if (selectedModId === 'b3_businessExpenses') setSelectedModId('m_expenses');
        else setSelectedModId(initialModId);
      }
    }
  }, [isBusiness, modulesList, selectedModId, initialModId, extraTabs]);

  // Reset to initial module when lead changes or filing type changes unless requestedTabId specifies otherwise
  useEffect(() => {
    if (requestedTabId && extraTabs.some((t) => t.id === requestedTabId)) {
      setSelectedModId(requestedTabId);
    } else {
      setSelectedModId(initialModId);
    }
  }, [leadId, initialModId]);

  // Synchronize tab immediately if filing type switches
  useEffect(() => {
    if (extraTabs.some((t) => t.id === selectedModId)) return;
    if (isBusiness && selectedModId === 'm1') {
      setSelectedModId('b1_companyInfo');
    } else if (!isBusiness && selectedModId === 'b1_companyInfo') {
      setSelectedModId('m1');
    }
  }, [isBusiness, selectedModId, extraTabs]);

  const activeExtraTab = extraTabs.find((t) => t.id === selectedModId);

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
      ...(isBusiness ? {
        b1_companyInfo: raw.b1_companyInfo || {
          companyName: customerName ? `${customerName} LLC` : '',
          formationState: 'IL',
          structure: 'LLC',
          partners: [],
        },
        b2_businessIncome: raw.b2_businessIncome || {},
        b3_businessExpenses: raw.b3_businessExpenses || {},
      } : {}),
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
      ...(isBusiness ? {
        b1_companyInfo: raw.b1_companyInfo || {
          companyName: customerName ? `${customerName} LLC` : '',
          formationState: 'IL',
          structure: 'LLC',
          partners: [],
        },
        b2_businessIncome: raw.b2_businessIncome || {},
        b3_businessExpenses: raw.b3_businessExpenses || {},
      } : {}),
    });
  }, [taxDraftSummary, customerName, isBusiness]);

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
      const e1 = validateModule1(localOrganizer.m1_demographics);
      const e2 = validateModule2(localOrganizer.m2_dependents, localOrganizer.m1_demographics?.maritalStatus);
      const e3 = validateModule3(localOrganizer.m3_presence, activeTaxYear);
      const e9 = validateModule9(localOrganizer.m9_directDeposit, activeTaxYear);
      errs = { ...e1, ...e2, ...e3, ...e9 };
    } else if (selectedModId === 'm2') {
      errs = validateModule2(localOrganizer.m2_dependents, localOrganizer.m1_demographics?.maritalStatus);
    } else if (selectedModId === 'm3') {
      errs = validateModule3(localOrganizer.m3_presence, activeTaxYear);
    } else if (selectedModId === 'm_income') {
      const e4 = validateModule4(localOrganizer.m4_wages, activeTaxYear);
      const e5 = validateModule5(localOrganizer.m5_interest, activeTaxYear);
      const e10 = validateModule10Retirement(localOrganizer.m10_retirement, activeTaxYear);
      const e6 = validateModule6(localOrganizer.m6_stocks, activeTaxYear);
      errs = { ...e4, ...e5, ...e10, ...e6 };
    } else if (selectedModId === 'm_expenses') {
      errs = validateModule8(localOrganizer.m8_deductions, activeTaxYear);
    } else if (selectedModId === 'm7') {
      errs = validateModule7(localOrganizer.m7_foreign, activeTaxYear);
    } else if (selectedModId === 'b1_companyInfo') {
      errs = validateBusinessCompanyInfo(localOrganizer.b1_companyInfo);
    } else if (selectedModId === 'b2_businessIncome') {
      errs = validateBusinessIncome(localOrganizer.b2_businessIncome);
    } else if (selectedModId === 'b3_businessExpenses') {
      errs = validateBusinessExpenses(localOrganizer.b3_businessExpenses);
    }

    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix errors in highlighted required fields');
      return false;
    }
    return true;
  };

  const currentModIndex = Math.max(0, modulesList.findIndex((m) => m.id === selectedModId));
  const completedCount = modulesList.filter((m) => isModuleCompleted(m.id, localOrganizer)).length;
  const progressPercent = Math.round((completedCount / modulesList.length) * 100);

  const handleSaveDraft = async () => {
    if (!leadId) {
      toast.error('Application Lead ID is missing');
      return;
    }
    // Saving as draft must NOT enforce strict blocking validation
    try {
      setIsSaving(true);
      const existingSubmitted: string[] = localOrganizer.submittedModules || [initialModId];
      const extraKeys = selectedModId === 'm1'
        ? ['m1', 'm2', 'm3', 'm9']
        : selectedModId === 'm_income'
          ? ['m4', 'm5', 'm6', 'm_income']
          : selectedModId === 'm_expenses'
            ? ['m8', 'm_expenses']
            : selectedModId === 'm_income_expenses'
              ? ['m4', 'm5', 'm6', 'm8', 'm_income', 'm_expenses', 'm_income_expenses']
              : [selectedModId];
      const submittedModules = Array.from(new Set([...existingSubmitted, ...extraKeys]));

      const payload = {
        ...localOrganizer,
        submittedModules,
      };

      await apiClient.put(`/documenter/leads/${leadId}/organizer`, {
        organizerData: payload,
        taxYear: activeTaxYear,
      });

      setLocalOrganizer(payload);
      toast.success('Draft saved successfully!');
      if (onOrganizerSaved) onOrganizerSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrev = () => {
    if (currentModIndex > 0) {
      setSelectedModId(modulesList[currentModIndex - 1].id);
    }
  };

  const handleSaveAndNext = async () => {
    if (!leadId) {
      toast.error('Application Lead ID is missing');
      return;
    }

    const isLastModule = currentModIndex === modulesList.length - 1;

    // Validate current module
    if (!validateActiveModule()) {
      return;
    }

    // In final Save & Next / Finish, validate the ENTIRE organizer so zero required fields are missed
    if (isLastModule) {
      const wholeCheck = validateEntireOrganizer(localOrganizer, activeTaxYear, effectiveFilingType);
      if (!wholeCheck.isValid) {
        setValidationErrors(wholeCheck.errors);
        toast.error(`Cannot complete organizer: ${wholeCheck.firstErrorMessage}`);
        if (wholeCheck.firstFailedModuleId && wholeCheck.firstFailedModuleId !== selectedModId) {
          setSelectedModId(wholeCheck.firstFailedModuleId);
        }
        return;
      }
    }

    try {
      setIsSaving(true);
      const existingSubmitted: string[] = localOrganizer.submittedModules || [initialModId];
      const extraKeys = selectedModId === 'm1'
        ? ['m1', 'm2', 'm3', 'm9']
        : selectedModId === 'm_income'
          ? ['m4', 'm5', 'm6', 'm_income']
          : selectedModId === 'm_expenses'
            ? ['m8', 'm_expenses']
            : selectedModId === 'm_income_expenses'
              ? ['m4', 'm5', 'm6', 'm8', 'm_income', 'm_expenses', 'm_income_expenses']
              : [selectedModId];
      const submittedModules = Array.from(new Set([...existingSubmitted, ...extraKeys]));

      const payload = {
        ...localOrganizer,
        submittedModules,
        ...(isLastModule ? { isFullyCompleted: true } : {}),
      };

      await apiClient.put(`/documenter/leads/${leadId}/organizer`, {
        organizerData: payload,
        taxYear: activeTaxYear,
      });

      setLocalOrganizer(payload);
      setValidationErrors({});

      if (isLastModule) {
        toast.success(`All sections completed & verified for ${customerName}! ✨`);
      } else {
        toast.success('Section saved! Moving to next section...');
        setSelectedModId(modulesList[currentModIndex + 1].id);
      }

      if (onOrganizerSaved) onOrganizerSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save intake data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-150">
      {/* 1. Top Horizontal 5-Module Navigator Bar */}
      <AppTabs
        tabs={[
          ...modulesList.map((m) => ({ id: m.id, label: m.label })),
          ...extraTabs.map((t) => ({ id: t.id, label: t.label, count: t.count })),
        ]}
        activeTab={selectedModId}
        onChange={(tabId) => {
          setSelectedModId(tabId);
          onTabChange?.(tabId);
        }}
        size="sm"
      />

      {/* 2. Top Header Bar with Save & Preview Controls */}
      {!hideHeader && !activeExtraTab && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {isBusiness ? 'Business Tax Info & Files' : 'Tax Info & Files'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-300">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewModalOpen(true)}
              className="text-xs flex items-center gap-1.5 cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentModIndex === 0 || isSaving}
              className="text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </Button>
            )}
            {canEdit && (
              <Button
                size="sm"
                onClick={handleSaveAndNext}
                disabled={isSaving}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs flex items-center gap-1.5 cursor-pointer px-4 shadow-xs"
              >
                <span>{currentModIndex === modulesList.length - 1 ? 'Save & Finish' : 'Save & Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Extra Tabs (e.g. Notes, Call History) */}
      {activeExtraTab && <div>{activeExtraTab.content}</div>}

      {/* Main Interactive Intake Form */}
      {!activeExtraTab && (
        <div className="w-full">
          <OrganizerModuleContent
            selectedModId={selectedModId}
            selectedTaxYear={activeTaxYear}
            organizerData={localOrganizer}
            updateModuleField={updateModuleField}
            errors={validationErrors}
            clearError={clearError}
            onNext={handleSaveAndNext}
            onPrev={handlePrev}
            onSave={handleSaveDraft}
            currentModIndex={currentModIndex}
            saving={isSaving}
            readOnly={!canEdit}
            filingType={effectiveFilingType}
            leadId={leadId}
            hideFooter
          />
        </div>
      )}

      {/* Word-Document Styled Preview Modal */}
      <TaxOrganizerDocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        organizerData={localOrganizer}
        taxYear={activeTaxYear}
        customerName={customerName}
        filingType={effectiveFilingType}
        leadId={leadId}
      />
    </div>
  );
};
