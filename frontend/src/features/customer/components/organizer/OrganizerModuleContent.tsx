import React from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { ORGANIZER_MODULES } from './OrganizerModuleSidebar';
import { type OrganizerData } from '../../services/customer-api';
import { Module1Demographics } from './modules/Module1Demographics';
import { Module2Dependents } from './modules/Module2Dependents';
import { Module3Presence } from './modules/Module3Presence';
import { Module4Wages } from './modules/Module4Wages';
import { Module5Interest } from './modules/Module5Interest';
import { Module6Stocks } from './modules/Module6Stocks';
import { Module7Foreign } from './modules/Module7Foreign';
import { Module8Deductions } from './modules/Module8Deductions';
import { Module9DirectDeposit } from './modules/Module9DirectDeposit';

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
}) => {
  const currentMod = ORGANIZER_MODULES.find((m) => m.id === selectedModId) || ORGANIZER_MODULES[0];

  if (!organizerData) {
    return (
      <div className="lg:col-span-8 bg-white p-12 rounded-xl border border-slate-200 shadow-xs text-center text-xs text-slate-400">
        Loading module intake data...
      </div>
    );
  }

  return (
    <div className="lg:col-span-8 bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Module Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200 font-bold shrink-0">
              {React.createElement(currentMod.icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Module 0{currentMod.number}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                  {currentMod.section}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentMod.title}
              </h3>
            </div>
          </div>

          <div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Verified Intake Form</span>
            </span>
          </div>
        </div>

        {/* Clean Module Sub-Components */}
        {selectedModId === 'm1' && (
          <Module1Demographics
            data={organizerData.m1_demographics}
            updateField={(field, val) => updateModuleField('m1_demographics', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm2' && (
          <Module2Dependents
            data={organizerData.m2_dependents}
            updateField={(field, val) => updateModuleField('m2_dependents', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm3' && (
          <Module3Presence
            data={organizerData.m3_presence}
            updateField={(field, val) => updateModuleField('m3_presence', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm4' && (
          <Module4Wages
            data={organizerData.m4_wages}
            updateField={(field, val) => updateModuleField('m4_wages', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm5' && (
          <Module5Interest
            data={organizerData.m5_interest}
            updateField={(field, val) => updateModuleField('m5_interest', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm6' && (
          <Module6Stocks
            data={organizerData.m6_stocks}
            updateField={(field, val) => updateModuleField('m6_stocks', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm7' && (
          <Module7Foreign
            data={organizerData.m7_foreign}
            updateField={(field, val) => updateModuleField('m7_foreign', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm8' && (
          <Module8Deductions
            data={organizerData.m8_deductions}
            updateField={(field, val) => updateModuleField('m8_deductions', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}

        {selectedModId === 'm9' && (
          <Module9DirectDeposit
            data={organizerData.m9_directDeposit}
            updateField={(field, val) => updateModuleField('m9_directDeposit', field, val)}
            selectedTaxYear={selectedTaxYear}
          />
        )}
      </div>

      {/* Navigation & Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentModIndex === 0}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Module</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            disabled={saving}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          <Button
            size="sm"
            onClick={onNext}
            disabled={saving}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <span>Save &amp; Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
