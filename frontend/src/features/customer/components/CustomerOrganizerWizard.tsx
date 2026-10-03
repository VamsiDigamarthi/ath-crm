import React from 'react';
import { Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useCustomerOrganizer } from '../hooks/useCustomerOrganizer';
import { OrganizerModuleSidebar } from './organizer/OrganizerModuleSidebar';
import { OrganizerModuleContent } from './organizer/OrganizerModuleContent';

export const CustomerOrganizerWizard: React.FC = () => {
  const { selectedTaxYear: contextTaxYear, customerProfile } = useOutletContext<{ 
    selectedTaxYear?: string;
    customerProfile?: any;
  }>() || {};
  const [searchParams] = useSearchParams();
  const urlYear = searchParams.get('year') || searchParams.get('taxYear');
  const activeTaxYear = urlYear || contextTaxYear;

  const urlType = searchParams.get('type') || searchParams.get('filingType');
  const matchedApp = customerProfile?.applications?.find(
    (a: any) => a.taxYear?.toString() === activeTaxYear?.toString()
  );
  const filingType = (urlType || matchedApp?.filingType || 'INDIVIDUAL').toUpperCase();
  const isBusiness = filingType === 'BUSINESS';

  // All Business Logic, Field Mutation and PostgreSQL Sync handled by Hook
  const {
    organizerData,
    selectedTaxYear,
    selectedModId,
    setSelectedModId,
    currentModIndex,
    loading,
    saving,
    progressPercent,
    completedCount,
    validationErrors,
    clearError,
    updateModuleField,
    saveDraft,
    handleNext,
    handlePrev,
    moduleIds,
  } = useCustomerOrganizer(activeTaxYear, filingType);

  // Deep-link to specific tab (e.g. ?tab=m_vault or ?module=b2_businessIncome)
  const tabParam = searchParams.get('tab') || searchParams.get('module');
  React.useEffect(() => {
    if (tabParam && moduleIds.includes(tabParam)) {
      setSelectedModId(tabParam);
    }
  }, [tabParam, moduleIds, setSelectedModId]);

  const appDraft = (matchedApp?.taxDraftSummary as any) || {};
  const fedRefund = Number(appDraft.fedRefund ?? appDraft.federalRefund ?? 0);
  const stateRefund = Number(appDraft.stateRefund ?? appDraft.stateTaxRefund ?? 0);
  const totalRefund = fedRefund + stateRefund;
  const totalDue = Number(appDraft.balanceDue ?? 0) + Number(appDraft.stateBalanceDue ?? 0);

  return (
    <div className="space-y-6 pb-8 font-sans animate-in fade-in duration-150">
      {/* 1. Standard Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              {isBusiness ? 'Business Tax Info and Files' : 'Tax Info and Files'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-300">
              {progressPercent}% Complete
            </span>
            {totalRefund > 0 && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-300">
                Refund: ${totalRefund.toLocaleString()}
              </span>
            )}
            {totalDue > 0 && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                Due: ${totalDue.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-black/80 mt-1 font-medium">
            {isBusiness
              ? `ATH Tax Services corporate and partnership intake wizard. Complete all 5 sections for TY ${selectedTaxYear || '2025'}.`
              : `ATH Tax Services IRS-compliant intake wizard. Complete all 5 sections to maximize your TY ${selectedTaxYear || '2025'} deductions.`
            }
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentModIndex === 0 || saving}
            className="text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveDraft}
            disabled={saving || loading}
            className="text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            disabled={saving || loading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs flex items-center gap-1.5 cursor-pointer px-4"
          >
            <span>Save &amp; Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Top Horizontal Module Navigator Bar */}
      <OrganizerModuleSidebar
        selectedModId={selectedModId}
        onSelectModule={(id) => setSelectedModId(id)}
        completedCount={completedCount}
        organizerData={organizerData}
        filingType={filingType}
      />

      {/* 3. Full-Width Interactive Workspace Canvas */}
      <div className="w-full">
        <OrganizerModuleContent
          selectedModId={selectedModId}
          selectedTaxYear={selectedTaxYear}
          organizerData={organizerData}
          updateModuleField={updateModuleField}
          onNext={handleNext}
          onPrev={handlePrev}
          onSave={saveDraft}
          hideFooter
          currentModIndex={currentModIndex}
          saving={saving}
          errors={validationErrors}
          clearError={clearError}
          filingType={filingType}
        />
      </div>
    </div>
  );
};
