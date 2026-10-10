import { useCallback, useEffect, useMemo, useState } from 'react';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem } from '../types/documenter.types';

export type ScheduleKind = 'CALLBACKS' | 'FOLLOW_UPS';

const PENDING_DISPOSITION: Record<ScheduleKind, string> = {
  CALLBACKS: 'CONNECTED_CALLBACK',
  FOLLOW_UPS: 'FALLBACK',
};

const lastCall = (lead: DocumenterLeadItem) => lead.lastCallLog || (lead as any).callLogs?.[0] || null;

/**
 * Stat cards for Scheduled Callbacks / Follow-Ups, from my full list (not the 10-row page):
 * - Total: every lead that had one scheduled
 * - Due: still scheduled, time is later today
 * - Missed: still scheduled, time has passed
 * - Completed: a newer call was logged after the scheduled one
 */
export const useScheduleStats = (kind: ScheduleKind) => {
  const [leads, setLeads] = useState<DocumenterLeadItem[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res: any = await documenterService.getLeads({ tab: kind === 'CALLBACKS' ? 'CALLBACKS' : 'FALLBACK', limit: 500 });
      setLeads(res.data?.leads || []);
    } catch {
      setLeads([]);
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
      const isStillScheduled = call?.disposition === PENDING_DISPOSITION[kind] && call?.callbackScheduledAt;
      if (!isStillScheduled) {
        completed++;
        return;
      }
      const at = new Date(call.callbackScheduledAt).getTime();
      if (at < now) missed++;
      else if (at <= endOfToday.getTime()) due++;
    });
    return { total: leads.length, due, missed, completed };
  }, [leads, kind]);

  return { stats, refresh };
};
