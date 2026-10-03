import React from 'react';
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
  const set = (field: keyof ProductFormData, value: string) =>
    setValue(field, value as never, { shouldValidate: form.formState.isSubmitted, shouldDirty: true });

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
          rows={3}
          maxLength={500}
          showCount
          value={watch('description') || ''}
          onChange={(v) => set('description', v)}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            label="Price ($)"
            required
            type="number"
            placeholder="0.00"
            value={watch('price') === undefined || watch('price') === null ? '' : String(watch('price'))}
            onChange={(e) => set('price', e.target.value)}
            error={errors.price?.message}
          />
          <AppSelect
            label="Unit"
            options={UNIT_OPTIONS}
            value={watch('unit')}
            onChange={(v) => set('unit', v)}
            error={errors.unit?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppSelect
            label="Tax"
            options={TAX_OPTIONS}
            value={watch('taxType')}
            onChange={(v) => set('taxType', v)}
            error={errors.taxType?.message}
          />
          <AppSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={watch('status')}
            onChange={(v) => set('status', v)}
            error={errors.status?.message}
          />
        </div>
      </form>
    </AppModal>
  );
};
