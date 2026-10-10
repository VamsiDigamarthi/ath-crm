import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/components/Button';
// import { Module4Wages } from './Module4Wages'; // W-2 section hidden
import { Module5Interest } from './Module5Interest';
import { Module10Retirement } from './Module10Retirement';
import { Module6Stocks } from './Module6Stocks';
import { ModuleRentalProperties } from './ModuleRentalProperties';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleIncomeProps {
  organizerData: OrganizerData;
  updateModuleField: <K extends keyof OrganizerData>(moduleKey: K, field: keyof NonNullable<OrganizerData[K]>, value: any) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleIncome: React.FC<ModuleIncomeProps> = ({
  organizerData,
  updateModuleField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  // Collapsed / Open states for each individual income section
  // const [isOpenWages, setIsOpenWages] = useState<boolean>(false); // W-2 section hidden
  const [isOpenInterest, setIsOpenInterest] = useState<boolean>(false);
  const [isOpenRetirement, setIsOpenRetirement] = useState<boolean>(false);
  const [isOpenStocks, setIsOpenStocks] = useState<boolean>(false);
  const [isOpenRentals, setIsOpenRentals] = useState<boolean>(false);

  // // 1. W-2 Data summary
  // const w2Data: Partial<OrganizerData['m4_wages']> = organizerData?.m4_wages || {};
  // const hasW2Data = Boolean(
  //   w2Data.employerName || 
  //   (w2Data.estimatedWages !== undefined && w2Data.estimatedWages !== null && w2Data.estimatedWages > 0)
  // );

  // 2. Interest/Dividends Data summary
  const interestData: Partial<OrganizerData['m5_interest']> = organizerData?.m5_interest || {};
  const hasInterestData = Boolean(
    interestData.bankName || 
    (interestData.interestAmount !== undefined && interestData.interestAmount !== null && interestData.interestAmount > 0) || 
    (interestData.interestFedTaxWithheld !== undefined && interestData.interestFedTaxWithheld !== null && interestData.interestFedTaxWithheld > 0) || 
    (interestData.dividendAmount !== undefined && interestData.dividendAmount !== null && interestData.dividendAmount > 0) || 
    (interestData.dividendFedTaxWithheld !== undefined && interestData.dividendFedTaxWithheld !== null && interestData.dividendFedTaxWithheld > 0) || 
    (interestData.form1099OidAmount !== undefined && interestData.form1099OidAmount !== null && interestData.form1099OidAmount > 0) ||
    (interestData.form1099OidFedTaxWithheld !== undefined && interestData.form1099OidFedTaxWithheld !== null && interestData.form1099OidFedTaxWithheld > 0)
  );

  // 3. Retirement / IRA Distributions Data summary
  const retirementData: Partial<NonNullable<OrganizerData['m10_retirement']>> = organizerData?.m10_retirement || {};
  const hasRetirementData = Boolean(
    retirementData.payerName ||
    (retirementData.grossDistribution !== undefined && retirementData.grossDistribution !== null && retirementData.grossDistribution > 0) ||
    (retirementData.fedTaxWithheld !== undefined && retirementData.fedTaxWithheld !== null && retirementData.fedTaxWithheld > 0)
  );

  // 4. Stocks Data summary
  const stocksData: Partial<OrganizerData['m6_stocks']> = organizerData?.m6_stocks || {};
  const stockList = stocksData.stocksList || [];
  const hasStocksData = stockList.length > 0;

  // 5. Rental Properties (Schedule E) summary
  const rentalList = organizerData?.m3_presence?.rentalProperties || organizerData?.m4_wages?.rentalProperties || [];
  const hasRentalData = rentalList.length > 0;

  const handleUpdateRentalProperties = (newList: NonNullable<OrganizerData['m3_presence']['rentalProperties']>) => {
    updateModuleField('m3_presence', 'rentalProperties', newList as any);
    updateModuleField('m4_wages', 'rentalProperties', newList as any);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* W-2 Wages section hidden (client request): W-2 comes in through Upload Documents
      {/ * 1. Form W-2 Wages & Taxable Earnings * /}
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

      */}

      {/* 2. 1099 Interest & Dividends */}
      {!isOpenInterest ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>1. 1099-INT / DIV / OID Interest &amp; Dividends</span>
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
                <span>1. 1099-INT / DIV / OID Interest &amp; Dividends</span>
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

      {/* 3. Form 1099-R IRA & Retirement Distributions / Early Withdrawals */}
      {!isOpenRetirement ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>2. Form 1099-R IRA &amp; Retirement Distributions / Early Withdrawals</span>
                {hasRetirementData && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    Added: {retirementData.payerName || '1099-R Distribution'}
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Traditional / Roth IRA, 401(k), 403(b), pension distributions &amp; early withdrawal penalty exceptions (Form 5329)
              </p>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => setIsOpenRetirement(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasRetirementData ? 'View / Edit 1099-R Distributions' : 'Add 1099-R IRA / Retirement'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div id="section-1099r-retirement" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-semibold text-gray-700">
                <span>2. Form 1099-R IRA &amp; Retirement Distributions / Early Withdrawals</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Traditional / Roth IRA, 401(k), 403(b), pension distributions &amp; early withdrawal penalty exceptions (Form 5329)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenRetirement(false)}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <Module10Retirement
            data={organizerData?.m10_retirement}
            updateField={(field, val) => updateModuleField('m10_retirement' as any, field as any, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 4. 1099-B Stocks & Capital Gains */}
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

      {/* 5. Rental Property Income & Expenses (Schedule E) */}
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
  );
};
