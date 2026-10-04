import React, { useState, useEffect, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { Button } from '@/shared/components/Button';
import { useProductForm } from '../hooks/useProductForm';
import { STATUS_OPTIONS, TAX_OPTIONS, UNIT_OPTIONS } from '../types/product.types';
import type { ProductFormData, ProductItem } from '../types/product.types';

interface ProductFormModalProps {
  isOpen: boolean;
  item: ProductItem | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<boolean>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, item, isSaving, onClose, onSubmit }) => {
  const { form, submit } = useProductForm(isOpen, item, onSubmit);
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const currentUnit = String(watch('unit') || 'PER_RETURN');
  const watchedTaxRate = watch('taxRate');
  const currentTaxRate: number =
    watchedTaxRate !== undefined && watchedTaxRate !== null && !isNaN(Number(watchedTaxRate))
      ? Number(watchedTaxRate)
      : watch('taxType') === 'VAT_10'
      ? 10
      : 0;
  const currentPrice: number = Number(watch('price') || 0);

  // Unit preset vs custom
  const isKnownUnit = UNIT_OPTIONS.some((u) => u.value === currentUnit && u.value !== 'CUSTOM');
  const [isCustomUnit, setIsCustomUnit] = useState<boolean>(!isKnownUnit && Boolean(currentUnit));
  const [customUnitValue, setCustomUnitValue] = useState<string>(isKnownUnit ? '' : currentUnit);

  // Tax preset vs custom
  const matchedTaxPreset = TAX_OPTIONS.find((t) => t.rate === currentTaxRate && t.value !== 'CUSTOM');
  const [isCustomTax, setIsCustomTax] = useState<boolean>(!matchedTaxPreset && currentTaxRate > 0);
  const [customTaxValue, setCustomTaxValue] = useState<string>(!matchedTaxPreset && currentTaxRate > 0 ? String(currentTaxRate) : '');

  useEffect(() => {
    if (!isOpen) return;
    const itemUnit = item?.unit || 'PER_RETURN';
    const knownU = UNIT_OPTIONS.some((u) => u.value === itemUnit && u.value !== 'CUSTOM');
    setIsCustomUnit(!knownU && Boolean(item?.unit));
    setCustomUnitValue(knownU ? '' : itemUnit);

    const itemRate = item?.taxRate !== undefined ? item.taxRate : (item?.taxType === 'VAT_10' ? 10 : 0);
    const knownT = TAX_OPTIONS.find((t) => t.rate === itemRate && t.value !== 'CUSTOM');
    setIsCustomTax(!knownT && itemRate > 0);
    setCustomTaxValue(!knownT && itemRate > 0 ? String(itemRate) : '');
  }, [isOpen, item]);

  const set = (field: keyof ProductFormData, value: any) =>
    setValue(field, value as never, { shouldValidate: form.formState.isSubmitted, shouldDirty: true });

  const handleUnitSelect = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomUnit(true);
      if (customUnitValue) set('unit', customUnitValue);
    } else {
      setIsCustomUnit(false);
      set('unit', val);
    }
  };

  const handleCustomUnitChange = (val: string) => {
    setCustomUnitValue(val);
    set('unit', val);
  };

  const handleTaxSelect = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomTax(true);
      const rate = parseFloat(customTaxValue) || 0;
      set('taxRate', rate);
      set('taxType', rate === 0 ? 'NO_TAX' : rate === 10 ? 'VAT_10' : 'CUSTOM');
    } else {
      setIsCustomTax(false);
      const rate = parseFloat(val) || 0;
      set('taxRate', rate);
      set('taxType', rate === 0 ? 'NO_TAX' : rate === 10 ? 'VAT_10' : 'CUSTOM');
    }
  };

  const handleCustomTaxChange = (val: string) => {
    setCustomTaxValue(val);
    const rate = parseFloat(val) || 0;
    set('taxRate', rate);
    set('taxType', rate === 0 ? 'NO_TAX' : rate === 10 ? 'VAT_10' : 'CUSTOM');
  };

  // Live calculation of tax and final effective price
  const calculation = useMemo(() => {
    const base = isNaN(currentPrice) || currentPrice < 0 ? 0 : currentPrice;
    const rate = isNaN(currentTaxRate) || currentTaxRate < 0 ? 0 : currentTaxRate;
    const taxAmount = Math.round(base * (rate / 100) * 100) / 100;
    const total = Math.round((base + taxAmount) * 100) / 100;
    return {
      base,
      rate,
      taxAmount,
      total,
    };
  }, [currentPrice, currentTaxRate]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit item' : 'Add item'}
      description={item ? 'Changes apply to new returns only.' : 'Add a service item preparers can use on returns.'}
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={isSaving}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
          >
            {isSaving ? 'Saving...' : item ? 'Save changes' : 'Add item'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4" noValidate>
        <AppInput
          label="Item name"
          required
          placeholder="e.g. Federal return (Form 1040)"
          maxLength={100}
          value={watch('name')}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name?.message}
        />

        <AppTextarea
          label="Description"
          placeholder="Optional"
          rows={2}
          maxLength={500}
          showCount
          value={watch('description') || ''}
          onChange={(v) => set('description', v)}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            label="Base Price ($)"
            required
            type="number"
            step="0.01"
            placeholder="0.00"
            value={watch('price') === undefined || watch('price') === null ? '' : String(watch('price'))}
            onChange={(e) => set('price', e.target.value)}
            error={errors.price?.message}
          />
          <div>
            <AppSelect
              label="Unit"
              options={UNIT_OPTIONS}
              value={isCustomUnit ? 'CUSTOM' : currentUnit}
              onChange={handleUnitSelect}
              error={errors.unit?.message}
            />
            {isCustomUnit && (
              <div className="mt-2 animate-in fade-in duration-150">
                <AppInput
                  label="Custom Unit"
                  placeholder="e.g. Per page, Per filing..."
                  maxLength={50}
                  value={customUnitValue}
                  onChange={(e) => handleCustomUnitChange(e.target.value)}
                  error={errors.unit?.message}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <AppSelect
              label="Tax Rate"
              options={TAX_OPTIONS}
              value={isCustomTax ? 'CUSTOM' : matchedTaxPreset ? matchedTaxPreset.value : 'CUSTOM'}
              onChange={handleTaxSelect}
              error={errors.taxType?.message}
            />
            {isCustomTax && (
              <div className="mt-2 animate-in fade-in duration-150">
                <AppInput
                  label="Custom Tax Percentage (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g. 8.25"
                  value={customTaxValue}
                  onChange={(e) => handleCustomTaxChange(e.target.value)}
                />
              </div>
            )}
          </div>
          <AppSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={watch('status')}
            onChange={(v) => set('status', v)}
            error={errors.status?.message}
          />
        </div>

        {/* Live Tax Calculation Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 font-sans">
          <div className="font-semibold text-slate-700 flex items-center justify-between">
            <span>Price &amp; Tax Calculation Breakdown</span>
            <span className="text-[11px] font-normal text-slate-500">Live preview</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80">
            <div>
              <span className="text-slate-500 block">Base Price:</span>
              <span className="font-medium text-slate-900">${calculation.base.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tax ({calculation.rate}%):</span>
              <span className={`font-medium ${calculation.taxAmount > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                +${calculation.taxAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold text-slate-800">Total with Tax:</span>
              <span className="font-bold text-[#16A34A]">${calculation.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </AppModal>
  );
};
