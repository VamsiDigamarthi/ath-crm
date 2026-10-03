import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem, DocumenterTaxYearSummary } from '../types/documenter.types';

const NOT_YET_IN_PREP = ['RAW_PROSPECT', 'DOC_OUTREACH'];

export const useTaxpayerYears = (applicationId?: string) => {
  const [lead, setLead] = useState<DocumenterLeadItem | null>(null);
  const [years, setYears] = useState<DocumenterTaxYearSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!applicationId) return;
    try {
      const res = await documenterService.getLeadDetails(applicationId);
      setLead(res.data);
      const list = res.data.availableApplications?.length
        ? res.data.availableApplications
        : [
            {
              id: res.data.id,
              taxYear: res.data.taxYear,
              filingType: res.data.filingType,
              currentStage: res.data.currentStage,
            },
          ];
      setYears(
        list
          .filter((y) => !NOT_YET_IN_PREP.includes(y.currentStage))
          .sort((a, b) => b.taxYear - a.taxYear)
      );
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load tax years');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  return { lead, years, isLoading };
};
