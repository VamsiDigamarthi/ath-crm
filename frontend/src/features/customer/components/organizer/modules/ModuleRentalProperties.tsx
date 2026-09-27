import React from 'react';
import { Plus, Trash2, Home, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleRentalPropertiesProps {
  rentalList: NonNullable<OrganizerData['m3_presence']['rentalProperties']>;
  onUpdateRentals: (newList: NonNullable<OrganizerData['m3_presence']['rentalProperties']>) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleRentalProperties: React.FC<ModuleRentalPropertiesProps> = ({
  rentalList = [],
  onUpdateRentals,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const [activeRentalTab, setActiveRentalTab] = React.useState<number>(0);

  const calculateTotalExpenses = (prop: NonNullable<OrganizerData['m3_presence']['rentalProperties']>[number]) => {
    return (
      (prop.mortgageInterest || 0) +
      (prop.propertyTaxes || 0) +
      (prop.insurance || 0) +
      (prop.repairs || 0) +
      (prop.hoaFees || 0) +
      (prop.managementFees || 0) +
      (prop.utilities || 0) +
      (prop.advertising || 0) +
      (prop.cleaning || 0) +
      (prop.legalFees || 0) +
      (prop.otherExpenses || 0)
    );
  };

  const handleFieldChange = (idx: number, field: string, value: any) => {
    const list = [...rentalList];
    const item = { ...list[idx], [field]: value };
    
    // Auto-update total rentalExpenses when any breakdown field changes (if breakdown sum > 0)
    const breakdownSum = calculateTotalExpenses(item);
    if (breakdownSum > 0 && field !== 'rentalExpenses') {
      item.rentalExpenses = breakdownSum;
    }
    
    list[idx] = item;
    onUpdateRentals(list);
    if (clearError) {
      clearError(`rental_${idx}_${field}`);
    }
  };

  const handleAddProperty = () => {
    const newProp: NonNullable<OrganizerData['m3_presence']['rentalProperties']>[number] = {
      propertyType: 'RESIDENTIAL',
      address: '',
      monthsRented2025: 12,
      personalMonths2025: 0,
      ownership: 'TAXPAYER',
      purchaseDate: '',
      rentedDate: '',
      costOfProperty: 0,
      totalRentalIncome: 0,
      otherRentalIncome: 0,
      rentalExpenses: 0,
      mortgageInterest: 0,
      propertyTaxes: 0,
      insurance: 0,
      repairs: 0,
      hoaFees: 0,
      managementFees: 0,
      utilities: 0,
      advertising: 0,
      cleaning: 0,
      legalFees: 0,
      otherExpenses: 0,
      otherExpensesDesc: '',
    };
    const updated = [...rentalList, newProp];
    onUpdateRentals(updated);
    setActiveRentalTab(updated.length - 1);
  };

  const handleRemoveProperty = (idx: number) => {
    const updated = rentalList.filter((_, i) => i !== idx);
    onUpdateRentals(updated);
    if (activeRentalTab >= updated.length) {
      setActiveRentalTab(Math.max(0, updated.length - 1));
    }
  };

  if (rentalList.length === 0) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-xs text-slate-500">
          No rental properties added for TY {selectedTaxYear}. Click below to report rental income and itemized rental expenses.
        </p>
        <Button
          size="sm"
          type="button"
          onClick={handleAddProperty}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3.5 py-1.5 rounded-md inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Rental Property</span>
        </Button>
      </div>
    );
  }

  const currentProp = rentalList[activeRentalTab] || rentalList[0];
  const grossIncome = (currentProp.totalRentalIncome || 0) + (currentProp.otherRentalIncome || 0);
  const totalExp = currentProp.rentalExpenses || calculateTotalExpenses(currentProp);
  const netIncomeLoss = grossIncome - totalExp;

  return (
    <div className="space-y-4 font-sans">
      {/* Top Action / Property Tabs Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {rentalList.map((prop, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveRentalTab(idx)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                activeRentalTab === idx
                  ? 'bg-emerald-50 text-[#16A34A] border border-emerald-300 font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Property #{idx + 1}</span>
              {prop.address && (
                <span className="max-w-[120px] truncate text-[11px] opacity-75 font-normal">
                  ({prop.address.split(',')[0]})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="button"
            onClick={handleAddProperty}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Property</span>
          </Button>

          {rentalList.length > 0 && (
            <button
              type="button"
              onClick={() => handleRemoveProperty(activeRentalTab)}
              className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Property</span>
            </button>
          )}
        </div>
      </div>

      {/* Property Form Section */}
      <div className="space-y-4 pt-1">
        {/* 1. Property Details */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-gray-700 tracking-tight flex items-center gap-1">
            <span>Property Information</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <AppInput
                label="Property Location / Full Street Address *"
                placeholder="e.g. 1024 Grand Pkwy, Katy, TX 77494"
                leftIcon={<Building2 className="w-4 h-4" />}
                error={errors[`rental_${activeRentalTab}_address`]}
                value={currentProp.address || ''}
                onChange={(e) => handleFieldChange(activeRentalTab, 'address', e.target.value)}
              />
            </div>

            <AppSelect
              label="Property Type *"
              options={[
                { label: 'Single Family Residence', value: 'RESIDENTIAL' },
                { label: 'Multi-Family Residence', value: 'MULTI_FAMILY' },
                { label: 'Condo / Townhouse', value: 'CONDO' },
                { label: 'Commercial / Office', value: 'COMMERCIAL' },
                { label: 'Land / Other', value: 'LAND' },
              ]}
              value={currentProp.propertyType || 'RESIDENTIAL'}
              onChange={(val) => handleFieldChange(activeRentalTab, 'propertyType', val || 'RESIDENTIAL')}
            />

            <AppSelect
              label="Ownership *"
              options={[
                { label: 'Primary Taxpayer (100%)', value: 'TAXPAYER' },
                { label: 'Spouse (100%)', value: 'SPOUSE' },
                { label: 'Joint Ownership (50/50)', value: 'JOINT' },
              ]}
              value={currentProp.ownership || 'TAXPAYER'}
              onChange={(val) => handleFieldChange(activeRentalTab, 'ownership', val || 'TAXPAYER')}
            />

            <AppInput
              label={`Months Rented in ${selectedTaxYear} (0-12) *`}
              type="number"
              placeholder="12"
              value={currentProp.monthsRented2025 !== undefined ? currentProp.monthsRented2025.toString() : '12'}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                handleFieldChange(activeRentalTab, 'monthsRented2025', isNaN(val) ? 0 : Math.min(12, Math.max(0, val)));
              }}
            />

            <AppInput
              label={`Personal Use Days / Months in ${selectedTaxYear}`}
              type="number"
              placeholder="0"
              value={currentProp.personalMonths2025 !== undefined ? currentProp.personalMonths2025.toString() : '0'}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                handleFieldChange(activeRentalTab, 'personalMonths2025', isNaN(val) ? 0 : Math.min(12, Math.max(0, val)));
              }}
            />

            <AppDatePicker
              label="Property Purchase Date"
              placeholder="MM/DD/YYYY"
              format="MM/dd/yyyy"
              accentColor="#16A34A"
              error={errors[`rental_${activeRentalTab}_purchaseDate`]}
              value={parseUsDate(currentProp.purchaseDate)}
              onChange={(dateVal) => handleFieldChange(activeRentalTab, 'purchaseDate', formatUsDate(dateVal))}
            />

            <AppDatePicker
              label="Date Placed in Service / First Rented"
              placeholder="MM/DD/YYYY"
              format="MM/dd/yyyy"
              accentColor="#16A34A"
              error={errors[`rental_${activeRentalTab}_rentedDate`]}
              value={parseUsDate(currentProp.rentedDate)}
              onChange={(dateVal) => handleFieldChange(activeRentalTab, 'rentedDate', formatUsDate(dateVal))}
            />

            <AppInput
              label="Purchase Price / Cost Basis ($)"
              type="number"
              placeholder="e.g. 350000"
              value={currentProp.costOfProperty ? currentProp.costOfProperty.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'costOfProperty', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* 2. Rental Income (Schedule E Line 3) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h5 className="text-xs font-semibold text-gray-700 tracking-tight flex items-center justify-between">
            <span>Rental Income (Schedule E, Line 3)</span>
            <span className="text-[11px] text-emerald-700 font-normal">
              Gross Rent: ${(currentProp.totalRentalIncome || 0).toLocaleString()}
            </span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AppInput
              label="Total Gross Rental Income Received ($) *"
              type="number"
              placeholder="e.g. 28000"
              error={errors[`rental_${activeRentalTab}_totalRentalIncome`] || errors[`rental_${activeRentalTab}_income`]}
              value={currentProp.totalRentalIncome ? currentProp.totalRentalIncome.toString() : ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleFieldChange(activeRentalTab, 'totalRentalIncome', isNaN(val) ? 0 : val);
              }}
            />

            <AppInput
              label="Other Rental Income / Refunds / 1099-MISC ($)"
              type="number"
              placeholder="e.g. 0"
              value={currentProp.otherRentalIncome ? currentProp.otherRentalIncome.toString() : ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleFieldChange(activeRentalTab, 'otherRentalIncome', isNaN(val) ? 0 : val);
              }}
            />
          </div>
        </div>

        {/* 3. Rental Expenses Breakdown (Schedule E Lines 5-19) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h5 className="text-xs font-semibold text-gray-700 tracking-tight">
              Rental Expenses Breakdown (Schedule E, Lines 5–19)
            </h5>
            <span className="text-[11px] text-slate-500 font-normal">
              Itemize eligible expenses incurred to maintain and operate the rental property
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <AppInput
              label="Mortgage Interest to Banks ($)"
              type="number"
              placeholder="e.g. 8200"
              value={currentProp.mortgageInterest ? currentProp.mortgageInterest.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'mortgageInterest', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Real Estate / Property Taxes ($)"
              type="number"
              placeholder="e.g. 4500"
              value={currentProp.propertyTaxes ? currentProp.propertyTaxes.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'propertyTaxes', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Hazard / Property Insurance ($)"
              type="number"
              placeholder="e.g. 1400"
              value={currentProp.insurance ? currentProp.insurance.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'insurance', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Repairs & Maintenance ($)"
              type="number"
              placeholder="e.g. 1800"
              value={currentProp.repairs ? currentProp.repairs.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'repairs', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="HOA Dues / Condo Fees ($)"
              type="number"
              placeholder="e.g. 600"
              value={currentProp.hoaFees ? currentProp.hoaFees.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'hoaFees', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Property Management Fees ($)"
              type="number"
              placeholder="e.g. 2400"
              value={currentProp.managementFees ? currentProp.managementFees.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'managementFees', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Utilities (Water, Power, Trash) ($)"
              type="number"
              placeholder="e.g. 350"
              value={currentProp.utilities ? currentProp.utilities.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'utilities', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Advertising & Marketing ($)"
              type="number"
              placeholder="e.g. 120"
              value={currentProp.advertising ? currentProp.advertising.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'advertising', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Cleaning & Janitorial ($)"
              type="number"
              placeholder="e.g. 250"
              value={currentProp.cleaning ? currentProp.cleaning.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'cleaning', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Legal & Professional / CPA ($)"
              type="number"
              placeholder="e.g. 300"
              value={currentProp.legalFees ? currentProp.legalFees.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'legalFees', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Other Rental Expenses ($)"
              type="number"
              placeholder="e.g. 150"
              value={currentProp.otherExpenses ? currentProp.otherExpenses.toString() : ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'otherExpenses', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label="Other Expenses Description"
              placeholder="e.g. Pest control, lawn mowing"
              value={currentProp.otherExpensesDesc || ''}
              onChange={(e) => handleFieldChange(activeRentalTab, 'otherExpensesDesc', e.target.value)}
            />
          </div>

          {/* Direct Total Rental Expenses override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <AppInput
              label="Total Rental Expenses Incurred ($) *"
              type="number"
              placeholder="Total expenses (auto-summed or entered)"
              value={currentProp.rentalExpenses ? currentProp.rentalExpenses.toString() : ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleFieldChange(activeRentalTab, 'rentalExpenses', isNaN(val) ? 0 : val);
              }}
            />

            {/* Net Income / Loss Summary Card */}
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Schedule E Net Result:</span>
                <span className={`text-xs font-semibold ${netIncomeLoss >= 0 ? 'text-[#16A34A]' : 'text-amber-700'}`}>
                  {netIncomeLoss >= 0
                    ? `+$${netIncomeLoss.toLocaleString()} Net Rental Profit`
                    : `-$${Math.abs(netIncomeLoss).toLocaleString()} Net Rental Loss`}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                Gross: ${grossIncome.toLocaleString()} | Exp: ${totalExp.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
