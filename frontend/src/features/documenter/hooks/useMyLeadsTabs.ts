import { useCallback, useEffect, useMemo, useState } from 'react';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem } from '../types/documenter.types';

export type MyLeadsTab = 'ASSIGNED' | 'PENDING' | 'VOICEMAIL' | 'CALLBACKS' | 'FOLLOW_UPS' | 'NOT_INTERESTED' | 'INVALID';

const DAY_MS = 24 * 60 * 60 * 1000;

const lastCall = (lead: DocumenterLeadItem) => lead.lastCallLog || (lead as any).callLogs?.[0] || null;

/**
 * Client's My Leads tabs (counts on each):
 * - ASSIGNED: every lead assigned to me
 * - PENDING: assigned more than a day ago and still not called
 * - VOICEMAIL: last call was no answer / voicemail
 * - CALLBACKS: callback date picked (busy / call back later)
 * - FOLLOW_UPS: follow-up with a date picked
 * - NOT_INTERESTED: marked not interested (these leave the active list, so they are loaded separately)
 * - INVALID: last call was invalid / disconnected number; agent can return it to admin from here
 */
const RULES: Record<Exclude<MyLeadsTab, 'ASSIGNED' | 'NOT_INTERESTED'>, (l: DocumenterLeadItem) => boolean> = {
  PENDING: (l) => !lastCall(l) && Date.now() - new Date((l as any).assignedAt || l.createdAt).getTime() > DAY_MS,
  VOICEMAIL: (l) => lastCall(l)?.disposition === 'NO_ANSWER_VOICEMAIL',
  CALLBACKS: (l) => lastCall(l)?.disposition === 'CONNECTED_CALLBACK' && Boolean(lastCall(l)?.callbackScheduledAt),
  FOLLOW_UPS: (l) => lastCall(l)?.disposition === 'FALLBACK',
  INVALID: (l) => lastCall(l)?.disposition === 'INVALID_DISCONNECTED',
};

const LABELS: Record<MyLeadsTab, string> = {
  ASSIGNED: 'Assigned leads',
  PENDING: 'Pending',
  VOICEMAIL: 'Voicemail',
  CALLBACKS: 'Callbacks',
  FOLLOW_UPS: 'Follow-ups',
  NOT_INTERESTED: 'Not interested',
  INVALID: 'Invalid',
};

export const useMyLeadsTabs = () => {
  const [activeTab, setActiveTab] = useState<MyLeadsTab>('ASSIGNED');
  const [activeLeads, setActiveLeads] = useState<DocumenterLeadItem[]>([]);
  const [notInterested, setNotInterested] = useState<DocumenterLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Full lists (not the 10-row page) so every tab count is right
  const refresh = useCallback(async () => {
    try {
      const [active, dropped] = await Promise.all([
        documenterService.getLeads({ tab: 'OUTREACH', limit: 500 }),
        documenterService.getLeads({ tab: 'NOT_INTERESTED', limit: 500 }),
      ]);
      setActiveLeads((active as any).data?.leads || []);
      setNotInterested(
        ((dropped as any).data?.leads || []).filter(
          (l: DocumenterLeadItem) => lastCall(l)?.disposition === 'CONNECTED_NOT_INTERESTED'
        )
      );
    } catch {
      setActiveLeads([]);
      setNotInterested([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const listFor = useCallback(
    (tab: MyLeadsTab) =>
      tab === 'ASSIGNED' ? activeLeads : tab === 'NOT_INTERESTED' ? notInterested : activeLeads.filter(RULES[tab]),
    [activeLeads, notInterested]
  );

  const tabs = useMemo(
    () => (Object.keys(LABELS) as MyLeadsTab[]).map((id) => ({ id, label: LABELS[id], count: listFor(id).length })),
    [listFor]
  );

  const visibleLeads = useMemo(() => listFor(activeTab), [listFor, activeTab]);

  return { activeTab, setActiveTab, tabs, visibleLeads, isLoading, refresh };
};
