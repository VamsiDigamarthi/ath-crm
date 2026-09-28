import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessCogsSectionProps {
  data: Partial<OrganizerData['b3_businessExpenses']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b3_businessExpenses']>>(
    field: K,
    val: NonNullable<OrganizerData['b3_businessExpenses']>[K]
  ) => void;
  selectedTaxYear: number;
}

export const BusinessCogsSection: React.FC<BusinessCogsSectionProps> = ({
  data = {},
  onChange,
  selectedTaxYear,
}) => {
  const updateAmount = (field: keyof NonNullable<OrganizerData['b3_businessExpenses']>, val: string) => {
    const raw = parseFloat(val);
    onChange(field, (isNaN(raw) ? 0 : raw) as any);
  };

  const hasInventory = Boolean(data.hasInventory);

  const beg = Number(data.beginningInventory) || 0;
  const purchases = Number(data.inventoryPurchases) || 0;
  const labor = Number(data.directLabor) || 0;
  const other = Number(data.otherProductionCosts) || 0;
  const end = Number(data.endingInventory) || 0;
  const computedCogs = Math.max(0, beg + purchases + labor + other - end);

  return (
    <div className="space-y-4">
      <div className="max-w-xs pb-1">
        <AppSelect
          label="Maintains Physical Inventory?"
          options={[
            { label: 'No - Pure Service Business', value: 'NO' },
            { label: 'Yes - Sells Physical Goods / Inventory', value: 'YES' },
          ]}
          value={hasInventory ? 'YES' : 'NO'}
          onChange={(val) => onChange('hasInventory', val === 'YES')}
        />
      </div>

      {hasInventory && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AppInput
              label={`Beginning Inventory on 01/01/${selectedTaxYear} ($)`}
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
              value={data.beginningInventory !== undefined && data.beginningInventory !== 0 ? data.beginningInventory.toString() : ''}
              onChange={(e) => updateAmount('beginningInventory', e.target.value)}
              helperText="Cost basis of inventory on hand at year start"
            />

            <AppInput
              label="Inventory Purchases During Year ($)"
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
              value={data.inventoryPurchases !== undefined && data.inventoryPurchases !== 0 ? data.inventoryPurchases.toString() : ''}
              onChange={(e) => updateAmount('inventoryPurchases', e.target.value)}
              helperText="Wholesale merchandise or raw materials bought"
            />

            <AppInput
              label="Direct Labor ($)"
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
              value={data.directLabor !== undefined && data.directLabor !== 0 ? data.directLabor.toString() : ''}
              onChange={(e) => updateAmount('directLabor', e.target.value)}
              helperText="Wages directly spent on manufacturing / assembly"
            />

            <AppInput
              label="Other Production / Freight Costs ($)"
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
              value={data.otherProductionCosts !== undefined && data.otherProductionCosts !== 0 ? data.otherProductionCosts.toString() : ''}
              onChange={(e) => updateAmount('otherProductionCosts', e.target.value)}
              helperText="Inbound freight, warehouse packaging supplies"
            />

            <AppInput
              label={`Ending Inventory on 12/31/${selectedTaxYear} ($)`}
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
              value={data.endingInventory !== undefined && data.endingInventory !== 0 ? data.endingInventory.toString() : ''}
              onChange={(e) => updateAmount('endingInventory', e.target.value)}
              helperText="Cost basis of unsold inventory at year end"
            />

            <AppInput
              label="Computed Cost of Goods Sold (COGS) ($)"
              value={`$${computedCogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              disabled
              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
              helperText="Auto-computed: Beginning + Purchases + Labor + Other - Ending"
            />
          </div>
        </div>
      )}
    </div>
  );
};
