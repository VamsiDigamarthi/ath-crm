import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';

type StaffList = Awaited<ReturnType<typeof prepReviewService.getStaffMembers>>;

export const usePrepClientYears = (taxpayerId?: string) => {
  const [years, setYears] = useState<PrepReviewLead[]>([]);
  const [staff, setStaff] = useState<StaffList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignLeads, setAssignLeads] = useState<PrepReviewLead[] | null>(null);
  const [inspectLead, setInspectLead] = useState<PrepReviewLead | null>(null);

  const load = useCallback(async () => {
    if (!taxpayerId) return;
    try {
      const [leadsRes, staffRes] = await Promise.all([
        prepReviewService.getPipelineLeads({ tab: 'ALL' }),
        prepReviewService.getStaffMembers(),
      ]);
      setYears(
        leadsRes.leads
          .filter((l: PrepReviewLead) => l.taxpayerId === taxpayerId)
          .sort((a: PrepReviewLead, b: PrepReviewLead) => b.taxYear - a.taxYear)
      );
      setStaff(staffRes);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load tax years');
    } finally {
      setIsLoading(false);
    }
  }, [taxpayerId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    years,
    client: years[0] || null,
    staff,
    isLoading,
    assignLeads,
    setAssignLeads,
    inspectLead,
    setInspectLead,
    refresh: load,
  };
};
