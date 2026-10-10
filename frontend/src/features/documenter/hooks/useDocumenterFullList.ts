import { useCallback, useEffect, useState } from 'react';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem, DocumenterTab } from '../types/documenter.types';

/** All my leads for one tab (not just the first 10-row page), for tables with cards & filters */
export const useDocumenterFullList = (tab: DocumenterTab) => {
  const [leads, setLeads] = useState<DocumenterLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res: any = await documenterService.getLeads({ tab, limit: 500 });
      setLeads(res.data?.leads || []);
    } catch {
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leads, isLoading, refresh };
};
