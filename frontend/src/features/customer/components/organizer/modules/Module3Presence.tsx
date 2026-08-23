import React from 'react';
import { Globe, Home, Calendar, Plus, Trash2 } from 'lucide-react';
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
  const historyList = data.statesResidedHistory || [];

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
      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
        <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Mandatory Substantial Presence Calculation:</strong> Mention your total days present in the US for {selectedTaxYear}, {selectedTaxYear - 1} &amp; {selectedTaxYear - 2}. Maximum allowed is <strong>{maxCurrentDays} days/year</strong>. This legally defines whether you file Form 1040 (Resident) or Form 1040-NR (Non-Resident).
        </div>
      </div>

      {/* 3-Year Physical Presence Day Inputs with Strict 0-365/366 Bound Validation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppInput
          label={`TY ${selectedTaxYear} Days in U.S. (Max: ${maxCurrentDays}) *`}
          type="number"
          placeholder="e.g. 365"
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.days2025}
          value={data.days2025 !== undefined && data.days2025 !== null ? data.days2025.toString() : ''}
          onChange={(e) => handleDaysChange('days2025', e.target.value, maxCurrentDays)}
        />

        <AppInput
          label={`TY ${selectedTaxYear - 1} Days in U.S. (Max: ${maxPrior1Days}) *`}
          type="number"
          placeholder={isLeapYear(selectedTaxYear - 1) ? 'e.g. 366 (Leap)' : 'e.g. 365'}
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.days2024}
          value={data.days2024 !== undefined && data.days2024 !== null ? data.days2024.toString() : ''}
          onChange={(e) => handleDaysChange('days2024', e.target.value, maxPrior1Days)}
        />

        <AppInput
          label={`TY ${selectedTaxYear - 2} Days in U.S. (Max: ${maxPrior2Days}) *`}
          type="number"
          placeholder="e.g. 365"
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.days2023}
          value={data.days2023 !== undefined && data.days2023 !== null ? data.days2023.toString() : ''}
          onChange={(e) => handleDaysChange('days2023', e.target.value, maxPrior2Days)}
        />
      </div>

      {/* Multi-State Residing History Table (Taxpayer & Spouse) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Resided / Residing State Details (Taxpayer &amp; Spouse)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mention residence history with exact From and To dates for both Taxpayer and Spouse ({selectedTaxYear - 3} - {selectedTaxYear})
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
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
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add State Row</span>
          </Button>
        </div>

        {historyList.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
            <p>No multi-state residence history added yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
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
              }}
              className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add State Row</span>
            </Button>
          </div>
        ) : (
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
                        onChange={(d) => {
                          const list = [...historyList];
                          list[idx].fromDate = formatUsDate(d);
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
                        onChange={(d) => {
                          const list = [...historyList];
                          list[idx].toDate = formatUsDate(d);
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
                        onChange={(d) => {
                          const list = [...historyList];
                          list[idx].spouseFromDate = formatUsDate(d);
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
                        onChange={(d) => {
                          const list = [...historyList];
                          list[idx].spouseToDate = formatUsDate(d);
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
        )}
      </div>
    </div>
  );
};
