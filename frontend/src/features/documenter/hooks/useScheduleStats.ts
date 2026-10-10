import { useCallback, useEffect, useMemo, useState } from 'react';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem } from '../types/documenter.types';

export type ScheduleKind = 'CALLBACKS' | 'FOLLOW_UPS';

const PENDING_DISPOSITION: Record<ScheduleKind, string> = {
  CALLBACKS: 'CONNECTED_CALLBACK',
  FOLLOW_UPS: 'FALLBACK',
};

const lastCall = (lead: DocumenterLeadItem) => lead.lastCallLog || (lead as any).callLogs?.[0] || null;

// Still waiting: last call is still the callback / follow-up (old follow-ups may have no date)
const isStillScheduled = (lead: DocumenterLeadItem, kind: ScheduleKind) => {
  const call = lastCall(lead);
  if (call?.disposition !== PENDING_DISPOSITION[kind]) return false;
  return kind === 'FOLLOW_UPS' || Boolean(call?.callbackScheduledAt);
};

/**
 * Stat cards for Scheduled Callbacks / Follow-Ups, from my full list (not the 10-row page):
 * - Total: every lead that had one scheduled
 * - Due: still scheduled, time is later today
 * - Missed: still scheduled, time has passed
 * - Completed: a newer call was logged after the scheduled one
 */
export const useScheduleStats = (kind: ScheduleKind) => {
  const [leads, setLeads] = useState<DocumenterLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res: any = await documenterService.getLeads({ tab: kind === 'CALLBACKS' ? 'CALLBACKS' : 'FALLBACK', limit: 500 });
      setLeads(res.data?.leads || []);
    } catch {
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const now = Date.now();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let due = 0;
    let missed = 0;
    let completed = 0;
    leads.forEach((l) => {
      const call = lastCall(l);
      if (!isStillScheduled(l, kind)) {
        completed++;
        return;
      }
      if (!call?.callbackScheduledAt) return; // old follow-up without a date: pending, not due/missed
      const at = new Date(call.callbackScheduledAt).getTime();
      if (at < now) missed++;
      else if (at <= endOfToday.getTime()) due++;
    });
    return { total: leads.length, due, missed, completed };
  }, [leads, kind]);

  // Still scheduled (not yet called back). Once a newer call is logged (e.g. Interested),
  // the lead leaves this table and is only counted under "Completed"; it stays in My Leads.
  const pendingLeads = useMemo(
    () =>
      leads.filter((l) => isStillScheduled(l, kind)),
    [leads, kind]
  );

  return { stats, refresh, pendingLeads, isLoading };
};
