import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '@/features/products/services/product-service';
import type { ProductItem } from '@/features/products/types/product.types';
import { returnItemsService, type ReturnItem, type ReturnItemsResponse } from '../services/return-items-service';

const EMPTY: ReturnItemsResponse = {
  items: [],
  totals: { subtotal: 0, tax: 0, total: 0, count: 0 },
  canEditPrice: false,
};

const TAX_RATES: Record<string, number> = { NO_TAX: 0, VAT_10: 0.1 };
const SAVE_DELAY_MS = 700;

type DraftField = 'quantity' | 'unitPrice';
type Drafts = Record<string, Partial<Record<DraftField, string>>>;

const parseQuantity = (v: string) => {
  if (!/^\d+$/.test(v.trim())) return null;
  const n = parseInt(v, 10);
  return n >= 1 && n <= 999 ? n : null;
};

const parsePrice = (v: string) => {
  if (!/^\d+(\.\d{1,2})?$/.test(v.trim())) return null;
  const n = Number(v);
  return n >= 0 && n <= 1000000 ? n : null;
};

export interface ReturnItemView extends ReturnItem {
  quantityInput: string;
  priceInput: string;
  quantityInvalid: boolean;
  priceInvalid: boolean;
}

export const useReturnItems = (applicationId?: string) => {
  const [data, setData] = useState<ReturnItemsResponse>(EMPTY);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Drafts>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const dataRef = useRef<ReturnItemsResponse>(EMPTY);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const load = useCallback(async () => {
    if (!applicationId) return;
    try {
      const [itemsRes, productsRes] = await Promise.all([
        returnItemsService.list(applicationId),
        productService.listActive(),
      ]);
      setData(itemsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: `${p.name} — $${p.price.toFixed(2)}` })),
    [products]
  );

  const items: ReturnItemView[] = useMemo(
    () =>
      data.items.map((item) => {
        const draft = drafts[item.id] || {};
        const quantityInput = draft.quantity ?? String(item.quantity);
        const priceInput = draft.unitPrice ?? String(item.unitPrice);
        const qty = parseQuantity(quantityInput);
        const price = parsePrice(priceInput);
        const effectiveQty = qty ?? item.quantity;
        const effectivePrice = price ?? item.unitPrice;
        const amountCents = Math.round(effectivePrice * 100) * effectiveQty;
        const itemTaxRate = Number(item.taxRate ?? (TAX_RATES[item.taxType] ? TAX_RATES[item.taxType] * 100 : 0));
        const taxCents = Math.round(amountCents * (itemTaxRate / 100));
        return {
          ...item,
          quantity: effectiveQty,
          unitPrice: effectivePrice,
          taxRate: itemTaxRate,
          isPriceOverridden: Math.round(effectivePrice * 100) !== Math.round(item.catalogPrice * 100),
          amount: amountCents / 100,
          tax: taxCents / 100,
          total: (amountCents + taxCents) / 100,
          quantityInput,
          priceInput,
          quantityInvalid: qty === null,
          priceInvalid: price === null,
        };
      }),
    [data.items, drafts]
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Math.round(i.amount * 100), 0);
    const tax = items.reduce((s, i) => s + Math.round(i.tax * 100), 0);
    return { subtotal: subtotal / 100, tax: tax / 100, total: (subtotal + tax) / 100, count: items.length };
  }, [items]);

  const applyServerData = (next: ReturnItemsResponse, savedItemId?: string, savedFields?: DraftField[]) => {
    setData(next);
    if (savedItemId && savedFields) {
      setDrafts((prev) => {
        const current = { ...(prev[savedItemId] || {}) };
        savedFields.forEach((f) => delete current[f]);
        const rest = { ...prev };
        if (Object.keys(current).length) rest[savedItemId] = current;
        else delete rest[savedItemId];
        return rest;
      });
    }
  };

  const saveField = async (itemId: string, field: DraftField, raw: string) => {
    if (!applicationId) return;
    const latest = dataRef.current;
    const server = latest.items.find((i) => i.id === itemId);
    if (!server) return;
    const value = field === 'quantity' ? parseQuantity(raw) : parsePrice(raw);
    if (value === null) return;
    if ((field === 'quantity' && value === server.quantity) || (field === 'unitPrice' && value === server.unitPrice)) {
      applyServerData(latest, itemId, [field]);
      return;
    }
    try {
      const res = await returnItemsService.update(applicationId, itemId, { [field]: value });
      applyServerData(res.data, itemId, [field]);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save change');
      applyServerData(dataRef.current, itemId, [field]);
    }
  };

  const changeField = (itemId: string, field: DraftField, value: string) => {
    setDrafts((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [field]: value } }));
    const timerKey = `${itemId}:${field}`;
    clearTimeout(timers.current[timerKey]);
    timers.current[timerKey] = setTimeout(() => saveField(itemId, field, value), SAVE_DELAY_MS);
  };

  const stepQuantity = (itemId: string, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const next = Math.min(999, Math.max(1, item.quantity + delta));
    if (next !== item.quantity) changeField(itemId, 'quantity', String(next));
  };

  const run = async (action: () => Promise<{ data: ReturnItemsResponse }>, successMessage?: string) => {
    if (!applicationId) return false;
    setIsBusy(true);
    try {
      const res = await action();
      setData(res.data);
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error((err as Error).message || 'Something went wrong');
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const addItem = async () => {
    const qty = parseQuantity(quantity);
    if (!selectedProductId) {
      toast.error('Select an item to add');
      return;
    }
    if (qty === null) {
      toast.error('Quantity must be between 1 and 999');
      return;
    }
    const ok = await run(() => returnItemsService.add(applicationId!, selectedProductId, qty), 'Item added');
    if (ok) {
      setSelectedProductId('');
      setQuantity('1');
    }
  };

  const resetPrice = (itemId: string) => {
    const server = data.items.find((i) => i.id === itemId);
    if (server) changeField(itemId, 'unitPrice', String(server.catalogPrice));
  };

  const confirmRemove = async () => {
    if (!itemToRemove) return;
    clearTimeout(timers.current[`${itemToRemove}:quantity`]);
    clearTimeout(timers.current[`${itemToRemove}:unitPrice`]);
    const ok = await run(() => returnItemsService.remove(applicationId!, itemToRemove), 'Item removed');
    if (ok) {
      setDrafts((prev) => {
        const rest = { ...prev };
        delete rest[itemToRemove];
        return rest;
      });
      setItemToRemove(null);
    }
  };

  return {
    items,
    totals,
    canEditPrice: data.canEditPrice,
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
  };
};
