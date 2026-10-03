import React, { useMemo } from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppTabs } from '@/shared/components/AppTabs';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { useProducts, type ProductStatusFilter } from '../hooks/useProducts';
import { ProductFormModal } from '../components/ProductFormModal';
import { getProductColumns } from '../columns/product-columns';
import type { ProductItem } from '../types/product.types';

export const AdminProductsScreen: React.FC = () => {
  const {
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
  } = useProducts();

  const columns = useMemo(
    () => getProductColumns({ onEdit: openEdit, onToggleStatus: setStatusTarget }),
    [openEdit, setStatusTarget]
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Products & Services</h2>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} items · {stats.active} active
          </p>
        </div>
        <Button
          size="md"
          onClick={openCreate}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add item
        </Button>
      </div>

      <AppTabs
        tabs={[
          { id: 'ALL', label: 'All', count: stats.total },
          { id: 'ACTIVE', label: 'Active', count: stats.active },
          { id: 'INACTIVE', label: 'Inactive', count: stats.inactive },
        ]}
        activeTab={statusFilter}
        onChange={(id) => handleStatusFilterChange(id as ProductStatusFilter)}
        size="sm"
      />

      <UnifiedTable<ProductItem>
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchPlaceholder="Search items..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        serverPagination={{
          currentPage: page,
          totalPages,
          totalEntries: totalItems,
          pageSize: limit,
          onPageChange: setPage,
          onPageSizeChange: handleLimitChange,
        }}
        emptyContent={
          <AppEmptyState
            icon={Package}
            title={search || statusFilter !== 'ALL' ? 'No items found' : 'No items yet'}
            description={search || statusFilter !== 'ALL' ? 'Try a different search or filter.' : 'Add your first product or service item.'}
            action={search || statusFilter !== 'ALL' ? undefined : { label: 'Add item', onClick: openCreate, icon: Plus }}
          />
        }
      />

      <ProductFormModal
        isOpen={isFormOpen}
        item={editingItem}
        isSaving={isSaving}
        onClose={closeForm}
        onSubmit={saveItem}
      />

      <AppConfirmDialog
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmStatusToggle}
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate item?' : 'Activate item?'}
        description={
          statusTarget?.status === 'ACTIVE'
            ? `"${statusTarget?.name}" will no longer be available for new returns.`
            : `"${statusTarget?.name}" will be available for new returns.`
        }
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={statusTarget?.status === 'ACTIVE' ? 'danger' : 'success'}
        isLoading={isSaving}
      />
    </div>
  );
};
