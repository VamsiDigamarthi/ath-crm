import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  History,
  ArrowRight,
  UserCheck,
  PhoneCall,
  ShieldCheck,
  Search,
  GitCommit,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApplicationNotes } from '@/features/application-notes/hooks/useApplicationNotes';
import type { NoteTeam } from '@/features/application-notes/services/application-notes-service';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { Button } from '@/shared/components/Button';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { AppPagination } from '@/shared/components/AppPagination';
import { AppTabs } from '@/shared/components/AppTabs';
import type { StageHistoryItem, AuditLogItem, CallLogItem } from '@/features/documenter/types/documenter.types';

export interface TaxApplicationNotesAndAuditTabProps {
  applicationId?: string;
  taxpayerName?: string;
  customerName?: string;
  taxpayerEmail?: string;
  customerEmail?: string;
  currentStage?: string;
  taxYear?: number | string;
  stageHistories?: StageHistoryItem[];
  callLogs?: CallLogItem[];
  auditLogs?: AuditLogItem[];
  className?: string;
}

type TabView = 'NOTES' | 'AUDIT';
type AuditFilter = 'ALL' | 'STAGES' | 'ASSIGNMENTS' | 'NOTES' | 'DOCS' | 'CALLS';

interface UnifiedEvent {
  id: string;
  type: 'STAGE_CHANGE' | 'ASSIGNMENT' | 'CALL' | 'DOC' | 'AUDIT' | 'NOTE';
  title: string;
  description: string;
  fromStage?: string;
  toStage?: string;
  actorName: string;
  actorEmail?: string;
  actorRole: string;
  timestamp: string;
  disposition?: string;
  meta?: Record<string, unknown> | null;
  targetTeam?: string;
  context?: string;
}

const TEAM_OPTIONS: { value: NoteTeam; label: string }[] = [
  { value: 'ALL', label: 'Everyone on this return' },
  { value: 'DOCUMENTER', label: 'Documenter' },
  { value: 'PREPARER', label: 'Preparer' },
  { value: 'QA_REVIEWER', label: 'QA reviewer' },
];

const TEAM_LABEL: Record<string, string> = {
  ALL: 'Everyone',
  DOCUMENTER: 'Documenter',
  PREPARER: 'Preparer',
  QA_REVIEWER: 'QA reviewer',
  PREP_MANAGER: 'Prep manager',
  ADMIN: 'Admin',
};

const CONTEXT_LABEL: Record<string, string> = {
  MOVED_TO_PREP: 'Moved to tax prep',
  SUBMITTED_TO_QA: 'Submitted to QA',
  QA_REVISION: 'Revision requested',
  QA_SIGN_OFF: 'QA signed off',
};

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatFullTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getRoleBadge(role?: string): { label: string; className: string } {
  const r = (role || 'SYSTEM').toUpperCase();
  if (r.includes('CLIENT') || r.includes('TAXPAYER')) {
    return { label: 'Client', className: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  if (r.includes('PREPARER')) {
    return { label: 'Preparer', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (r.includes('REVIEWER') || r.includes('QA')) {
    return { label: 'QA Reviewer', className: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  if (r.includes('DOC')) {
    return { label: 'Documenter', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (r.includes('SALES') || r.includes('CLOSER')) {
    return { label: 'Sales Closer', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  }
  if (r.includes('FILING') || r.includes('FILE_OP')) {
    return { label: 'Filing Op', className: 'bg-teal-50 text-teal-700 border-teal-200' };
  }
  if (r.includes('ADMIN')) {
    return { label: 'Admin', className: 'bg-slate-100 text-slate-800 border-slate-300' };
  }
  return { label: role || 'System', className: 'bg-slate-100 text-slate-600 border-slate-200' };
}

export const TaxApplicationNotesAndAuditTab: React.FC<TaxApplicationNotesAndAuditTabProps> = ({
  applicationId,
  taxpayerName: propTaxpayerName,
  customerName: propCustomerName,
  taxpayerEmail: propTaxpayerEmail,
  customerEmail: propCustomerEmail,
  stageHistories = [],
  callLogs = [],
  auditLogs = [],
  className = '',
}) => {
  const taxpayerName = propTaxpayerName || propCustomerName || 'Taxpayer';
  const taxpayerEmail = propTaxpayerEmail || propCustomerEmail;
  const [activeView, setActiveView] = useState<TabView>('NOTES');
  const [auditFilter, setAuditFilter] = useState<AuditFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Team notes hook
  const { notes, isLoading: isNotesLoading, isSaving, message, setMessage, targetTeam, setTargetTeam, addNote } =
    useApplicationNotes(applicationId);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Single all-inclusive Audit Trail containing all activity (stage handoffs, assignments, calls, documents, organizer saves, and notes)
  const allAuditEvents: UnifiedEvent[] = useMemo(() => {
    const list: UnifiedEvent[] = [];

    // 1. Stage transitions & assignments from stageHistories
    stageHistories.forEach((s) => {
      if (s.fromStage === s.toStage && !s.remarks && s.fromStage !== 'RAW_PROSPECT') return;

      const remarksLower = (s.remarks || '').toLowerCase();
      const isIngestion =
        (s.fromStage === 'RAW_PROSPECT' && s.toStage === 'RAW_PROSPECT') ||
        (!s.fromStage && s.toStage === 'RAW_PROSPECT') ||
        remarksLower.includes('ingested') ||
        remarksLower.includes('bulk import') ||
        remarksLower.includes('self-signup');

      const isAssignment =
        remarksLower.includes('assigned') ||
        remarksLower.includes('round-robin') ||
        remarksLower.includes('preparer (') ||
        remarksLower.includes('reviewer (');

      const isRevert =
        remarksLower.includes('revert') ||
        remarksLower.includes('returned') ||
        remarksLower.includes('revision requested');

      let eventType: UnifiedEvent['type'] = isAssignment ? 'ASSIGNMENT' : 'STAGE_CHANGE';
      let title = s.fromStage ? `Stage: ${s.fromStage} → ${s.toStage}` : `Intake Stage: ${s.toStage}`;
      if (isIngestion) title = 'Tax Return Ingested';
      else if (isAssignment) title = `Staff Assigned: ${s.toStage || ''}`;
      else if (isRevert) title = `Workflow Reverted: ${s.toStage || ''}`;

      list.push({
        id: `stage-${s.id}`,
        type: eventType,
        title,
        description: s.remarks || `Stage updated to ${s.toStage}`,
        fromStage: s.fromStage,
        toStage: s.toStage,
        actorName: s.movedByName || 'System',
        actorEmail: s.movedByEmail || undefined,
        actorRole: s.movedByRole || 'SYSTEM',
        timestamp: s.createdAt,
      });
    });

    // 2. Call logs
    callLogs.forEach((c) => {
      list.push({
        id: `call-${c.id}`,
        type: 'CALL',
        title: `Outreach Call (${c.disposition || 'Logged'})`,
        description: c.callSummary ? `Notes: "${c.callSummary}"` : `Dialed taxpayer. Disposition: ${c.disposition}`,
        disposition: c.disposition,
        actorName: c.agentName || 'Agent',
        actorEmail: c.agentEmail || undefined,
        actorRole: c.agentRole || 'DOC_AGENT',
        timestamp: c.createdAt,
      });
    });

    // 3. System audit logs
    auditLogs.forEach((a) => {
      const details = (a.details as any) || {};
      const actionLower = (a.action || '').toLowerCase();
      const isDoc = actionLower.includes('document') || actionLower.includes('upload');
      const isOrganizer = actionLower.includes('organizer');

      let eventType: UnifiedEvent['type'] = isDoc ? 'DOC' : 'AUDIT';
      let title = a.action ? a.action.replace(/_/g, ' ') : 'System Action';

      if (isDoc) {
        title = `Document: ${details.fileName || details.categoryLabel || a.action.replace(/_/g, ' ')}`;
      } else if (isOrganizer) {
        title = 'Tax Organizer Data Saved';
      }

      list.push({
        id: `audit-${a.id}`,
        type: eventType,
        title,
        description: details.remarks || (a.moduleKey ? `Module: ${a.moduleKey}` : `Audit action logged`),
        actorName: a.actorName || (a.actorType === 'CLIENT' ? taxpayerName : 'System'),
        actorEmail: a.actorEmail || taxpayerEmail || undefined,
        actorRole: a.actorRole || a.actorType || 'SYSTEM',
        timestamp: a.createdAt,
        meta: details,
      });
    });

    // 4. Notes included in the single all-inclusive Audit Trail
    notes.forEach((n) => {
      list.push({
        id: `note-${n.id}`,
        type: 'NOTE',
        title: `Team Note (${TEAM_LABEL[n.targetTeam] || n.targetTeam})`,
        description: n.message,
        actorName: n.authorName,
        actorRole: n.authorRole,
        timestamp: n.createdAt,
        targetTeam: n.targetTeam,
        context: n.context,
      });
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [stageHistories, callLogs, auditLogs, notes, taxpayerName, taxpayerEmail]);

  // Counts by category
  const filterCounts = useMemo(() => {
    let stages = 0;
    let assignments = 0;
    let notesCount = 0;
    let docs = 0;
    let calls = 0;

    allAuditEvents.forEach((ev) => {
      if (ev.type === 'STAGE_CHANGE') stages++;
      else if (ev.type === 'ASSIGNMENT') assignments++;
      else if (ev.type === 'NOTE') notesCount++;
      else if (ev.type === 'DOC') docs++;
      else if (ev.type === 'CALL') calls++;
    });

    return { stages, assignments, notesCount, docs, calls };
  }, [allAuditEvents]);

  // Filtered audit events
  const filteredAuditEvents = useMemo(() => {
    return allAuditEvents.filter((ev) => {
      if (auditFilter === 'STAGES' && ev.type !== 'STAGE_CHANGE') return false;
      if (auditFilter === 'ASSIGNMENTS' && ev.type !== 'ASSIGNMENT') return false;
      if (auditFilter === 'NOTES' && ev.type !== 'NOTE') return false;
      if (auditFilter === 'DOCS' && ev.type !== 'DOC') return false;
      if (auditFilter === 'CALLS' && ev.type !== 'CALL') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesActor = ev.actorName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesActor) return false;
      }
      return true;
    });
  }, [allAuditEvents, auditFilter, searchQuery]);

  const totalPages = Math.ceil(filteredAuditEvents.length / itemsPerPage) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAuditEvents.slice(start, start + itemsPerPage);
  }, [filteredAuditEvents, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, auditFilter, searchQuery]);

  const getEventIcon = (type: UnifiedEvent['type']) => {
    switch (type) {
      case 'NOTE':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'STAGE_CHANGE':
        return <GitCommit className="w-3.5 h-3.5 text-blue-600" />;
      case 'ASSIGNMENT':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-600" />;
      case 'DOC':
        return <FileText className="w-3.5 h-3.5 text-teal-600" />;
      case 'CALL':
        return <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* 1. Horizontal Tab Switcher matching the exact top AppTabs style */}
      <AppTabs
        tabs={[
          { id: 'NOTES', label: 'Notes', count: notes.length },
          { id: 'AUDIT', label: 'Audit Trail', count: allAuditEvents.length },
        ]}
        activeTab={activeView}
        onChange={(tabId) => setActiveView(tabId as TabView)}
        size="sm"
      />

      {/* 2. Subview Content */}
      {activeView === 'NOTES' && (
        <div className="space-y-4">
          {/* Note Composer */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-full sm:w-60">
                <AppSelect
                  label="Share with team"
                  options={TEAM_OPTIONS}
                  value={targetTeam}
                  onChange={(v) => setTargetTeam((v || 'ALL') as NoteTeam)}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Visible to staff working on this return
              </span>
            </div>
            <AppTextarea
              value={message}
              onChange={setMessage}
              rows={3}
              maxLength={2000}
              showCount
              placeholder="Write an internal note or hand-off instruction..."
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={addNote}
                disabled={isSaving || message.trim().length < 2}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer px-4 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Posting...' : 'Post Note'}</span>
              </Button>
            </div>
          </div>

          {/* Notes List */}
          {isNotesLoading ? (
            <div className="space-y-2 py-4 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
            </div>
          ) : notes.length === 0 ? (
            <AppEmptyState
              icon={MessageSquare}
              title="No team notes yet"
              description="Use the composer above to post internal handover notes between Documenters, Preparers, and Reviewers."
            />
          ) : (
            <div className="space-y-2.5">
              {[...notes].reverse().map((n) => {
                const roleMeta = getRoleBadge(n.authorRole);
                return (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{n.authorName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta.className}`}>
                        {roleMeta.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {TEAM_LABEL[n.targetTeam] || n.targetTeam}
                      </span>
                      {CONTEXT_LABEL[n.context] && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#15803D] border border-emerald-200">
                          {CONTEXT_LABEL[n.context]}
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px] font-medium ml-auto" title={formatFullTime(n.createdAt)}>
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 mt-2 whitespace-pre-wrap leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SINGLE ALL-INCLUSIVE AUDIT TRAIL */}
      {activeView === 'AUDIT' && (
        <div className="space-y-3">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAuditFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  auditFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({allAuditEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setAuditFilter('STAGES')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  auditFilter === 'STAGES'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Stages &amp; Handoffs {filterCounts.stages > 0 ? `(${filterCounts.stages})` : ''}
              </button>
              <button
                type="button"
                onClick={() => setAuditFilter('ASSIGNMENTS')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  auditFilter === 'ASSIGNMENTS'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Assignments {filterCounts.assignments > 0 ? `(${filterCounts.assignments})` : ''}
              </button>
              <button
                type="button"
                onClick={() => setAuditFilter('NOTES')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  auditFilter === 'NOTES'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Notes {filterCounts.notesCount > 0 ? `(${filterCounts.notesCount})` : ''}
              </button>
              <button
                type="button"
                onClick={() => setAuditFilter('DOCS')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  auditFilter === 'DOCS'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Documents {filterCounts.docs > 0 ? `(${filterCounts.docs})` : ''}
              </button>
              <button
                type="button"
                onClick={() => setAuditFilter('CALLS')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  auditFilter === 'CALLS'
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Calls {filterCounts.calls > 0 ? `(${filterCounts.calls})` : ''}
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Audit Activity Stream List */}
          {filteredAuditEvents.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl bg-white">
              <History className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No activity events found</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {searchQuery ? `No events match "${searchQuery}".` : 'No activity logged yet for this return.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              {paginatedEvents.map((ev) => {
                const roleMeta = getRoleBadge(ev.actorRole);
                const isNote = ev.type === 'NOTE';
                const isExpanded = Boolean(expandedItems[ev.id]);
                const hasDetails =
                  Boolean(ev.description && ev.description.length > 80) ||
                  Boolean(ev.meta && Object.keys(ev.meta).length > 0);

                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 sm:px-4 transition-colors ${
                      isNote ? 'bg-emerald-50/20 hover:bg-emerald-50/30' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80 mt-0.5">
                        {getEventIcon(ev.type)}
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {ev.title}
                          </span>
                          {isNote && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Note
                            </span>
                          )}
                        </div>

                        <p className={`text-xs text-slate-600 mt-1 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {ev.description}
                        </p>

                        {/* Extra meta toggle */}
                        {hasDetails && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(ev.id)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 mt-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Less' : 'Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Actor & Timestamp */}
                      <div className="flex flex-col items-end shrink-0 text-right ml-2">
                        <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-[160px]">
                          {ev.actorName}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border mt-0.5 ${roleMeta.className}`}>
                          {roleMeta.label}
                        </span>
                        <span
                          className="text-[10px] text-slate-400 font-medium mt-1"
                          title={formatFullTime(ev.timestamp)}
                        >
                          {formatRelativeTime(ev.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-2">
              <AppPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredAuditEvents.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
