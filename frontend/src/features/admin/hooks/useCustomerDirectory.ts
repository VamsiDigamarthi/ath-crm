import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService } from '../services/admin-service';
import type { AdminCustomerItem, AdminCustomerResponse } from '../types/customer-directory.types';
import type { SelectOption } from '@/shared/components/AppSelect';
import toast from 'react-hot-toast';

export function useCustomerDirectory() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<AdminCustomerResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('ALL');
  const [selectedFilingStatus, setSelectedFilingStatus] = useState<'ALL' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS'>('ALL');
  const [page, setPage] = useState<number>(1);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerItem | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers({
        search: searchQuery || undefined,
        taxYear: selectedTaxYear !== 'ALL' ? Number(selectedTaxYear) : undefined,
        filingStatus: selectedFilingStatus !== 'ALL' ? selectedFilingStatus : undefined,
        page,
        limit: 10,
      });

      if (res?.data) {
        setData(res.data);
      }
    } catch {
      toast.error('Failed to load customer directory');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTaxYear, selectedFilingStatus, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleYearChange = useCallback((yearVal: string) => {
    setSelectedTaxYear(yearVal);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: 'ALL' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS') => {
    setSelectedFilingStatus(status);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const stats = useMemo(() => {
    return data?.stats || {
      totalCustomers: 0,
      totalConverted: 0,
      totalAccepted: 0,
      totalRejected: 0,
      totalInProgress: 0,
      totalFeesCollected: 0,
    };
  }, [data]);

  const taxYearOptions: SelectOption[] = useMemo(() => {
    const rawYears = data?.availableTaxYears || [2026, 2025, 2024];
    return [
      { label: 'All Tax Years', value: 'ALL' },
      ...rawYears.map((yr) => ({
        label: `Tax Year ${yr}`,
        value: String(yr),
      })),
    ];
  }, [data?.availableTaxYears]);

  return {
    loading,
    data,
    stats,
    searchQuery,
    selectedTaxYear,
    selectedFilingStatus,
    page,
    selectedCustomer,
    taxYearOptions,
    setSelectedCustomer,
    handleSearchChange,
    handleYearChange,
    handleStatusChange,
    handlePageChange,
    fetchCustomers,
  };
}
