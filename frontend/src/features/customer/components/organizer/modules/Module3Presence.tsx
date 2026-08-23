import React from 'react';
import { Globe, Home, Calendar, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';

interface Module3Props {
  data: OrganizerData['m3_presence'];
  updateField: <K extends keyof OrganizerData['m3_presence']>(field: K, value: OrganizerData['m3_presence'][K]) => void;
  selectedTaxYear: number;
}

export const Module3Presence: React.FC<Module3Props> = ({
  data,
  updateField,
  selectedTaxYear,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
        <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Mandatory Substantial Presence Calculation:</strong> Mention your total days present in the US for {selectedTaxYear}, {selectedTaxYear - 1} &amp; {selectedTaxYear - 2}. This legally defines whether you file Form 1040 (Resident) or Form 1040-NR (Non-Resident).
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppInput
          label={`TY ${selectedTaxYear} Days in U.S. *`}
          type="number"
          placeholder="365"
          leftIcon={<Calendar className="w-4 h-4" />}
          value={data.days2025?.toString() || '365'}
          onChange={(e) => updateField('days2025', parseInt(e.target.value, 10) || 0)}
        />

        <AppInput
          label={`TY ${selectedTaxYear - 1} Days in U.S. *`}
          type="number"
          placeholder="365"
          leftIcon={<Calendar className="w-4 h-4" />}
          value={data.days2024?.toString() || '365'}
          onChange={(e) => updateField('days2024', parseInt(e.target.value, 10) || 0)}
        />

        <AppInput
          label={`TY ${selectedTaxYear - 2} Days in U.S. *`}
          type="number"
          placeholder="365"
          leftIcon={<Calendar className="w-4 h-4" />}
          value={data.days2023?.toString() || '365'}
          onChange={(e) => updateField('days2023', parseInt(e.target.value, 10) || 0)}
        />
      </div>

      {/* Multi-State Residing History Table (Taxpayer & Spouse) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>RESIDED / RESIDING STATE/STATES Details (Taxpayer &amp; Spouse)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mention residence history with exact From and To dates for both Taxpayer and Spouse (2022 - 2025)
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentHistory = data.statesResidedHistory && data.statesResidedHistory.length > 0
                ? [...data.statesResidedHistory]
                : [
                    { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                    { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                    { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                    { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                  ];
              const updated = [
                ...currentHistory,
                {
                  taxYear: 2025,
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
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add State Row</span>
          </Button>
        </div>

        {/* State History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden min-w-[780px]">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-20 text-center">Tax Year</th>
                <th className="p-3 bg-emerald-50/60 text-emerald-900 border-l border-r border-slate-200 text-center" colSpan={3}>
                  Taxpayer Residency
                </th>
                <th className="p-3 bg-indigo-50/60 text-indigo-900 text-center" colSpan={3}>
                  Spouse Residency
                </th>
                <th className="p-3 w-10 text-center"></th>
              </tr>
              <tr className="border-t border-slate-200 bg-slate-50/80 text-[11px] text-slate-600">
                <th className="p-2 text-center">Year</th>
                <th className="p-2 border-l border-slate-200 w-24">State</th>
                <th className="p-2 min-w-[140px]">From (MM/DD/YYYY)</th>
                <th className="p-2 border-r border-slate-200 min-w-[140px]">To (MM/DD/YYYY)</th>
                <th className="p-2 w-24">State</th>
                <th className="p-2 min-w-[140px]">From (MM/DD/YYYY)</th>
                <th className="p-2 min-w-[140px]">To (MM/DD/YYYY)</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {(data.statesResidedHistory && data.statesResidedHistory.length > 0
                ? data.statesResidedHistory
                : [
                    { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                    { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                    { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                    { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                  ]
              ).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2.5 font-bold text-slate-900 bg-slate-50/40 text-center">
                    <input
                      type="number"
                      className="w-16 px-1.5 py-1 border border-slate-200 rounded text-xs font-bold text-center bg-white"
                      value={row.taxYear}
                      onChange={(e) => {
                        const list = data.statesResidedHistory && data.statesResidedHistory.length > 0
                          ? [...data.statesResidedHistory]
                          : [
                              { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                              { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                              { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                              { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                            ];
                        list[idx].taxYear = parseInt(e.target.value, 10) || 2025;
                        updateField('statesResidedHistory', list);
                      }}
                    />
                  </td>

                  {/* Taxpayer State */}
                  <td className="p-2 border-l border-slate-200">
                    <input
                      type="text"
                      placeholder="TX"
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs uppercase font-bold text-slate-800"
                      value={row.state}
                      onChange={(e) => {
                        const list = data.statesResidedHistory && data.statesResidedHistory.length > 0
                          ? [...data.statesResidedHistory]
                          : [
                              { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                              { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                              { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                              { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                            ];
                        list[idx].state = e.target.value.toUpperCase();
                        updateField('statesResidedHistory', list);
                      }}
                    />
                  </td>

                  {/* Taxpayer From Date */}
                  <td className="p-2">
                    <AppDatePicker
                      placeholder="MM/DD/YYYY"
                      format="MM/dd/yyyy"
                      accentColor="#16A34A"
                      value={parseUsDate(row.fromDate)}
                      onChange={(d) => {
                        const list = data.statesResidedHistory && data.statesResidedHistory.length > 0
                          ? [...data.statesResidedHistory]
                          : [
                              { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                              { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                              { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                              { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                            ];
                        list[idx].fromDate = formatUsDate(d);
                        updateField('statesResidedHistory', list);
                      }}
                    />
                  </td>

                  {/* Taxpayer To Date */}
                  <td className="p-2 border-r border-slate-200">
                    <AppDatePicker
                      placeholder="MM/DD/YYYY"
                      format="MM/dd/yyyy"
                      accentColor="#16A34A"
                      value={parseUsDate(row.toDate)}
                      onChange={(d) => {
                        const list = data.statesResidedHistory && data.statesResidedHistory.length > 0
                          ? [...data.statesResidedHistory]
                          : [
                              { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                              { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                              { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                              { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                            ];
                        list[idx].toDate = formatUsDate(d);
                        updateField('statesResidedHistory', list);
                      }}
                    />
                  </td>

                  {/* Spouse State */}
                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="TX"
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs uppercase font-bold text-slate-800"
                      value={row.spouseState || ''}
                      onChange={(e) => {
                        const list = data.statesResidedHistory && data.statesResidedHistory.length > 0
                          ? [...data.statesResidedHistory]
                          : [
                              { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                              { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                              { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                              { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                            ];
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
                      accentColor="#16A34A"
                      value={parseUsDate(row.spouseFromDate)}
                      onChange={(d) => {
                        const list = data.statesResidedHistory && data.statesResidedHistory.length > 0
                          ? [...data.statesResidedHistory]
                          : [
                              { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                              { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                              { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                              { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                            ];
                        list[idx].spouseFromDate = formatUsDate(d);
                        updateField('statesResidedHistory', list);
                      }}
                    />
                  </td>

                  {/* Spouse To Date */}
                  <td className="p-2">
                    <AppDatePicker
                      placeholder="MM/DD/YYYY"
                      format="MM/dd/yyyy"
                      accentColor="#16A34A"
                      value={parseUsDate(row.spouseToDate)}
                      onChange={(d) => {
                        const list = data.statesResidedHistory && data.statesResidedHistory.length > 0
                          ? [...data.statesResidedHistory]
                          : [
                              { taxYear: 2025, state: 'TX', fromDate: '01/01/2025', toDate: '12/31/2025', spouseState: 'TX', spouseFromDate: '01/01/2025', spouseToDate: '12/31/2025' },
                              { taxYear: 2024, state: 'TX', fromDate: '01/01/2024', toDate: '12/31/2024', spouseState: 'TX', spouseFromDate: '01/01/2024', spouseToDate: '12/31/2024' },
                              { taxYear: 2023, state: 'TX', fromDate: '01/01/2023', toDate: '12/31/2023', spouseState: 'TX', spouseFromDate: '01/01/2023', spouseToDate: '12/31/2023' },
                              { taxYear: 2022, state: 'TX', fromDate: '01/01/2022', toDate: '12/31/2022', spouseState: 'TX', spouseFromDate: '01/01/2022', spouseToDate: '12/31/2022' },
                            ];
                        list[idx].spouseToDate = formatUsDate(d);
                        updateField('statesResidedHistory', list);
                      }}
                    />
                  </td>

                  <td className="p-2 text-center">
                    {idx >= 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          const list = (data.statesResidedHistory || []).filter((_, i) => i !== idx);
                          updateField('statesResidedHistory', list);
                        }}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* City / County Taxes Warning Box */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>City &amp; County Taxes Advisory:</strong> You might have to file local City/County tax returns if you have resided in <strong>Kentucky, Michigan, New York (NYC/Yonkers), Ohio, Pennsylvania, Indiana, Iowa, or Maryland</strong>. Our CPAs will automatically calculate local filing credits.
        </div>
      </div>
    </div>
  );
};
