import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '../services/product-service';
import type { ProductFormData, ProductItem, ProductStatus } from '../types/product.types';

export type ProductStatusFilter = ProductStatus | 'ALL';

export const useProducts = () => {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<ProductItem | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productService.list({ search: search || undefined, status: statusFilter, page, limit });
      setItems(res.data.data);
      setStats(res.data.stats);
      setTotalPages(res.data.meta.totalPages || 1);
      setTotalItems(res.data.meta.total);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: ProductStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = useCallback((item: ProductItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const saveItem = async (data: ProductFormData): Promise<boolean> => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await productService.update(editingItem.id, data);
        toast.success('Item updated');
      } else {
        await productService.create(data);
        toast.success('Item added');
      }
      closeForm();
      await fetchItems();
      return true;
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save item');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const confirmStatusToggle = async () => {
    if (!statusTarget) return;
    setIsSaving(true);
    try {
      const next: ProductStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await productService.updateStatus(statusTarget.id, next);
      toast.success(next === 'ACTIVE' ? 'Item activated' : 'Item deactivated');
      setStatusTarget(null);
      await fetchItems();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    items,
    stats,
    isLoading,
    isSaving,
    search,
    statusFilter,
    page,
    limit,
    totalPages,
    totalItems,
    isFormOpen,
    editingItem,
    statusTarget,
    setPage,
    setStatusTarget,
    handleSearchChange,
    handleStatusFilterChange,
    handleLimitChange,
    openCreate,
    openEdit,
    closeForm,
    saveItem,
    confirmStatusToggle,
    refresh: fetchItems,
  };
};
