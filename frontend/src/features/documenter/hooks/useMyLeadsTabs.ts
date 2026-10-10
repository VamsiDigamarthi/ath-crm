import { useMemo, useState } from 'react';
import type { DocumenterLeadItem } from '../types/documenter.types';

export type MyLeadsTab = 'ALL' | 'NOT_CONNECTED' | 'INTERESTED' | 'CALLBACK' | 'FOLLOW_UP' | 'INVALID';

const lastDisposition = (lead: DocumenterLeadItem): string | null =>
  (lead.lastCallLog || (lead as any).callLogs?.[0])?.disposition ?? null;

/**
 * Quick filters for the documenter's My Leads page, based on the latest call.
 * Not interested / Not qualified leads leave My Leads (they become dropped), so they have no tab here.
 */
const TAB_RULES: Record<Exclude<MyLeadsTab, 'ALL'>, (d: string | null) => boolean> = {
  NOT_CONNECTED: (d) => !d || d === 'NO_ANSWER_VOICEMAIL', // never called, or no answer / voicemail
  INTERESTED: (d) => d === 'CONNECTED_INTERESTED',
  CALLBACK: (d) => d === 'CONNECTED_CALLBACK', // busy, asked to call back later
  FOLLOW_UP: (d) => d === 'FALLBACK',
  INVALID: (d) => d === 'INVALID_DISCONNECTED', // wrong / disconnected number
};

const TAB_LABELS: Record<MyLeadsTab, string> = {
  ALL: 'All',
  NOT_CONNECTED: 'Not connected',
  INTERESTED: 'Interested',
  CALLBACK: 'Call back later',
  FOLLOW_UP: 'Follow-up',
  INVALID: 'Invalid number',
};

const matchesTab = (lead: DocumenterLeadItem, tab: MyLeadsTab) =>
  tab === 'ALL' ? true : TAB_RULES[tab](lastDisposition(lead));

export const useMyLeadsTabs = (leads: DocumenterLeadItem[]) => {
  const [activeTab, setActiveTab] = useState<MyLeadsTab>('ALL');

  const tabs = useMemo(
    () =>
      (Object.keys(TAB_LABELS) as MyLeadsTab[]).map((id) => ({
        id,
        label: TAB_LABELS[id],
        count: leads.filter((l) => matchesTab(l, id)).length,
      })),
    [leads]
  );

  const visibleLeads = useMemo(() => leads.filter((l) => matchesTab(l, activeTab)), [leads, activeTab]);

  return { activeTab, setActiveTab, tabs, visibleLeads };
};
