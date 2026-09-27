import React from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';
import { isLeapYear, type ValidationErrorMap } from '../utils/organizer-validation';

interface Module3Props {
  data: OrganizerData['m3_presence'];
  updateField: <K extends keyof OrganizerData['m3_presence']>(field: K, value: OrganizerData['m3_presence'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module3Presence: React.FC<Module3Props> = ({
  data,
  updateField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m3_presence']>;
  const historyList = d.statesResidedHistory || [];
  
  const [isOpenStateHistory, setIsOpenStateHistory] = React.useState<boolean>(false);

  const maxCurrentDays = isLeapYear(selectedTaxYear) ? 366 : 365;
  const maxPrior1Days = isLeapYear(selectedTaxYear - 1) ? 366 : 365;
  const maxPrior2Days = isLeapYear(selectedTaxYear - 2) ? 366 : 365;

  const handleDaysChange = (field: 'days2025' | 'days2024' | 'days2023', rawVal: string, maxDays: number) => {
    if (clearError) clearError(field);
    if (rawVal === '') {
      updateField(field, undefined as any);
      return;
    }
    const num = parseInt(rawVal, 10);
    if (isNaN(num)) {
      updateField(field, undefined as any);
      return;
    }
    // Prevent typing negative or gigantic numbers > maxDays
    const clamped = Math.min(maxDays, Math.max(0, num));
    updateField(field, clamped as any);
  };

  return (
    <div className="space-y-6 font-sans">

      {/* 1. 3-Year Physical Presence Day Inputs Section */}
      <div className="space-y-4">
        <div className="pb-1">
          <h4 className="text-xs font-semibold text-gray-700">
            Substantial Presence Test (Physical Days in U.S.)
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Legally determines whether you file Form 1040 (Resident Alien) or Form 1040-NR (Non-Resident Alien)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppInput
            label={`TY ${selectedTaxYear} Days in U.S. (Max: ${maxCurrentDays}) *`}
            type="number"
            placeholder="e.g. 365"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.days2025}
            value={d.days2025 !== undefined && d.days2025 !== null ? d.days2025.toString() : ''}
            onChange={(e) => handleDaysChange('days2025', e.target.value, maxCurrentDays)}
          />

          <AppInput
            label={`TY ${selectedTaxYear - 1} Days in U.S. (Max: ${maxPrior1Days}) *`}
            type="number"
            placeholder={isLeapYear(selectedTaxYear - 1) ? 'e.g. 366 (Leap)' : 'e.g. 365'}
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.days2024}
            value={d.days2024 !== undefined && d.days2024 !== null ? d.days2024.toString() : ''}
            onChange={(e) => handleDaysChange('days2024', e.target.value, maxPrior1Days)}
          />

          <AppInput
            label={`TY ${selectedTaxYear - 2} Days in U.S. (Max: ${maxPrior2Days}) *`}
            type="number"
            placeholder="e.g. 365"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.days2023}
            value={d.days2023 !== undefined && d.days2023 !== null ? d.days2023.toString() : ''}
            onChange={(e) => handleDaysChange('days2023', e.target.value, maxPrior2Days)}
          />
        </div>
      </div>

      {/* 2. Multi-State Residing History Table (Taxpayer & Spouse) */}
      {!isOpenStateHistory ? (
        /* Collapsed State (Default): Heading at left, Add Button at right */
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>Resided / Residing State Details (Taxpayer &amp; Spouse)</span>
                {historyList.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    {historyList.length} Added
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mention residence history with exact From and To dates for both Taxpayer and Spouse ({selectedTaxYear - 3} - {selectedTaxYear})
              </p>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => {
                setIsOpenStateHistory(true);
                if (historyList.length === 0) {
                  const updated = [
                    {
                      taxYear: selectedTaxYear,
                      state: '',
                      fromDate: '',
                      toDate: '',
                      spouseState: '',
                      spouseFromDate: '',
                      spouseToDate: '',
                    },
                  ];
                  updateField('statesResidedHistory', updated);
                }
              }}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{historyList.length > 0 ? 'View / Edit State Rows' : 'Add State Row'}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Open State: Full Table with Header & Add Button */
        <div className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>Resided / Residing State Details (Taxpayer &amp; Spouse)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                  {historyList.length} Added
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mention residence history with exact From and To dates for both Taxpayer and Spouse ({selectedTaxYear - 3} - {selectedTaxYear})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                type="button"
                onClick={() => {
                  const updated = [
                    ...historyList,
                    {
                      taxYear: selectedTaxYear,
                      state: '',
                      fromDate: '',
                      toDate: '',
                      spouseState: '',
                      spouseFromDate: '',
                      spouseToDate: '',
                    },
                  ];
                  updateField('statesResidedHistory', updated);
                }}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Row</span>
              </Button>
              <button
                type="button"
                onClick={() => setIsOpenStateHistory(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 bg-slate-100 text-slate-700 text-center">Tax Year</th>
                  <th className="p-3 bg-emerald-50/70 text-emerald-900 border-l border-r border-slate-200 text-center" colSpan={3}>
                    Taxpayer Residency
                  </th>
                  <th className="p-3 bg-indigo-50/70 text-indigo-900 text-center" colSpan={3}>
                    Spouse Residency (Optional)
                  </th>
                  <th className="p-3 w-10 text-center">Action</th>
                </tr>
                <tr className="border-t border-slate-200 bg-slate-50/80 text-[11px] text-slate-600">
                  <th className="p-2 text-center">Year</th>
                  <th className="p-2 border-l border-slate-200 w-24">State *</th>
                  <th className="p-2 min-w-[150px]">From (MM/DD/YYYY) *</th>
                  <th className="p-2 border-r border-slate-200 min-w-[150px]">To (MM/DD/YYYY) *</th>
                  <th className="p-2 w-24">State</th>
                  <th className="p-2 min-w-[150px]">From (MM/DD/YYYY)</th>
                  <th className="p-2 min-w-[150px]">To (MM/DD/YYYY)</th>
                  <th className="p-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {historyList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {/* Tax Year */}
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-50/40 text-center">
                      <input
                        type="number"
                        placeholder={selectedTaxYear.toString()}
                        className="w-16 px-1.5 py-1 border border-slate-200 rounded text-xs font-bold text-center bg-white"
                        value={row.taxYear || ''}
                        onChange={(e) => {
                          const list = [...historyList];
                          list[idx].taxYear = parseInt(e.target.value, 10) || selectedTaxYear;
                          updateField('statesResidedHistory', list);
                        }}
                      />
                    </td>

                    {/* Taxpayer State */}
                    <td className="p-2 border-l border-slate-200">
                      <div>
                        <input
                          type="text"
                          placeholder="TX"
                          maxLength={2}
                          className={`w-16 px-2 py-1.5 border rounded-lg text-xs uppercase font-bold ${
                            errors[`state_${idx}_state`]
                              ? 'border-rose-400 bg-rose-50 text-rose-900'
                              : 'border-slate-200 text-slate-800'
                          }`}
                          value={row.state || ''}
                          onChange={(e) => {
                            const list = [...historyList];
                            list[idx].state = e.target.value.toUpperCase();
                            updateField('statesResidedHistory', list);
                            if (clearError) clearError(`state_${idx}_state`);
                          }}
                        />
                        {errors[`state_${idx}_state`] && (
                          <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">
                            {errors[`state_${idx}_state`]}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Taxpayer From Date */}
                    <td className="p-2">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#16A34A"
                        error={errors[`state_${idx}_fromDate`]}
                        value={parseUsDate(row.fromDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].fromDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_fromDate`);
                        }}
                      />
                    </td>

                    {/* Taxpayer To Date */}
                    <td className="p-2 border-r border-slate-200">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#16A34A"
                        error={errors[`state_${idx}_toDate`]}
                        value={parseUsDate(row.toDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].toDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_toDate`);
                        }}
                      />
                    </td>

                    {/* Spouse State */}
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="TX"
                        maxLength={2}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs uppercase font-bold text-slate-800"
                        value={row.spouseState || ''}
                        onChange={(e) => {
                          const list = [...historyList];
                          list[idx].spouseState = e.target.value.toUpperCase();
                          updateField('statesResidedHistory', list);
                        }}
                      />
                    </td>

                    {/* Spouse From Date */}
                    <td className="p-2">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#6366F1"
                        error={errors[`state_${idx}_spouseFromDate`]}
                        value={parseUsDate(row.spouseFromDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].spouseFromDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_spouseFromDate`);
                        }}
                      />
                    </td>

                    {/* Spouse To Date */}
                    <td className="p-2">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#6366F1"
                        error={errors[`state_${idx}_spouseToDate`]}
                        value={parseUsDate(row.spouseToDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].spouseToDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_spouseToDate`);
                        }}
                      />
                    </td>

                    {/* Action Remove */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const list = historyList.filter((_, i) => i !== idx);
                          updateField('statesResidedHistory', list);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

