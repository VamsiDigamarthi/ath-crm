import React from 'react';
import { Users, Plus, Trash2, CreditCard } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';

interface DemographicsDependentsSectionProps {
  m2Data?: Partial<OrganizerData['m2_dependents']>;
  updateM2Field?: <K extends keyof OrganizerData['m2_dependents']>(field: K, value: OrganizerData['m2_dependents'][K]) => void;
  defaultLastName?: string;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const DemographicsDependentsSection: React.FC<DemographicsDependentsSectionProps> = ({
  m2Data,
  updateM2Field,
  defaultLastName = '',
  errors = {},
  clearError,
}) => {
  const m2 = m2Data || {};

  const handleM2FieldChange = <K extends keyof OrganizerData['m2_dependents']>(
    field: K,
    value: OrganizerData['m2_dependents'][K],
    errorKey?: string
  ) => {
    if (updateM2Field) {
      updateM2Field(field, value);
    }
    if (errorKey && clearError) {
      clearError(errorKey);
    }
  };

  const dependentsList = m2.dependentsList || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end pb-1">
        <button
          type="button"
          onClick={() => {
            const updated = [
              ...dependentsList,
              {
                firstName: '',
                middleName: '',
                lastName: defaultLastName || '',
                name: '',
                dob: '',
                ssn: '',
                relationship: 'Son',
                monthsInHome: 12,
              },
            ];
            handleM2FieldChange('dependentsList', updated);
            handleM2FieldChange('childCount', updated.length);
          }}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{dependentsList.length > 0 ? 'Add Another Dependent' : 'Add Child / Dependent'}</span>
        </button>
      </div>

      {dependentsList.length === 0 && (
        <div className="text-center py-6 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
          <Users className="w-7 h-7 mx-auto text-slate-400 mb-2" />
          <p className="text-xs text-slate-600 font-semibold">No dependents added</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Child / Dependent" if you have children or qualifying family members.</p>
        </div>
      )}

      {dependentsList.length > 0 && (
        <div className="space-y-6">
          {dependentsList.map((dep, idx) => (
            <div key={idx} className="space-y-4 pt-2 pb-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-xs font-semibold text-gray-700">Dependent #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const list = dependentsList.filter((_, i) => i !== idx);
                    handleM2FieldChange('dependentsList', list);
                    handleM2FieldChange('childCount', list.length);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Row 1: First Name, Middle Name, Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AppInput
                  label="First Name (as per SSN) *"
                  placeholder="e.g. Aarav"
                  error={errors[`dep_${idx}_firstName`]}
                  value={dep.firstName || dep.name?.split(' ')[0] || ''}
                  onChange={(e) => {
                    const list = [...dependentsList];
                    list[idx].firstName = e.target.value;
                    list[idx].name = `${e.target.value} ${list[idx].lastName || defaultLastName || ''}`.trim();
                    handleM2FieldChange('dependentsList', list, `dep_${idx}_firstName`);
                  }}
                />

                <AppInput
                  label="Middle Name"
                  placeholder="e.g. V (Optional)"
                  value={dep.middleName || ''}
                  onChange={(e) => {
                    const list = [...dependentsList];
                    list[idx].middleName = e.target.value;
                    handleM2FieldChange('dependentsList', list);
                  }}
                />

                <AppInput
                  label="Last Name (as per SSN) *"
                  placeholder="e.g. Varma"
                  error={errors[`dep_${idx}_lastName`]}
                  value={dep.lastName !== undefined ? dep.lastName : defaultLastName}
                  onChange={(e) => {
                    const list = [...dependentsList];
                    list[idx].lastName = e.target.value;
                    list[idx].name = `${list[idx].firstName || ''} ${e.target.value}`.trim();
                    handleM2FieldChange('dependentsList', list, `dep_${idx}_lastName`);
                  }}
                />
              </div>

              {/* Row 2: Relationship, DOB, SSN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AppSelect
                  label="Relationship With Primary Taxpayer *"
                  options={[
                    { label: 'Son (Child)', value: 'Son' },
                    { label: 'Daughter (Child)', value: 'Daughter' },
                    { label: 'Father (Parent)', value: 'Father' },
                    { label: 'Mother (Parent)', value: 'Mother' },
                    { label: 'Brother / Sister', value: 'Sibling' },
                    { label: 'Other Qualifying Relative', value: 'Other' },
                  ]}
                  value={dep.relationship || 'Son'}
                  onChange={(val) => {
                    const list = [...dependentsList];
                    list[idx].relationship = val || 'Son';
                    handleM2FieldChange('dependentsList', list);
                  }}
                />

                <AppDatePicker
                  label="Date of Birth (MM/DD/YYYY) *"
                  placeholder="MM/DD/YYYY"
                  format="MM/dd/yyyy"
                  accentColor="#16A34A"
                  maxDate={new Date()}
                  error={errors[`dep_${idx}_dob`]}
                  value={parseUsDate(dep.dob)}
                  onChange={(dateVal) => {
                    const list = [...dependentsList];
                    list[idx].dob = formatUsDate(dateVal);
                    handleM2FieldChange('dependentsList', list, `dep_${idx}_dob`);
                  }}
                />

                <AppInput
                  label="SSN / ITIN (Editable) *"
                  type="password"
                  placeholder="982-14-1234"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  error={errors[`dep_${idx}_ssn`]}
                  value={dep.ssn || ''}
                  onChange={(e) => {
                    const list = [...dependentsList];
                    list[idx].ssn = e.target.value;
                    handleM2FieldChange('dependentsList', list, `dep_${idx}_ssn`);
                  }}
                />
              </div>

              {/* Row 3: Months Lived in Home */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AppInput
                  label="Months Lived in Home (0-12) *"
                  type="number"
                  placeholder="12"
                  error={errors[`dep_${idx}_monthsInHome`]}
                  value={dep.monthsInHome !== undefined ? dep.monthsInHome.toString() : '12'}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    const clamped = isNaN(raw) ? 0 : Math.min(12, Math.max(0, raw));
                    const list = [...dependentsList];
                    list[idx].monthsInHome = clamped;
                    handleM2FieldChange('dependentsList', list, `dep_${idx}_monthsInHome`);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
