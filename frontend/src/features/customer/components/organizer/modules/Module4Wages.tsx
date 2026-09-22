import React from 'react';
import { FileSpreadsheet, Briefcase, DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module4Props {
  data: OrganizerData['m4_wages'];
  updateField: <K extends keyof OrganizerData['m4_wages']>(field: K, value: OrganizerData['m4_wages'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module4Wages: React.FC<Module4Props> = ({
  data,
  updateField,
  selectedTaxYear: _selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m4_wages']>;

  return (
    <div className="space-y-6 font-sans">
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
        <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Form W-2 Wage Statements:</strong> Enter your primary employer details and Box 1 total wages as listed on your Form W-2.
        </div>
      </div>

      {/* W-2 Primary Employer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Primary Employer Name *"
          placeholder="e.g. Google LLC or Microsoft Corp"
          leftIcon={<Briefcase className="w-4 h-4" />}
          error={errors.employerName}
          value={d.employerName || ''}
          onChange={(e) => {
            updateField('employerName', e.target.value);
            if (clearError) clearError('employerName');
          }}
        />

        <AppInput
          label="Box 1 Total Wages ($) *"
          type="number"
          placeholder="e.g. 148500"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.estimatedWages}
          value={d.estimatedWages !== undefined && d.estimatedWages !== null ? d.estimatedWages.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
            updateField('estimatedWages', val as any);
            if (clearError) clearError('estimatedWages');
          }}
        />
      </div>
    </div>
  );
};
