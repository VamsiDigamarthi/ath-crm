import { useState, useMemo, useCallback } from 'react';
import type { ParsedLeadRow } from '../types/bulk-import.types';

export type StatusFilterType = 'ALL' | 'VALID' | 'INVALID';

/**
 * Custom Hook dedicated strictly to Search Query, Status Filtering, and Row Selection.
 */
export const useLeadTableFilters = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [selectedRows, setSelectedRows] = useState<ParsedLeadRow[]>([]);

  // Filters an array of parsed lead rows based on active search & status filter
  const filterRows = useCallback((rows: ParsedLeadRow[]): ParsedLeadRow[] => {
    return rows.filter((r) => {
      // 1. Status Filter
      if (statusFilter === 'VALID' && r.validationStatus !== 'VALID') return false;
      if (statusFilter === 'INVALID' && r.validationStatus === 'VALID') return false;

      // 2. Search Query filter (matches Name, Email, Phone, SSN, City, State)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.fullName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.ssnTin.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [statusFilter, searchQuery]);

  // Reset all filter states
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSelectedRows([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedRows,
    setSelectedRows,
    filterRows,
    resetFilters,
  };
};
