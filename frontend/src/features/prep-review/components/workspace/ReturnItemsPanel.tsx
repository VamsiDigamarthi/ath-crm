import React from 'react';
import { Plus, Minus, Trash2, Package, RotateCcw } from 'lucide-react';
import { AppSelect } from '@/shared/components/AppSelect';
import { Button } from '@/shared/components/Button';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { taxLabel, unitLabel } from '@/features/products/types/product.types';
import { useReturnItems } from '../../hooks/useReturnItems';

interface ReturnItemsPanelProps {
  applicationId?: string;
  readOnly?: boolean;
}

const money = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inlineInput =
  'h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] disabled:bg-slate-50 disabled:text-slate-500';

export const ReturnItemsPanel: React.FC<ReturnItemsPanelProps> = ({ applicationId, readOnly = false }) => {
  const {
    items,
    totals,
    canEditPrice,
    productOptions,
    isLoading,
    isBusy,
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    addItem,
    changeField,
    stepQuantity,
    resetPrice,
    itemToRemove,
    setItemToRemove,
    confirmRemove,
  } = useReturnItems(applicationId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Services & pricing</h3>
          <p className="text-sm text-slate-500 mt-0.5">Items billed on this return. Catalog prices are not changed.</p>
        </div>
        {!readOnly && !canEditPrice && (
          <span className="text-xs text-slate-400 sm:text-right">Price editing is off for you · ask an admin to enable it</span>
        )}
      </div>

      {!readOnly && (
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <AppSelect
              label="Item"
              searchable
              options={productOptions}
              value={selectedProductId}
              onChange={setSelectedProductId}
              placeholder={productOptions.length ? 'Select a product or service' : 'No active items in catalog'}
              disabled={isBusy || productOptions.length === 0}
            />
          </div>
          <div className="w-full sm:w-24">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Qty</label>
            <input
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`${inlineInput} w-full h-10`}
              disabled={isBusy}
            />
          </div>
          <Button
            size="md"
            onClick={addItem}
            disabled={isBusy || !selectedProductId}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="p-5 space-y-2 animate-pulse">
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      ) : items.length === 0 ? (
        <AppEmptyState
          icon={Package}
          title="No items yet"
          description={readOnly ? 'No services were added to this return.' : 'Pick a product or service above to add it to this return.'}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left font-medium px-5 py-2.5">Item</th>
                <th className="text-left font-medium px-3 py-2.5">Unit</th>
                <th className="text-right font-medium px-3 py-2.5 w-32">Qty</th>
                <th className="text-right font-medium px-3 py-2.5 w-36">Unit price</th>
                <th className="text-left font-medium px-3 py-2.5">Tax</th>
                <th className="text-right font-medium px-3 py-2.5">Amount</th>
                {!readOnly && <th className="w-12" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3 min-w-[200px]">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    {item.description && <div className="text-xs text-slate-500 truncate max-w-[280px]">{item.description}</div>}
                  </td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{unitLabel(item.unit)}</td>
                  <td className="px-3 py-3 text-right">
                    {readOnly ? (
                      item.quantity
                    ) : (
                      <div className="inline-flex items-center rounded-md border border-slate-300 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => stepQuantity(item.id, -1)}
                          disabled={isBusy || item.quantity <= 1}
                          className="w-7 h-8 text-slate-600 hover:bg-slate-100 disabled:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
                          title="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5 mx-auto" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.quantityInput}
                          disabled={isBusy}
                          onChange={(e) => changeField(item.id, 'quantity', e.target.value.replace(/[^\d]/g, ''))}
                          className={`w-12 h-8 text-center text-sm text-slate-900 border-x border-slate-300 focus:outline-none ${
                            item.quantityInvalid ? 'bg-rose-50 text-rose-700' : ''
                          }`}
                          title={item.quantityInvalid ? 'Enter 1 to 999' : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => stepQuantity(item.id, 1)}
                          disabled={isBusy || item.quantity >= 999}
                          className="w-7 h-8 text-slate-600 hover:bg-slate-100 disabled:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    {!readOnly && canEditPrice ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.priceInput}
                          disabled={isBusy}
                          onChange={(e) => changeField(item.id, 'unitPrice', e.target.value.replace(/[^\d.]/g, ''))}
                          className={`${inlineInput} w-24 ${item.priceInvalid ? 'border-rose-400 bg-rose-50 text-rose-700' : ''}`}
                          title={item.priceInvalid ? 'Enter a valid price (max 2 decimals)' : undefined}
                        />
                        {item.isPriceOverridden && (
                          <button
                            type="button"
                            onClick={() => resetPrice(item.id)}
                            disabled={isBusy}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                            title={`Reset to catalog price ${money(item.catalogPrice)}`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-900">{money(item.unitPrice)}</span>
                    )}
                    {item.isPriceOverridden && (
                      <div className="text-xs text-slate-400 line-through">{money(item.catalogPrice)}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{taxLabel(item.taxType)}</td>
                  <td className="px-3 py-3 text-right font-medium text-slate-900 whitespace-nowrap">{money(item.amount)}</td>
                  {!readOnly && (
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setItemToRemove(item.id)}
                        disabled={isBusy}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-slate-100 px-5 py-4 flex justify-end">
            <dl className="w-full sm:w-72 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd>{money(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Tax</dt>
                <dd>{money(totals.tax)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>{money(totals.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <AppConfirmDialog
        isOpen={Boolean(itemToRemove)}
        onClose={() => setItemToRemove(null)}
        onConfirm={confirmRemove}
        title="Remove item?"
        description="This item will be removed from this return."
        confirmLabel="Remove"
        variant="danger"
        isLoading={isBusy}
      />
    </div>
  );
};
