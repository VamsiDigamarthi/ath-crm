import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { ModuleStateRentDeduction } from './ModuleStateRentDeduction';
import { ModuleCharityDonations } from './ModuleCharityDonations';
import { ModuleDaycareExpenses } from './ModuleDaycareExpenses';
import { ModuleItemizedExpenses } from './ModuleItemizedExpenses';
import { ModuleOtherTaxesPaid } from './ModuleOtherTaxesPaid';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleExpensesProps {
  organizerData: OrganizerData;
  updateModuleField: <K extends keyof OrganizerData>(moduleKey: K, field: keyof OrganizerData[K], value: any) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleExpenses: React.FC<ModuleExpensesProps> = ({
  organizerData,
  updateModuleField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  // Collapsed / Open states for each individual expense section
  const [isOpenStateRent, setIsOpenStateRent] = useState<boolean>(false);
  const [isOpenCharity, setIsOpenCharity] = useState<boolean>(false);
  const [isOpenDaycare, setIsOpenDaycare] = useState<boolean>(false);
  const [isOpenItemized, setIsOpenItemized] = useState<boolean>(false);

  // 1. State Rent Deductions summary
  const dedData: Partial<OrganizerData['m8_deductions']> = organizerData?.m8_deductions || {};
  const rentList = dedData.rentDeductionsList || [];
  const hasRentData = rentList.length > 0;

  // 2. Charity summary
  const charityList = dedData.charitableList || [];
  const hasCharityData = charityList.length > 0;

  // 3. Daycare summary
  const m2Data: Partial<OrganizerData['m2_dependents']> = organizerData?.m2_dependents || {};
  const daycareList = m2Data.daycareList || [];
  const hasDaycareData = daycareList.length > 0;

  // 4. Itemized Expenses summary
  const hasItemizedData = Boolean(
    (dedData.medicalExpenses !== undefined && dedData.medicalExpenses !== null && dedData.medicalExpenses > 0) || 
    (dedData.mortgageInterest1098 !== undefined && dedData.mortgageInterest1098 !== null && dedData.mortgageInterest1098 > 0) || 
    (dedData.propertyTaxesUs !== undefined && dedData.propertyTaxesUs !== null && dedData.propertyTaxesUs > 0) || 
    (dedData.cleanEnergyCost !== undefined && dedData.cleanEnergyCost !== null && dedData.cleanEnergyCost > 0) ||
    (dedData.hsaContribution !== undefined && dedData.hsaContribution !== null && dedData.hsaContribution > 0) ||
    (dedData.iraContribution !== undefined && dedData.iraContribution !== null && dedData.iraContribution > 0)
  );

  return (
    <div className="space-y-4 font-sans">
      {/* 1. State Renter Tax Deduction / Credit */}
      {!isOpenStateRent ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>1. State Renter Tax Deduction / Credit (Tenant Rent Paid)</span>
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
                <span>1. State Renter Tax Deduction / Credit (Tenant Rent Paid)</span>
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

      {/* 2. Charitable Donations Worksheet */}
      {!isOpenCharity ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>2. Charitable Donations Worksheet (501(c)(3) &amp; Religious)</span>
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
                <span>2. Charitable Donations Worksheet (501(c)(3) &amp; Religious)</span>
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

      {/* 3. Child & Daycare Care Expenses Worksheet */}
      {!isOpenDaycare ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>3. Child &amp; Daycare Care Expenses Worksheet (Form 2441)</span>
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
                <span>3. Child &amp; Daycare Care Expenses Worksheet (Form 2441)</span>
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

      {/* 4. Schedule A Itemized Deductions & Clean Energy */}
      {!isOpenItemized ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>4. Schedule A Itemized Deductions, HSA &amp; Clean Energy</span>
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
                <span>4. Schedule A Itemized Deductions, HSA &amp; Clean Energy</span>
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

      {/* 5. Other Taxes Paid (Sub-component) */}
      <ModuleOtherTaxesPaid
        documents={dedData.otherTaxesPaidDocuments}
        onUpdateDocuments={(docs) => updateModuleField('m8_deductions', 'otherTaxesPaidDocuments', docs as any)}
        selectedTaxYear={selectedTaxYear}
      />
    </div>
  );
};
