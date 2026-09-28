import React from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { type OrganizerData } from '../../services/customer-api';
import { Module1Demographics } from './modules/Module1Demographics';
import { Module3Presence } from './modules/Module3Presence';
import { Module7Foreign } from './modules/Module7Foreign';
import { ModuleIncome } from './modules/ModuleIncome';
import { ModuleExpenses } from './modules/ModuleExpenses';
import { CustomerDocumentVault } from '../CustomerDocumentVault';

interface OrganizerModuleContentProps {
  selectedModId: string;
  selectedTaxYear: number;
  organizerData: OrganizerData | null;
  updateModuleField: <K extends keyof OrganizerData>(moduleKey: K, field: keyof OrganizerData[K], value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  currentModIndex: number;
  saving: boolean;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
  className?: string;
}

export const OrganizerModuleContent: React.FC<OrganizerModuleContentProps> = ({
  selectedModId,
  selectedTaxYear,
  organizerData,
  updateModuleField,
  onNext,
  onPrev,
  onSave,
  currentModIndex,
  saving,
  errors = {},
  clearError,
  className,
}) => {
  if (!organizerData) {
    return (
      <div className={className || "lg:col-span-8 bg-white p-12 rounded-md border border-slate-300 shadow-xs text-center text-xs text-black font-semibold"}>
        Loading module intake data...
      </div>
    );
  }

  const isAccordion = selectedModId === 'm1';

  if (isAccordion) {
    return (
      <div className={className || "w-full space-y-4 font-sans"}>
        {/* Module Accordions */}
        <Module1Demographics
          data={organizerData?.m1_demographics || ({} as any)}
          updateField={(field, val) => updateModuleField('m1_demographics', field, val)}
          m2Data={organizerData?.m2_dependents || ({} as any)}
          updateM2Field={(field, val) => updateModuleField('m2_dependents', field, val)}
          m3Data={organizerData?.m3_presence || ({} as any)}
          updateM3Field={(field, val) => updateModuleField('m3_presence', field, val)}
          m9Data={organizerData?.m9_directDeposit || ({} as any)}
          updateM9Field={(field, val) => updateModuleField('m9_directDeposit', field, val)}
          selectedTaxYear={selectedTaxYear}
          errors={errors}
          clearError={clearError}
        />

        {/* Navigation & Action Footer Card */}
        <div className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={currentModIndex === 0}
            className="border-slate-300 text-black hover:bg-slate-50 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onSave}
              disabled={saving}
              className="border-slate-300 text-black hover:bg-slate-50 text-xs flex items-center gap-1.5 cursor-pointer rounded-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </Button>

            <Button
              size="sm"
              onClick={onNext}
              disabled={saving}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs flex items-center gap-1.5 shadow-xs cursor-pointer px-4 rounded-md"
            >
              <span>Save &amp; Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className || "lg:col-span-8 bg-white p-5 sm:p-7 rounded-md border border-slate-300 shadow-xs flex flex-col justify-between space-y-6 font-sans"}>
      <div className="space-y-6">
        {selectedModId === 'm3' && (
          <Module3Presence
            data={organizerData?.m3_presence || ({} as any)}
            updateField={(field, val) => updateModuleField('m3_presence', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        )}

        {selectedModId === 'm7' && (
          <Module7Foreign
            data={organizerData?.m7_foreign || ({} as any)}
            updateField={(field, val) => updateModuleField('m7_foreign', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        )}

        {(selectedModId === 'm_income' || selectedModId === 'm_income_expenses' || selectedModId === 'm4' || selectedModId === 'm5' || selectedModId === 'm6') && (
          <ModuleIncome
            organizerData={organizerData}
            updateModuleField={updateModuleField}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        )}

        {(selectedModId === 'm_expenses' || selectedModId === 'm8') && (
          <ModuleExpenses
            organizerData={organizerData}
            updateModuleField={updateModuleField}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        )}

        {selectedModId === 'm_vault' && (
          <CustomerDocumentVault
            selectedTaxYear={selectedTaxYear}
            lockTaxYear={true}
            isOrganizerMode={true}
          />
        )}
      </div>

      {/* Navigation & Action Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentModIndex === 0}
          className="border-slate-300 text-black hover:bg-slate-50 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 rounded-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            disabled={saving}
            className="border-slate-300 text-black hover:bg-slate-50 text-xs flex items-center gap-1.5 cursor-pointer rounded-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          <Button
            size="sm"
            onClick={onNext}
            disabled={saving}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs flex items-center gap-1.5 shadow-xs cursor-pointer px-4 rounded-md"
          >
            <span>Save &amp; Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
