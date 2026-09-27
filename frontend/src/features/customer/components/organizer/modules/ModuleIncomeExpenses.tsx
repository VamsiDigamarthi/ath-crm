import React, { useState } from 'react';
import { 
  Plus, 
  X,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Module4Wages } from './Module4Wages';
import { Module5Interest } from './Module5Interest';
import { Module6Stocks } from './Module6Stocks';
import { ModuleRentalProperties } from './ModuleRentalProperties';
import { ModuleStateRentDeduction } from './ModuleStateRentDeduction';
import { ModuleCharityDonations } from './ModuleCharityDonations';
import { ModuleDaycareExpenses } from './ModuleDaycareExpenses';
import { ModuleItemizedExpenses } from './ModuleItemizedExpenses';
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
  // Collapsed / Open states for each individual top-level section
  const [isOpenWages, setIsOpenWages] = useState<boolean>(false);
  const [isOpenInterest, setIsOpenInterest] = useState<boolean>(false);
  const [isOpenStocks, setIsOpenStocks] = useState<boolean>(false);
  const [isOpenRentals, setIsOpenRentals] = useState<boolean>(false);
  const [isOpenStateRent, setIsOpenStateRent] = useState<boolean>(false);
  const [isOpenCharity, setIsOpenCharity] = useState<boolean>(false);
  const [isOpenDaycare, setIsOpenDaycare] = useState<boolean>(false);
  const [isOpenItemized, setIsOpenItemized] = useState<boolean>(false);

  // 1. W-2 Data summary
  const w2Data: Partial<OrganizerData['m4_wages']> = organizerData?.m4_wages || {};
  const hasW2Data = Boolean(
    w2Data.employerName || 
    (w2Data.estimatedWages !== undefined && w2Data.estimatedWages !== null && w2Data.estimatedWages > 0)
  );

  // 2. Interest/Dividends Data summary
  const interestData: Partial<OrganizerData['m5_interest']> = organizerData?.m5_interest || {};
  const hasInterestData = Boolean(
    interestData.bankName || 
    (interestData.interestAmount !== undefined && interestData.interestAmount !== null && interestData.interestAmount > 0) || 
    (interestData.dividendAmount !== undefined && interestData.dividendAmount !== null && interestData.dividendAmount > 0) || 
    (interestData.form1099OidAmount !== undefined && interestData.form1099OidAmount !== null && interestData.form1099OidAmount > 0)
  );

  // 3. Stocks Data summary
  const stocksData: Partial<OrganizerData['m6_stocks']> = organizerData?.m6_stocks || {};
  const stockList = stocksData.stocksList || [];
  const hasStocksData = stockList.length > 0;

  // 4. Rental Properties (Schedule E) summary
  const rentalList = organizerData?.m3_presence?.rentalProperties || organizerData?.m4_wages?.rentalProperties || [];
  const hasRentalData = rentalList.length > 0;

  const handleUpdateRentalProperties = (newList: NonNullable<OrganizerData['m3_presence']['rentalProperties']>) => {
    updateModuleField('m3_presence', 'rentalProperties', newList as any);
    updateModuleField('m4_wages', 'rentalProperties', newList as any);
  };

  // 5. State Rent Deductions summary
  const dedData: Partial<OrganizerData['m8_deductions']> = organizerData?.m8_deductions || {};
  const rentList = dedData.rentDeductionsList || [];
  const hasRentData = rentList.length > 0;

  // 6. Charity summary
  const charityList = dedData.charitableList || [];
  const hasCharityData = charityList.length > 0;

  // 7. Daycare summary
  const m2Data: Partial<OrganizerData['m2_dependents']> = organizerData?.m2_dependents || {};
  const daycareList = m2Data.daycareList || [];
  const hasDaycareData = daycareList.length > 0;

  // 8. Itemized Expenses summary
  const hasItemizedData = Boolean(
    (dedData.medicalExpenses !== undefined && dedData.medicalExpenses !== null && dedData.medicalExpenses > 0) || 
    (dedData.mortgageInterest1098 !== undefined && dedData.mortgageInterest1098 !== null && dedData.mortgageInterest1098 > 0) || 
    (dedData.propertyTaxesUs !== undefined && dedData.propertyTaxesUs !== null && dedData.propertyTaxesUs > 0) || 
    (dedData.cleanEnergyCost !== undefined && dedData.cleanEnergyCost !== null && dedData.cleanEnergyCost > 0) ||
    (dedData.hsaContribution !== undefined && dedData.hsaContribution !== null && dedData.hsaContribution > 0) ||
    (dedData.iraContribution !== undefined && dedData.iraContribution !== null && dedData.iraContribution > 0)
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. SECTION GROUP: INCOME SOURCES                                          */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <h3 className="text-xs font-semibold text-gray-700 tracking-wide uppercase">
              Income Sources
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            W-2 Wages, 1099 Interest/Dividends, 1099-B Stocks, Schedule E Rental Property
          </span>
        </div>

        {/* 1. Form W-2 Wages & Taxable Earnings */}
        {!isOpenWages ? (
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>1. Form W-2 Wages &amp; Taxable Earnings</span>
                  {hasW2Data && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      Added: {w2Data.employerName || (w2Data.estimatedWages ? `$${w2Data.estimatedWages.toLocaleString()}` : '')}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Employer wage statements (Form W-2 Box 1 &amp; Box 2 compensation)
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenWages(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasW2Data ? 'View / Edit W-2 Wages' : 'Add W-2 Wages'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-w2-wages" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>1. Form W-2 Wages &amp; Taxable Earnings</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Employer wage statements (Form W-2 Box 1 &amp; Box 2 compensation)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenWages(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
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
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>2. 1099-INT / DIV / OID Interest &amp; Dividends</span>
                  {hasInterestData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      Added: {interestData.bankName || 'Interest/Dividends'}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-yield savings interest, dividends &amp; Original Issue Discount
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenInterest(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasInterestData ? 'View / Edit 1099 Interest' : 'Add 1099 Interest / Dividends'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-1099-interest" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>2. 1099-INT / DIV / OID Interest &amp; Dividends</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-yield savings interest, dividends &amp; Original Issue Discount
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenInterest(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
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
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>3. 1099-B Stocks, ESPP, RSU &amp; Capital Gains / Losses</span>
                  {hasStocksData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      {stockList.length} Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Brokerage statements, equity compensation, crypto &amp; carryforward capital losses
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenStocks(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasStocksData ? 'View / Edit 1099-B Stocks' : 'Add 1099-B Stocks'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-1099b-stocks" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>3. 1099-B Stocks, ESPP, RSU &amp; Capital Gains / Losses</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Brokerage statements, equity compensation, crypto &amp; carryforward capital losses
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenStocks(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
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

        {/* 4. Rental Property Income & Expenses (Schedule E) */}
        {!isOpenRentals ? (
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>4. Rental Property Income &amp; Expenses (Schedule E)</span>
                  {hasRentalData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      {rentalList.length} Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Report rental real estate properties, gross rental income &amp; itemized Schedule E expenses
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenRentals(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasRentalData ? 'View / Edit Rental Properties' : 'Add Rental Property'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-rental-properties" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>4. Rental Property Income &amp; Expenses (Schedule E)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Report rental real estate properties, gross rental income &amp; itemized Schedule E expenses
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenRentals(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            <ModuleRentalProperties
              rentalList={rentalList}
              onUpdateRentals={handleUpdateRentalProperties}
              selectedTaxYear={selectedTaxYear}
              errors={errors}
              clearError={clearError}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION GROUP: TAX DEDUCTIONS & EXPENSES                                */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-gray-700 tracking-wide uppercase">
              Tax Deductions &amp; Expenses
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            State Rent, Charitable Donations, Daycare Credit &amp; Itemized Deductions
          </span>
        </div>

        {/* 5. State Renter Tax Deduction / Credit */}
        {!isOpenStateRent ? (
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>5. State Renter Tax Deduction / Credit (Tenant Rent Paid)</span>
                  {hasRentData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      {rentList.length} States Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Claim state renter tax credits if you paid residential rent as a tenant during {selectedTaxYear}
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenStateRent(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasRentData ? 'View / Edit State Rent' : 'Add State Rent Row'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-state-rent" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>5. State Renter Tax Deduction / Credit (Tenant Rent Paid)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Claim state renter tax credits if you paid residential rent as a tenant during {selectedTaxYear}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenStateRent(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            <ModuleStateRentDeduction
              rentList={rentList}
              onUpdateRentList={(newList) => {
                updateModuleField('m8_deductions', 'rentDeductionsList', newList as any);
                updateModuleField('m8_deductions', 'hasRentDeductions', newList.length > 0);
              }}
              selectedTaxYear={selectedTaxYear}
              errors={errors}
              clearError={clearError}
            />
          </div>
        )}

        {/* 6. Charitable Donations Worksheet */}
        {!isOpenCharity ? (
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>6. Charitable Donations Worksheet (501(c)(3) &amp; Religious)</span>
                  {hasCharityData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      {charityList.length} Donations Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  List qualifying religious, educational, or disaster relief donations in {selectedTaxYear}
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenCharity(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasCharityData ? 'View / Edit Donations' : 'Add Charitable Donation'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-charitable-donations" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>6. Charitable Donations Worksheet (501(c)(3) &amp; Religious)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  List qualifying religious, educational, or disaster relief donations in {selectedTaxYear}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenCharity(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            <ModuleCharityDonations
              charityList={charityList}
              onUpdateCharityList={(newList) => {
                updateModuleField('m8_deductions', 'charitableList', newList as any);
                updateModuleField(
                  'm8_deductions',
                  'charitableDonations',
                  newList.reduce((s, i) => s + (i.amountDonated || 0), 0)
                );
              }}
              selectedTaxYear={selectedTaxYear}
              errors={errors}
              clearError={clearError}
            />
          </div>
        )}

        {/* 7. Child & Daycare Care Expenses Worksheet */}
        {!isOpenDaycare ? (
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>7. Child &amp; Daycare Care Expenses Worksheet (Form 2441)</span>
                  {hasDaycareData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      {daycareList.length} Providers Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Daycare, preschool, or babysitter paid while parents worked in {selectedTaxYear}
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenDaycare(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasDaycareData ? 'View / Edit Daycare' : 'Add Daycare Provider'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-daycare-expenses" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>7. Child &amp; Daycare Care Expenses Worksheet (Form 2441)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Daycare, preschool, or babysitter paid while parents worked in {selectedTaxYear}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenDaycare(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            <ModuleDaycareExpenses
              daycareList={daycareList}
              onUpdateDaycareList={(newList) => {
                updateModuleField('m2_dependents', 'daycareList', newList as any);
                updateModuleField('m2_dependents', 'daycareExpensesClaimed', newList.length > 0);
              }}
              selectedTaxYear={selectedTaxYear}
              errors={errors}
              clearError={clearError}
            />
          </div>
        )}

        {/* 8. Schedule A Itemized Deductions & Clean Energy */}
        {!isOpenItemized ? (
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>8. Schedule A Itemized Deductions, HSA &amp; Clean Energy</span>
                  {hasItemizedData && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                      Deductions Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mortgage interest (Form 1098), Property taxes (US &amp; India), Solar/Clean energy, EV credit &amp; HSA
                </p>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={() => setIsOpenItemized(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasItemizedData ? 'View / Edit Deductions' : 'Add Deductions'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div id="section-itemized-deductions" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-700">
                  <span>8. Schedule A Itemized Deductions, HSA &amp; Clean Energy</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mortgage interest (Form 1098), Property taxes (US &amp; India), Solar/Clean energy, EV credit &amp; HSA
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenItemized(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            <ModuleItemizedExpenses
              data={(organizerData?.m8_deductions || {}) as OrganizerData['m8_deductions']}
              updateField={(field, val) => updateModuleField('m8_deductions', field, val)}
              selectedTaxYear={selectedTaxYear}
              errors={errors}
              clearError={clearError}
            />
          </div>
        )}
      </div>
    </div>
  );
};
