import React from 'react';
import { 
  FileSpreadsheet, 
  Landmark, 
  TrendingUp, 
  Receipt,
  Layers
} from 'lucide-react';
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
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. High-level Context & Quick Navigation Bar */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Income and Expenses Consolidation
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium max-w-2xl">
              Complete your W-2 wages, 1099 interest/dividend earnings, 1099-B stock gains &amp; sales, and claim state rent deductions, solar energy, and itemized expenses in this unified section.
            </p>
          </div>

          {/* Quick Jump Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('section-w2-wages')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>1. W-2 Wages</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-1099-interest')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              <span>2. 1099 Interest/Div</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-1099b-stocks')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>3. 1099-B Stocks</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-itemized-deductions')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>4. Deductions &amp; Rent</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Section 1: W-2 Wages & Earnings */}
      <div id="section-w2-wages" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">
                  Income Part 1
                </span>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  Form W-2 Wages &amp; Taxable Earnings
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Employer wage statements (Form W-2 Box 1 &amp; Box 2 compensation)
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <Module4Wages
            data={organizerData?.m4_wages || ({} as any)}
            updateField={(field, val) => updateModuleField('m4_wages', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      </div>

      {/* 3. Section 2: 1099 Interest & Dividends */}
      <div id="section-1099-interest" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                  Income Part 2
                </span>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  1099-INT / DIV / OID Interest &amp; Dividends
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                High-yield savings interest, dividends &amp; Original Issue Discount
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <Module5Interest
            data={organizerData?.m5_interest || ({} as any)}
            updateField={(field, val) => updateModuleField('m5_interest', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      </div>

      {/* 4. Section 3: 1099-B Stocks & Capital Gains */}
      <div id="section-1099b-stocks" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                  Income Part 3
                </span>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  1099-B Stocks, ESPP, RSU &amp; Capital Gains / Losses
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Brokerage statements, equity compensation, crypto &amp; carryforward capital losses
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <Module6Stocks
            data={organizerData?.m6_stocks || ({} as any)}
            updateField={(field, val) => updateModuleField('m6_stocks', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      </div>

      {/* 5. Section 4: Itemized Deductions & Expenses */}
      <div id="section-itemized-deductions" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Expenses &amp; Credits
                </span>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  Itemized Deductions, State Rent &amp; Expenses
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                State rent deduction, Form 1098 Mortgage, Indian property tax, Solar/Clean energy &amp; eligible itemized expenses
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <Module8Deductions
            data={organizerData?.m8_deductions || ({} as any)}
            updateField={(field, val) => updateModuleField('m8_deductions', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      </div>
    </div>
  );
};
