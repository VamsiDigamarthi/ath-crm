import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type BusinessHomeOffice } from '../../../services/customer-api';

interface BusinessExpenseHomeProps {
  hasHomeOffice?: boolean;
  onToggleHasHomeOffice: (val: boolean) => void;
  homeOffice?: BusinessHomeOffice;
  onChangeHomeOffice: (data: BusinessHomeOffice) => void;
}

export const BusinessExpenseHome: React.FC<BusinessExpenseHomeProps> = ({
  hasHomeOffice = false,
  onToggleHasHomeOffice,
  homeOffice = {},
  onChangeHomeOffice,
}) => {
  const h = homeOffice || {};

  const handleUpdate = <K extends keyof BusinessHomeOffice>(
    field: K,
    val: BusinessHomeOffice[K]
  ) => {
    onChangeHomeOffice({
      ...h,
      [field]: val,
    });
  };

  const updateAmount = (field: keyof BusinessHomeOffice, val: string) => {
    const raw = parseFloat(val);
    handleUpdate(field, (isNaN(raw) ? 0 : raw) as any);
  };

  const officeSqFt = Number(h.officeSquareFootage) || 0;
  const totalSqFt = Number(h.totalHomeSquareFootage) || 0;
  const businessPercentage = totalSqFt > 0 ? ((officeSqFt / totalSqFt) * 100).toFixed(1) : '0';

  const simplifiedDeduction = Math.min(300, officeSqFt) * 5;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="w-full sm:w-64">
          <AppSelect
            label="Claim Home Office Deduction?"
            options={[
              { label: 'No - Dedicated Commercial Facility', value: 'NO' },
              { label: 'Yes - Dedicated Home Office', value: 'YES' },
            ]}
            value={hasHomeOffice ? 'YES' : 'NO'}
            onChange={(val) => {
              const active = val === 'YES';
              onToggleHasHomeOffice(active);
              if (active && !h.calculationMethod) {
                handleUpdate('calculationMethod', 'SIMPLIFIED');
              }
            }}
          />
        </div>
      </div>

      {hasHomeOffice && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Row 1: Square Footage & Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AppInput
              label="Area Used Exclusively for Business (Sq Ft) *"
              type="number"
              placeholder="250"
              value={h.officeSquareFootage !== undefined && h.officeSquareFootage !== 0 ? h.officeSquareFootage.toString() : ''}
              onChange={(e) => updateAmount('officeSquareFootage', e.target.value)}
              helperText="Dedicated office area only"
            />

            <AppInput
              label="Total Square Footage of Entire Home *"
              type="number"
              placeholder="2500"
              value={h.totalHomeSquareFootage !== undefined && h.totalHomeSquareFootage !== 0 ? h.totalHomeSquareFootage.toString() : ''}
              onChange={(e) => updateAmount('totalHomeSquareFootage', e.target.value)}
              helperText="Total finished living area"
            />

            <AppInput
              label="Business Use %"
              value={`${businessPercentage}%`}
              disabled
              helperText="Auto-computed ratio for indirect expenses"
            />
          </div>

          {/* Row 2: Method Selection & Personal Tax Return Question */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AppSelect
              label="Calculation Method *"
              options={[
                { label: 'Simplified Method ($5/sq ft up to 300 sq ft - No receipts needed)', value: 'SIMPLIFIED' },
                { label: 'Actual Expenses Method (Rent, mortgage, utilities & maintenance)', value: 'ACTUAL' },
              ]}
              value={h.calculationMethod || 'SIMPLIFIED'}
              onChange={(val) => handleUpdate('calculationMethod', (val || 'SIMPLIFIED') as any)}
            />

            <AppSelect
              label="Claimed on Personal Tax Return?"
              options={[
                { label: 'No - Not Claimed Personally', value: 'NO' },
                { label: 'Yes - Claimed on Personal Return', value: 'YES' },
              ]}
              value={h.personalTaxClaimed || 'NO'}
              onChange={(val) => handleUpdate('personalTaxClaimed', (val || 'NO') as any)}
            />

            {h.calculationMethod === 'SIMPLIFIED' && (
              <AppInput
                label="Standard Simplified Deduction ($)"
                value={`$${simplifiedDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                disabled
                helperText={`${Math.min(300, officeSqFt)} sq ft × $5.00/sq ft (IRS standard rate)`}
              />
            )}
          </div>

          {/* Actual Expenses Breakdown */}
          {h.calculationMethod === 'ACTUAL' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AppInput
                  label="Rent Paid on House ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.rentPaid !== undefined && h.rentPaid !== 0 ? h.rentPaid.toString() : ''}
                  onChange={(e) => updateAmount('rentPaid', e.target.value)}
                  helperText="If the house used for business is rented, please enter total rent paid."
                />

                <AppInput
                  label="Mortgage Interest Paid on House ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.mortgageInterest !== undefined && h.mortgageInterest !== 0 ? h.mortgageInterest.toString() : ''}
                  onChange={(e) => updateAmount('mortgageInterest', e.target.value)}
                  helperText="Loan interest paid on house (Form 1098)."
                />

                <AppInput
                  label="Real Estate Taxes Paid on House ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.realEstateTaxes !== undefined && h.realEstateTaxes !== 0 ? h.realEstateTaxes.toString() : ''}
                  onChange={(e) => updateAmount('realEstateTaxes', e.target.value)}
                  helperText="Property tax paid on the house."
                />

                <AppInput
                  label="Homeowners / Renters Insurance ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.homeownersInsurance !== undefined && h.homeownersInsurance !== 0 ? h.homeownersInsurance.toString() : ''}
                  onChange={(e) => updateAmount('homeownersInsurance', e.target.value)}
                  helperText="Insurance paid on the house."
                />

                <AppInput
                  label="Home Utilities ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.utilities !== undefined && h.utilities !== 0 ? h.utilities.toString() : ''}
                  onChange={(e) => updateAmount('utilities', e.target.value)}
                  helperText="Water charges, electricity, heating gas, waste disposal, etc."
                />

                <AppInput
                  label="Home Internet Service ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.internet !== undefined && h.internet !== 0 ? h.internet.toString() : ''}
                  onChange={(e) => updateAmount('internet', e.target.value)}
                />

                <AppInput
                  label="General Home Maintenance &amp; Repairs ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.maintenanceRepairs !== undefined && h.maintenanceRepairs !== 0 ? h.maintenanceRepairs.toString() : ''}
                  onChange={(e) => updateAmount('maintenanceRepairs', e.target.value)}
                  helperText="Roof, HVAC, plumbing (allocated by %)"
                />

                <AppInput
                  label="Direct Office Repairs &amp; Painting ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={h.directRepairs !== undefined && h.directRepairs !== 0 ? h.directRepairs.toString() : ''}
                  onChange={(e) => updateAmount('directRepairs', e.target.value)}
                  helperText="100% deductible (office room only)"
                />
              </div>

              {/* If Home Owned - Depreciation Basis */}
              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppInput
                    label="Original Purchase Price of Home ($)"
                    type="number"
                    placeholder="0.00"
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    value={h.homeCostBasis !== undefined && h.homeCostBasis !== 0 ? h.homeCostBasis.toString() : ''}
                    onChange={(e) => updateAmount('homeCostBasis', e.target.value)}
                  />

                  <AppInput
                    label="Value of Land Portion ($)"
                    type="number"
                    placeholder="0.00"
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    value={h.landValue !== undefined && h.landValue !== 0 ? h.landValue.toString() : ''}
                    onChange={(e) => updateAmount('landValue', e.target.value)}
                    helperText="Land is non-depreciable"
                  />

                  <AppDatePicker
                    label="Date Home Placed in Business Use"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    maxDate={new Date()}
                    value={parseUsDate(h.datePlacedInUse)}
                    onChange={(dVal) => handleUpdate('datePlacedInUse', formatUsDate(dVal))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
