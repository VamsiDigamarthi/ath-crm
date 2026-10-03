export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type ProductTaxType = 'NO_TAX' | 'VAT_10';
export type ProductUnit = 'PER_RETURN' | 'PER_FORM' | 'PER_STATE' | 'PER_HOUR' | 'PER_ITEM' | 'FIXED';

export interface ProductItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: ProductUnit;
  taxType: ProductTaxType;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  unit: ProductUnit;
  taxType: ProductTaxType;
  status: ProductStatus;
}

export interface ProductListResponse {
  data: ProductItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  stats: { total: number; active: number; inactive: number };
}

export const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'PER_RETURN', label: 'Per return' },
  { value: 'PER_FORM', label: 'Per form' },
  { value: 'PER_STATE', label: 'Per state' },
  { value: 'PER_HOUR', label: 'Per hour' },
  { value: 'PER_ITEM', label: 'Per item' },
  { value: 'FIXED', label: 'Fixed' },
];

export const TAX_OPTIONS: { value: ProductTaxType; label: string }[] = [
  { value: 'NO_TAX', label: 'No tax' },
  { value: 'VAT_10', label: 'VAT 10%' },
];

export const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export const unitLabel = (unit: string) => UNIT_OPTIONS.find((u) => u.value === unit)?.label || unit;
export const taxLabel = (tax: string) => TAX_OPTIONS.find((t) => t.value === tax)?.label || tax;
