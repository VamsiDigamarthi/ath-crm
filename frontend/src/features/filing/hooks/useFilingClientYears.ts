import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { filingService } from '../services/filing-service';
import type { FilingLeadItem } from '../types/filing.types';

export interface FilingYearRow {
  id: string;
  taxYear: number;
  filingType: string;
  currentStage: string;
  assignedTo: string;
}

/** Tax years of one client in the filing pipeline (from the queue's allApplications) */
export const useFilingClientYears = (customerId: string | undefined) => {
  const [client, setClient] = useState<FilingLeadItem | null>(null);
  const [years, setYears] = useState<FilingYearRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!customerId) return;
    try {
      const res = await filingService.getQueue({ limit: 100 });
      const lead = (res.leads || []).find((l) => l.customerId === customerId) || null;
      setClient(lead);
      const apps = lead?.allApplications?.length
        ? lead.allApplications
        : lead
        ? [{ id: lead.id, taxYear: lead.taxYear, filingType: lead.filingType, currentStage: lead.currentStage, assignedFileOp: null }]
        : [];
      setYears(
        [...apps]
          .sort((a, b) => b.taxYear - a.taxYear)
          .map((a) => ({
            id: a.id,
            taxYear: a.taxYear,
            filingType: a.filingType || 'INDIVIDUAL',
            currentStage: a.currentStage,
            assignedTo: a.assignedFileOp
              ? `${a.assignedFileOp.firstName || ''} ${a.assignedFileOp.lastName || ''}`.trim() || a.assignedFileOp.email || '—'
              : 'Unassigned',
          }))
      );
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load tax years');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  return { client, years, isLoading };
};
