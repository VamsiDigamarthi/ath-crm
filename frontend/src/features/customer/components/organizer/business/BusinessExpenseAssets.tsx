import React from 'react';
import { Plus, Trash2, DollarSign, Percent } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type BusinessAssetItem } from '../../../services/customer-api';

interface BusinessExpenseAssetsProps {
  hasAssets?: boolean;
  onToggleHasAssets: (val: boolean) => void;
  assets?: BusinessAssetItem[];
  onChangeAssets: (assets: BusinessAssetItem[]) => void;
  errors?: Record<string, string>;
}

export const BusinessExpenseAssets: React.FC<BusinessExpenseAssetsProps> = ({
  hasAssets = false,
  onToggleHasAssets,
  assets = [],
  onChangeAssets,
  errors = {},
}) => {
  const handleAddAsset = () => {
    const newAsset: BusinessAssetItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      description: '',
      dateAcquired: '',
      costBasis: 0,
      businessUsePercentage: 100,
      isNewProperty: 'NEW',
      section179Requested: 'YES',
      soldDuringYear: 'NO',
      salePrice: 0,
      saleDate: '',
    };
    onChangeAssets([...assets, newAsset]);
  };

  const handleRemoveAsset = (index: number) => {
    const updated = assets.filter((_, idx) => idx !== index);
    onChangeAssets(updated);
  };

  const handleUpdateAsset = <K extends keyof BusinessAssetItem>(
    index: number,
    field: K,
    val: BusinessAssetItem[K]
  ) => {
    const updated = [...assets];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChangeAssets(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="w-full sm:w-64">
          <AppSelect
            label="Purchased Equipment / Assets?"
            options={[
              { label: 'No - No Asset Purchases', value: 'NO' },
              { label: 'Yes - Report Asset Purchases', value: 'YES' },
            ]}
            value={hasAssets ? 'YES' : 'NO'}
            onChange={(val) => {
              const active = val === 'YES';
              onToggleHasAssets(active);
              if (active && assets.length === 0) {
                handleAddAsset();
              }
            }}
          />
        </div>

        {hasAssets && (
          <button
            type="button"
            onClick={handleAddAsset}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs self-end sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      {hasAssets && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {assets.map((asset, idx) => (
            <div
              key={asset.id || idx}
              className="p-4 rounded-md border border-slate-200 bg-white shadow-2xs space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  Asset #{idx + 1}: {asset.description || 'Unnamed Asset'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAsset(idx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Row 1: Description, Date Acquired, Cost Basis, Business Use % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <AppInput
                    label="Asset Description *"
                    placeholder="e.g. Computer / Phone / iPad / Laptop / Printer / Machinery"
                    error={errors[`asset_${idx}_desc`]}
                    value={asset.description || ''}
                    onChange={(e) => handleUpdateAsset(idx, 'description', e.target.value)}
                    helperText="Please mention the description of the equipment purchased for company purpose."
                  />
                </div>

                <AppDatePicker
                  label="Date Acquired / Placed in Service *"
                  placeholder="MM/DD/YYYY"
                  format="MM/dd/yyyy"
                  accentColor="#16A34A"
                  maxDate={new Date()}
                  value={parseUsDate(asset.dateAcquired)}
                  onChange={(dVal) => handleUpdateAsset(idx, 'dateAcquired', formatUsDate(dVal))}
                />

                <AppInput
                  label="Total Cost Basis ($) *"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={asset.costBasis !== undefined && asset.costBasis !== 0 ? asset.costBasis.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdateAsset(idx, 'costBasis', isNaN(raw) ? 0 : raw);
                  }}
                />
              </div>

              {/* Row 2: Business Use %, Condition, Sec 179, Sold, Carryover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <AppInput
                  label="Business Use % *"
                  type="number"
                  placeholder="100"
                  leftIcon={<Percent className="w-3.5 h-3.5" />}
                  value={asset.businessUsePercentage !== undefined ? asset.businessUsePercentage.toString() : '100'}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdateAsset(idx, 'businessUsePercentage', isNaN(raw) ? 100 : Math.min(100, Math.max(0, raw)));
                  }}
                  helperText="Must be >50% for Sec 179"
                />

                <AppSelect
                  label="New or Used Property?"
                  options={[
                    { label: 'New Property', value: 'NEW' },
                    { label: 'Used Property', value: 'USED' },
                  ]}
                  value={asset.isNewProperty || 'NEW'}
                  onChange={(val) => handleUpdateAsset(idx, 'isNewProperty', (val || 'NEW') as any)}
                />

                <AppSelect
                  label="Elect Section 179 Full Write-Off?"
                  options={[
                    { label: 'Yes - 100% Expense Deduction Now', value: 'YES' },
                    { label: 'No - Depreciate over MACRS Life', value: 'NO' },
                  ]}
                  value={asset.section179Requested || 'YES'}
                  onChange={(val) => handleUpdateAsset(idx, 'section179Requested', (val || 'YES') as any)}
                />

                <AppInput
                  label="Prior Carryover Depreciation ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={asset.carryoverDepreciation !== undefined && asset.carryoverDepreciation !== 0 ? asset.carryoverDepreciation.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdateAsset(idx, 'carryoverDepreciation', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Unallowed prior year depreciation"
                />

                <AppSelect
                  label="Sold / Disposed During Year?"
                  options={[
                    { label: 'No - Still in Business Service', value: 'NO' },
                    { label: 'Yes - Sold or Disposed', value: 'YES' },
                  ]}
                  value={asset.soldDuringYear || 'NO'}
                  onChange={(val) => handleUpdateAsset(idx, 'soldDuringYear', (val || 'NO') as any)}
                />
              </div>

              {asset.soldDuringYear === 'YES' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-md bg-amber-50/40 border border-amber-200">
                  <AppInput
                    label="Gross Sales Price / Salvage Recovered ($)"
                    type="number"
                    placeholder="0.00"
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    value={asset.salePrice !== undefined && asset.salePrice !== 0 ? asset.salePrice.toString() : ''}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      handleUpdateAsset(idx, 'salePrice', isNaN(raw) ? 0 : raw);
                    }}
                    helperText="If yes, mention the sale price. It may become taxable."
                  />

                  <AppDatePicker
                    label="Date Sold / Retired"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    maxDate={new Date()}
                    value={parseUsDate(asset.saleDate)}
                    onChange={(dVal) => handleUpdateAsset(idx, 'saleDate', formatUsDate(dVal))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
