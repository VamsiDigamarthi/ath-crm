import React from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { type Business1099IncomeItem } from '../../../services/customer-api';

interface Business1099IncomeSectionProps {
  items?: Business1099IncomeItem[];
  onChange: (items: Business1099IncomeItem[]) => void;
  errors?: Record<string, string>;
}

export const Business1099IncomeSection: React.FC<Business1099IncomeSectionProps> = ({
  items = [],
  onChange,
  errors = {},
}) => {
  const handleAddItem = () => {
    const newItem: Business1099IncomeItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clientName: '',
      clientEin: '',
      clientAddress: '',
      grossAmount: 0,
      fedTaxWithheld: 0,
      stateTaxWithheld: 0,
      note: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleUpdateItem = <K extends keyof Business1099IncomeItem>(
    index: number,
    field: K,
    val: Business1099IncomeItem[K]
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex justify-end pb-1">
        <button
          type="button"
          onClick={handleAddItem}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Client / Payer</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
          <p className="text-xs text-slate-700 font-semibold">No 1099 payers or client income recorded</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
            Click "Add Client / Payer" to add details from your 1099-NEC forms, client invoices, or merchant statements.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-md border border-slate-200 bg-white shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  {item.clientName || `Client / Payer #${idx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <AppInput
                    label="Client / Payer Business Name *"
                    placeholder="e.g. Acme Corporation / Stripe Inc."
                    error={errors[`client_${idx}_name`]}
                    value={item.clientName || ''}
                    onChange={(e) => handleUpdateItem(idx, 'clientName', e.target.value)}
                  />
                </div>

                <AppInput
                  label="Payer Federal EIN / TIN"
                  placeholder="XX-XXXXXXX"
                  value={item.clientEin || ''}
                  onChange={(e) => handleUpdateItem(idx, 'clientEin', e.target.value)}
                />

                <AppInput
                  label="Total Gross Amount ($) *"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  error={errors[`client_${idx}_amount`]}
                  value={item.grossAmount !== undefined && item.grossAmount !== 0 ? item.grossAmount.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdateItem(idx, 'grossAmount', isNaN(raw) ? 0 : raw);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-1">
                  <AppInput
                    label="Payer Address (City, State)"
                    placeholder="e.g. New York, NY"
                    value={item.clientAddress || ''}
                    onChange={(e) => handleUpdateItem(idx, 'clientAddress', e.target.value)}
                  />
                </div>

                <AppInput
                  label="Federal Tax Withheld ($) (Box 4)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={item.fedTaxWithheld !== undefined && item.fedTaxWithheld !== 0 ? item.fedTaxWithheld.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdateItem(idx, 'fedTaxWithheld', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Leave 0 if none withheld"
                />

                <AppInput
                  label="State Tax Withheld ($) (Box 5)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={item.stateTaxWithheld !== undefined && item.stateTaxWithheld !== 0 ? item.stateTaxWithheld.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdateItem(idx, 'stateTaxWithheld', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Leave 0 if none withheld"
                />
              </div>

              {/* Note / Comments Textarea */}
              <div className="pt-1">
                <AppTextarea
                  label="Note / Comments"
                  placeholder="If you have received 1099 from the vendor, please mention notes here and upload the form in Documents..."
                  value={item.note || ''}
                  onChange={(val) => handleUpdateItem(idx, 'note', val)}
                  hint="If you have received 1099 from the vendor, please send/upload it in the Upload Documents tab."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
