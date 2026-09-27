import React from 'react';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleItemizedExpensesProps {
  data: OrganizerData['m8_deductions'];
  updateField: <K extends keyof OrganizerData['m8_deductions']>(field: K, value: OrganizerData['m8_deductions'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleItemizedExpenses: React.FC<ModuleItemizedExpensesProps> = ({
  data,
  updateField,
  selectedTaxYear,
  errors: _errors = {},
  clearError: _clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m8_deductions']>;

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <p className="text-[11px] text-slate-500">
          Enter eligible itemized deductions, Form 1098 Mortgage Interest, Property Taxes, HSA and Clean Energy expenses for TY {selectedTaxYear}.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border border-slate-200 rounded-md overflow-hidden min-w-[720px]">
          <thead className="bg-slate-50 text-gray-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-2.5 w-12 text-center">S.No</th>
              <th className="p-2.5 w-1/2">Type Of Expense Category</th>
              <th className="p-2.5 w-1/4 bg-emerald-50/50 text-emerald-900">Taxpayer ($)</th>
              <th className="p-2.5 w-1/4 bg-indigo-50/50 text-indigo-900">Spouse ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {/* Row 1 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">1</td>
              <td className="p-2.5 font-semibold text-gray-700">Last Year&apos;s Tax Preparation Fees</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.lastYearTaxPrepFeeTaxpayer !== undefined && d.lastYearTaxPrepFeeTaxpayer !== null && d.lastYearTaxPrepFeeTaxpayer > 0 ? d.lastYearTaxPrepFeeTaxpayer.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('lastYearTaxPrepFeeTaxpayer', val);
                    updateField('lastYearTaxPrepFee', val + (d.lastYearTaxPrepFeeSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.lastYearTaxPrepFeeSpouse !== undefined && d.lastYearTaxPrepFeeSpouse !== null && d.lastYearTaxPrepFeeSpouse > 0 ? d.lastYearTaxPrepFeeSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('lastYearTaxPrepFeeSpouse', val);
                    updateField('lastYearTaxPrepFee', (d.lastYearTaxPrepFeeTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">2</td>
              <td className="p-2.5 font-semibold text-gray-700">Home Mortgage Interest (Form 1098 - Interest Only)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.mortgageInterestTaxpayer !== undefined && d.mortgageInterestTaxpayer !== null && d.mortgageInterestTaxpayer > 0 ? d.mortgageInterestTaxpayer.toString() : (d.mortgageInterest1098 ? d.mortgageInterest1098.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('mortgageInterestTaxpayer', val);
                    updateField('mortgageInterest1098', val + (d.mortgageInterestSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.mortgageInterestSpouse !== undefined && d.mortgageInterestSpouse !== null && d.mortgageInterestSpouse > 0 ? d.mortgageInterestSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('mortgageInterestSpouse', val);
                    updateField('mortgageInterest1098', (d.mortgageInterestTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 3 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">3</td>
              <td className="p-2.5 font-semibold text-gray-700">Property / Real Estate Taxes (US)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.propertyTaxesUsTaxpayer !== undefined && d.propertyTaxesUsTaxpayer !== null && d.propertyTaxesUsTaxpayer > 0 ? d.propertyTaxesUsTaxpayer.toString() : (d.propertyTaxesUs ? d.propertyTaxesUs.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('propertyTaxesUsTaxpayer', val);
                    updateField('propertyTaxesUs', val + (d.propertyTaxesUsSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.propertyTaxesUsSpouse !== undefined && d.propertyTaxesUsSpouse !== null && d.propertyTaxesUsSpouse > 0 ? d.propertyTaxesUsSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('propertyTaxesUsSpouse', val);
                    updateField('propertyTaxesUs', (d.propertyTaxesUsTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 4 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">4</td>
              <td className="p-2.5 font-semibold text-gray-700">Property Taxes Paid on Indian Properties</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.propertyTaxesIndiaTaxpayer !== undefined && d.propertyTaxesIndiaTaxpayer !== null && d.propertyTaxesIndiaTaxpayer > 0 ? d.propertyTaxesIndiaTaxpayer.toString() : (d.propertyTaxesIndia ? d.propertyTaxesIndia.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('propertyTaxesIndiaTaxpayer', val);
                    updateField('propertyTaxesIndia', val + (d.propertyTaxesIndiaSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.propertyTaxesIndiaSpouse !== undefined && d.propertyTaxesIndiaSpouse !== null && d.propertyTaxesIndiaSpouse > 0 ? d.propertyTaxesIndiaSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('propertyTaxesIndiaSpouse', val);
                    updateField('propertyTaxesIndia', (d.propertyTaxesIndiaTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 5 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">5</td>
              <td className="p-2.5 font-semibold text-gray-700">Medical &amp; Dental Expenses (Above 7.5% of AGI)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.medicalExpensesTaxpayer !== undefined && d.medicalExpensesTaxpayer !== null && d.medicalExpensesTaxpayer > 0 ? d.medicalExpensesTaxpayer.toString() : (d.medicalExpenses ? d.medicalExpenses.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('medicalExpensesTaxpayer', val);
                    updateField('medicalExpenses', val + (d.medicalExpensesSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.medicalExpensesSpouse !== undefined && d.medicalExpensesSpouse !== null && d.medicalExpensesSpouse > 0 ? d.medicalExpensesSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('medicalExpensesSpouse', val);
                    updateField('medicalExpenses', (d.medicalExpensesTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 6 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">6</td>
              <td className="p-2.5 font-semibold text-gray-700">Student Loan Interest (Form 1098-E - $2,500 Limit)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.studentLoanInterestTaxpayer !== undefined && d.studentLoanInterestTaxpayer !== null && d.studentLoanInterestTaxpayer > 0 ? d.studentLoanInterestTaxpayer.toString() : (d.studentLoanInterest ? d.studentLoanInterest.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('studentLoanInterestTaxpayer', val);
                    updateField('studentLoanInterest', val + (d.studentLoanInterestSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.studentLoanInterestSpouse !== undefined && d.studentLoanInterestSpouse !== null && d.studentLoanInterestSpouse > 0 ? d.studentLoanInterestSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('studentLoanInterestSpouse', val);
                    updateField('studentLoanInterest', (d.studentLoanInterestTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 7 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">7</td>
              <td className="p-2.5 font-semibold text-gray-700">Solar &amp; Clean Energy Property Costs (Form 5695)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.solarCleanEnergyTaxpayer !== undefined && d.solarCleanEnergyTaxpayer !== null && d.solarCleanEnergyTaxpayer > 0 ? d.solarCleanEnergyTaxpayer.toString() : (d.solarCleanEnergyExpenses ? d.solarCleanEnergyExpenses.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('solarCleanEnergyTaxpayer', val);
                    updateField('solarCleanEnergyExpenses', val + (d.solarCleanEnergySpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.solarCleanEnergySpouse !== undefined && d.solarCleanEnergySpouse !== null && d.solarCleanEnergySpouse > 0 ? d.solarCleanEnergySpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('solarCleanEnergySpouse', val);
                    updateField('solarCleanEnergyExpenses', (d.solarCleanEnergyTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 8 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">8</td>
              <td className="p-2.5 font-semibold text-gray-700">Electric Vehicle (EV) Credit (Form 8936)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.electricVehicleTaxpayer !== undefined && d.electricVehicleTaxpayer !== null && d.electricVehicleTaxpayer > 0 ? d.electricVehicleTaxpayer.toString() : (d.electricVehicleExpenses ? d.electricVehicleExpenses.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('electricVehicleTaxpayer', val);
                    updateField('electricVehicleExpenses', val + (d.electricVehicleSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.electricVehicleSpouse !== undefined && d.electricVehicleSpouse !== null && d.electricVehicleSpouse > 0 ? d.electricVehicleSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('electricVehicleSpouse', val);
                    updateField('electricVehicleExpenses', (d.electricVehicleTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 9 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">9</td>
              <td className="p-2.5 font-semibold text-gray-700">HSA Personal Contributions (Form 8889)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.hsaTaxpayer !== undefined && d.hsaTaxpayer !== null && d.hsaTaxpayer > 0 ? d.hsaTaxpayer.toString() : (d.hsaContribution ? d.hsaContribution.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('hsaTaxpayer', val);
                    updateField('hsaContribution', val + (d.hsaSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.hsaSpouse !== undefined && d.hsaSpouse !== null && d.hsaSpouse > 0 ? d.hsaSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('hsaSpouse', val);
                    updateField('hsaContribution', (d.hsaTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 10 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">10</td>
              <td className="p-2.5 font-semibold text-gray-700">Traditional IRA Contributions</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.iraTaxpayer !== undefined && d.iraTaxpayer !== null && d.iraTaxpayer > 0 ? d.iraTaxpayer.toString() : (d.iraContribution ? d.iraContribution.toString() : '')}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('iraTaxpayer', val);
                    updateField('iraContribution', val + (d.iraSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.iraSpouse !== undefined && d.iraSpouse !== null && d.iraSpouse > 0 ? d.iraSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('iraSpouse', val);
                    updateField('iraContribution', (d.iraTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 11 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">11</td>
              <td className="p-2.5 font-semibold text-gray-700">Educator Classroom Expenses ($300 Limit)</td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.educatorExpensesTaxpayer !== undefined && d.educatorExpensesTaxpayer !== null && d.educatorExpensesTaxpayer > 0 ? d.educatorExpensesTaxpayer.toString() : (d.educatorExpenses ? d.educatorExpenses.toString() : '')}
                  onChange={(e) => {
                    const val = Math.min(300, Math.max(0, parseFloat(e.target.value) || 0));
                    updateField('educatorExpensesTaxpayer', val);
                    updateField('educatorExpenses', val + (d.educatorExpensesSpouse || 0));
                  }}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.educatorExpensesSpouse !== undefined && d.educatorExpensesSpouse !== null && d.educatorExpensesSpouse > 0 ? d.educatorExpensesSpouse.toString() : ''}
                  onChange={(e) => {
                    const val = Math.min(300, Math.max(0, parseFloat(e.target.value) || 0));
                    updateField('educatorExpensesSpouse', val);
                    updateField('educatorExpenses', (d.educatorExpensesTaxpayer || 0) + val);
                  }}
                />
              </td>
            </tr>

            {/* Row 12 */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-2.5 font-medium text-slate-600 text-center">12</td>
              <td className="p-2.5 font-semibold text-gray-700">
                Other Deductions
                <input
                  type="text"
                  placeholder="Brief description of deduction..."
                  className="w-full mt-1 px-2.5 py-1 border border-slate-200 rounded-md text-[11px] font-normal text-slate-700"
                  value={d.otherDeductionsDescription || ''}
                  onChange={(e) => updateField('otherDeductionsDescription', e.target.value)}
                />
              </td>
              <td className="p-2" colSpan={2}>
                <input
                  type="number"
                  placeholder="Total Amount ($)"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal"
                  value={d.otherDeductionsAmount !== undefined && d.otherDeductionsAmount !== null && d.otherDeductionsAmount > 0 ? d.otherDeductionsAmount.toString() : ''}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    updateField('otherDeductionsAmount', val);
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
