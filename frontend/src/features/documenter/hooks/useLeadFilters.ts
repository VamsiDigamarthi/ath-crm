import { useMemo, useState } from 'react';
import type { FilterCategory } from '@/shared/components/AppFilterFlyout';
import { SYSTEM_PRIORITIES, SYSTEM_VISA_TYPES } from '@/shared/constants/system-enums';
import type { DocumenterLeadItem } from '../types/documenter.types';

// Full lists (not just values present in the current rows)
const FILTER_CATEGORIES: FilterCategory[] = [
  { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
  { id: 'visa', label: 'Visa Type', options: SYSTEM_VISA_TYPES.map((v) => ({ label: v.label, value: v.value })) },
];

/** Priority + Visa type filter for documenter tables (use with AppFilterFlyout) */
export const useLeadFilters = (leads: DocumenterLeadItem[]) => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const filteredLeads = useMemo(() => {
    const pr = filters.priority || [];
    const vi = filters.visa || [];
    return leads.filter(
      (l) =>
        (pr.length === 0 || pr.includes(l.priority || 'NO_PRIORITY')) &&
        (vi.length === 0 || vi.includes(l.customer?.visaType || ''))
    );
  }, [leads, filters]);

  return { filters, setFilters, filterCategories: FILTER_CATEGORIES, filteredLeads };
};
