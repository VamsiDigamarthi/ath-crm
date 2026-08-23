import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useOutletContext } from 'react-router-dom';
import { useCustomerOrganizer } from '../hooks/useCustomerOrganizer';
import { OrganizerModuleSidebar } from './organizer/OrganizerModuleSidebar';
import { OrganizerModuleContent } from './organizer/OrganizerModuleContent';

export const CustomerOrganizerWizard: React.FC = () => {
  const { selectedTaxYear: contextTaxYear } = useOutletContext<{ selectedTaxYear?: string }>() || {};

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
    saveOrganizer,
    handleNext,
    handlePrev,
  } = useCustomerOrganizer(contextTaxYear);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Standard Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              9-Module Comprehensive Tax Organizer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              {progressPercent}% Complete
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            ATH Tax Services IRS-compliant intake wizard. Complete all 9 sections to maximize your TY {selectedTaxYear || '2025'} deductions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-800">{completedCount} of 9 Verified</span>
            <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div 
                className="bg-[#16A34A] h-full rounded-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => saveOrganizer(false)}
            disabled={saving || loading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving to DB...' : 'Save All Drafts'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Horizontal 9-Module Navigator Bar */}
      <OrganizerModuleSidebar
        selectedModId={selectedModId}
        onSelectModule={(id) => setSelectedModId(id)}
        completedCount={completedCount}
        organizerData={organizerData}
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
          onSave={() => saveOrganizer(false)}
          currentModIndex={currentModIndex}
          saving={saving}
          errors={validationErrors}
          clearError={clearError}
        />
      </div>
    </div>
  );
};
