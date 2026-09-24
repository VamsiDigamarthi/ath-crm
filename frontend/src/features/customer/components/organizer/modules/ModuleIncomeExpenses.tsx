import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Landmark, 
  TrendingUp, 
  Receipt,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Module4Wages } from './Module4Wages';
import { Module5Interest } from './Module5Interest';
import { Module6Stocks } from './Module6Stocks';
import { Module8Deductions } from './Module8Deductions';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleIncomeExpensesProps {
  organizerData: OrganizerData;
  updateModuleField: <K extends keyof OrganizerData>(moduleKey: K, field: keyof OrganizerData[K], value: any) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleIncomeExpenses: React.FC<ModuleIncomeExpensesProps> = ({
  organizerData,
  updateModuleField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  // All 4 Income & Expense sections are collapsed / closed by default
  const [isOpenWages, setIsOpenWages] = useState<boolean>(false);
  const [isOpenInterest, setIsOpenInterest] = useState<boolean>(false);
  const [isOpenStocks, setIsOpenStocks] = useState<boolean>(false);
  const [isOpenDeductions, setIsOpenDeductions] = useState<boolean>(false);

  // Explicit type annotations to prevent '{}' inference errors in strict IDE environments
  const w2Data: Partial<OrganizerData['m4_wages']> = organizerData?.m4_wages || {};
  const hasW2Data = Boolean(
    w2Data.employerName || 
    (w2Data.estimatedWages !== undefined && w2Data.estimatedWages !== null && w2Data.estimatedWages > 0)
  );

  const interestData: Partial<OrganizerData['m5_interest']> = organizerData?.m5_interest || {};
  const hasInterestData = Boolean(
    interestData.bankName || 
    (interestData.interestAmount !== undefined && interestData.interestAmount !== null && interestData.interestAmount > 0) || 
    (interestData.dividendAmount !== undefined && interestData.dividendAmount !== null && interestData.dividendAmount > 0) || 
    (interestData.form1099OidAmount !== undefined && interestData.form1099OidAmount !== null && interestData.form1099OidAmount > 0)
  );

  const stocksData: Partial<OrganizerData['m6_stocks']> = organizerData?.m6_stocks || {};
  const stockList = stocksData.stocksList || [];
  const hasStocksData = stockList.length > 0;

  const dedData: Partial<OrganizerData['m8_deductions']> = organizerData?.m8_deductions || {};
  const hasDeductionsData = Boolean(
    (dedData.rentDeductionsList && dedData.rentDeductionsList.length > 0) || 
    (dedData.charitableList && dedData.charitableList.length > 0) || 
    dedData.hasRentDeductions || 
    (dedData.medicalExpenses !== undefined && dedData.medicalExpenses !== null && dedData.medicalExpenses > 0) || 
    (dedData.mortgageInterest1098 !== undefined && dedData.mortgageInterest1098 !== null && dedData.mortgageInterest1098 > 0) || 
    (dedData.propertyTaxesUs !== undefined && dedData.propertyTaxesUs !== null && dedData.propertyTaxesUs > 0) || 
    (dedData.cleanEnergyCost !== undefined && dedData.cleanEnergyCost !== null && dedData.cleanEnergyCost > 0)
  );

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Form W-2 Wages & Taxable Earnings */}
      {!isOpenWages ? (
        /* Collapsed State (Default) */
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Form W-2 Wages &amp; Taxable Earnings</span>
                  {hasW2Data && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      Added: {w2Data.employerName || (w2Data.estimatedWages ? `$${w2Data.estimatedWages.toLocaleString()}` : '')}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Employer wage statements (Form W-2 Box 1 &amp; Box 2 compensation)
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setIsOpenWages(true)}
              className="text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasW2Data ? 'View / Edit W-2 Wages' : 'Add W-2 Wages'}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Open State: Clean Form */
        <div id="section-w2-wages" className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>1. Form W-2 Wages &amp; Taxable Earnings</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Employer wage statements (Form W-2 Box 1 &amp; Box 2 compensation)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenWages(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <Module4Wages
            data={(organizerData?.m4_wages || {}) as OrganizerData['m4_wages']}
            updateField={(field, val) => updateModuleField('m4_wages', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 2. 1099 Interest & Dividends */}
      {!isOpenInterest ? (
        /* Collapsed State (Default) */
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-blue-600 border border-slate-200 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. 1099-INT / DIV / OID Interest &amp; Dividends</span>
                  {hasInterestData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Added: {interestData.bankName || 'Interest/Dividends'}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-yield savings interest, dividends &amp; Original Issue Discount
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setIsOpenInterest(true)}
              className="text-xs font-bold border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasInterestData ? 'View / Edit 1099 Interest' : 'Add 1099 Interest / Dividends'}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Open State: Clean Form */
        <div id="section-1099-interest" className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-blue-600" />
                <span>2. 1099-INT / DIV / OID Interest &amp; Dividends</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                High-yield savings interest, dividends &amp; Original Issue Discount
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenInterest(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <Module5Interest
            data={(organizerData?.m5_interest || {}) as OrganizerData['m5_interest']}
            updateField={(field, val) => updateModuleField('m5_interest', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 3. 1099-B Stocks & Capital Gains */}
      {!isOpenStocks ? (
        /* Collapsed State (Default) */
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-amber-600 border border-slate-200 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>3. 1099-B Stocks, ESPP, RSU &amp; Capital Gains / Losses</span>
                  {hasStocksData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      {stockList.length} Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Brokerage statements, equity compensation, crypto &amp; carryforward capital losses
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setIsOpenStocks(true)}
              className="text-xs font-bold border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasStocksData ? 'View / Edit 1099-B Stocks' : 'Add 1099-B Stocks'}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Open State: Clean Form */
        <div id="section-1099b-stocks" className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>3. 1099-B Stocks, ESPP, RSU &amp; Capital Gains / Losses</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Brokerage statements, equity compensation, crypto &amp; carryforward capital losses
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenStocks(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <Module6Stocks
            data={(organizerData?.m6_stocks || {}) as OrganizerData['m6_stocks']}
            updateField={(field, val) => updateModuleField('m6_stocks', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 4. Itemized Deductions & Expenses */}
      {!isOpenDeductions ? (
        /* Collapsed State (Default) */
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#16A34A] border border-slate-200 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>4. Itemized Deductions, State Rent &amp; Expenses</span>
                  {hasDeductionsData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Deductions Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  State rent deduction, Form 1098 Mortgage, Indian property tax, Solar/Clean energy &amp; eligible expenses
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setIsOpenDeductions(true)}
              className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasDeductionsData ? 'View / Edit Deductions' : 'Add Deductions & Rent'}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Open State: Clean Form */
        <div id="section-itemized-deductions" className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>4. Itemized Deductions, State Rent &amp; Expenses</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                State rent deduction, Form 1098 Mortgage, Indian property tax, Solar/Clean energy &amp; eligible itemized expenses
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenDeductions(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <Module8Deductions
            data={(organizerData?.m8_deductions || {}) as OrganizerData['m8_deductions']}
            updateField={(field, val) => updateModuleField('m8_deductions', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}
    </div>
  );
};
