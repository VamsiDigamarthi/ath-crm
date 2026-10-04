export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type ProductTaxType = 'NO_TAX' | 'VAT_10' | 'CUSTOM' | string;
export type ProductUnit = 'PER_RETURN' | 'PER_FORM' | 'PER_STATE' | 'PER_HOUR' | 'PER_ITEM' | 'FIXED' | string;

export interface ProductItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  taxRate?: number;
  taxType: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  unit: string;
  taxRate?: number;
  taxType: string;
  status: ProductStatus;
}

export interface ProductListResponse {
  data: ProductItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  stats: { total: number; active: number; inactive: number };
}

export const UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: 'PER_RETURN', label: 'Per return' },
  { value: 'PER_FORM', label: 'Per form' },
  { value: 'PER_STATE', label: 'Per state' },
  { value: 'PER_HOUR', label: 'Per hour' },
  { value: 'PER_ITEM', label: 'Per item' },
  { value: 'FIXED', label: 'Fixed' },
  { value: 'PER_MONTH', label: 'Per month' },
  { value: 'PER_YEAR', label: 'Per year' },
  { value: 'CUSTOM', label: 'Custom unit...' },
];

export const TAX_OPTIONS: { value: string; label: string; rate?: number }[] = [
  { value: '0', label: 'No tax (0%)', rate: 0 },
  { value: '5', label: '5%', rate: 5 },
  { value: '7', label: '7%', rate: 7 },
  { value: '8', label: '8%', rate: 8 },
  { value: '8.25', label: '8.25%', rate: 8.25 },
  { value: '10', label: 'VAT 10%', rate: 10 },
  { value: '12', label: '12%', rate: 12 },
  { value: '15', label: '15%', rate: 15 },
  { value: '18', label: '18%', rate: 18 },
  { value: '20', label: '20%', rate: 20 },
  { value: 'CUSTOM', label: 'Custom percentage...', rate: -1 },
];

export const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export const unitLabel = (unit: string) => {
  const match = UNIT_OPTIONS.find((u) => u.value === unit || u.label.toLowerCase() === unit.toLowerCase());
  return match?.label || unit;
};

export const taxLabel = (tax: string, taxRate?: number) => {
  if (taxRate !== undefined && taxRate !== null) {
    if (taxRate === 0) return 'No tax';
    if (taxRate === 10) return 'VAT 10%';
    return `${taxRate}% tax`;
  }
  if (tax === 'NO_TAX' || tax === '0') return 'No tax';
  if (tax === 'VAT_10' || tax === '10') return 'VAT 10%';
  if (!isNaN(Number(tax))) return `${tax}% tax`;
  return tax;
};
