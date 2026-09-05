import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, 
  ArrowRight, 
  UserCheck, 
  PhoneCall, 
  ShieldCheck, 
  Clock, 
  Search, 
  GitCommit,
  UploadCloud,
  RotateCcw
} from 'lucide-react';
import { AppPagination } from '@/shared/components/AppPagination';
import type { StageHistoryItem, AuditLogItem, CallLogItem } from '../types/documenter.types';

export interface LeadAuditTrailSectionProps {
  stageHistories?: StageHistoryItem[];
  auditLogs?: AuditLogItem[];
  callLogs?: CallLogItem[];
  leadId?: string;
  taxpayerName: string;
  currentStage?: string;
}

type TimelineFilter = 'ALL' | 'STAGES' | 'CALLS' | 'AUDIT';

interface UnifiedTimelineEvent {
  id: string;
  type: 'STAGE_CHANGE' | 'CALL' | 'AUDIT' | 'ASSIGNMENT' | 'INGESTION';
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
}

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
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function formatFullDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export const LeadAuditTrailSection: React.FC<LeadAuditTrailSectionProps> = ({
  stageHistories = [],
  auditLogs = [],
  callLogs = [],
  taxpayerName,
  currentStage,
}) => {
  const [filter, setFilter] = useState<TimelineFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset pagination to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  // Unify and enrich all audit sources into a single chronologically sorted stream (No Duplicates)
  const unifiedEvents: UnifiedTimelineEvent[] = useMemo(() => {
    const events: UnifiedTimelineEvent[] = [];

    // 1. Stage History Transitions (Primary source of truth for Lifecycle & Ingestion/Assignment)
    stageHistories.forEach((s) => {
      // Only skip true no-ops with no remarks
      if (s.fromStage === s.toStage && !s.remarks && s.fromStage !== 'RAW_PROSPECT') {
        return;
      }

      const isIngestion = (s.fromStage === 'RAW_PROSPECT' && s.toStage === 'RAW_PROSPECT') || 
                          s.remarks?.toLowerCase().includes('ingested') ||
                          s.remarks?.toLowerCase().includes('bulk ingestion') ||
                          s.remarks?.toLowerCase().includes('bulk upload');

      const isPrepAssignment = s.remarks?.toLowerCase().includes('tax preparer') || 
                               s.remarks?.toLowerCase().includes('qa reviewer') ||
                               s.remarks?.toLowerCase().includes('preparer (');

      const isDocAssignment = (s.remarks?.toLowerCase().includes('directly assigned') || 
                               s.remarks?.toLowerCase().includes('calling agent')) && !isPrepAssignment;

      const isAutoRoundRobin = s.remarks?.toLowerCase().includes('auto round-robin') || 
                               s.remarks?.toLowerCase().includes('auto-distributed') ||
                               s.remarks?.toLowerCase().includes('round-robin');

      const isSalesAssignment = (s.remarks?.toLowerCase().includes('sales closer') ||
                                 s.remarks?.toLowerCase().includes('sales agent') ||
                                 s.remarks?.toLowerCase().includes('closer (') ||
                                 (s.fromStage === 'SALES_PITCH_QUEUE' && s.toStage === 'SALES_PITCHING')) && !isAutoRoundRobin;

      const isFilingDispatch = s.remarks?.toLowerCase().includes('filing transmission') ||
                               s.remarks?.toLowerCase().includes('dispatched to irs') ||
                               (s.fromStage === 'SALES_PITCHING' && s.toStage === 'FILING_QUEUE');

      const isPaymentCollected = s.remarks?.toLowerCase().includes('service fee payment') ||
                                 s.remarks?.toLowerCase().includes('payment of $') ||
                                 s.remarks?.toLowerCase().includes('fee payment');

      const isForm8879Signed = s.remarks?.toLowerCase().includes('form 8879') ||
                               s.remarks?.toLowerCase().includes('form 8878') ||
                               s.remarks?.toLowerCase().includes('8879 authorization') ||
                               s.remarks?.toLowerCase().includes('8878 authorization');

      const isSubmitQA = s.remarks?.toLowerCase().includes('submitted for 4-eyes') || 
                         s.remarks?.toLowerCase().includes('form 1040 computation completed');

      const isQASignOff = s.remarks?.toLowerCase().includes('qa approved') || 
                          s.remarks?.toLowerCase().includes('compliance sign-off') ||
                          s.remarks?.toLowerCase().includes('signed off');

      const isQARevision = s.remarks?.toLowerCase().includes('revision requested') || 
                           s.remarks?.toLowerCase().includes('correction needed');

      const isWorkflowRevert = s.remarks?.includes('[Workflow Revert:') || 
                               s.remarks?.includes('[Reverted to Documenter]') || 
                               s.remarks?.toLowerCase().includes('workflow revert');

      let displayFromStage = s.fromStage;
      let displayToStage = s.toStage;
      let eventType: UnifiedTimelineEvent['type'] = 'STAGE_CHANGE';
      let eventTitle = `Stage Transition: ${s.fromStage} → ${s.toStage}`;
      let eventDescription = s.remarks || `Application stage transitioned from ${s.fromStage} to ${s.toStage}`;

      if (isWorkflowRevert) {
        eventType = 'STAGE_CHANGE';
        eventTitle = 'Return File Reverted to Preceding Department';
        if (s.remarks?.includes('PREPARATION → DOCUMENTER')) {
          eventTitle = 'Tax Preparer Reverted Return to Documenter Intake';
        } else if (s.remarks?.includes('SALES → PREPARATION')) {
          eventTitle = 'Sales Closer Reverted Return to Tax Preparation';
        } else if (s.remarks?.includes('SALES → DOCUMENTER')) {
          eventTitle = 'Sales Closer Reverted Return to Documenter Intake';
        } else if (s.remarks?.includes('QA_REVIEW → PREPARATION')) {
          eventTitle = 'Senior QA Auditor Reverted Return to Tax Preparer';
        }
      } else if (isIngestion) {
        eventType = 'INGESTION';
        eventTitle = 'Raw Prospect Ingestion (Admin Bulk Import)';
        eventDescription = `Admin uploaded raw prospect lead into TaxCRM Intake Pipeline via Excel/CSV bulk ingestion. Lead deduplicated by SSN/Email and queued in Documenter Department Unassigned Pool at RAW_PROSPECT stage for manager assignment.`;
      } else if (isAutoRoundRobin) {
        eventType = 'ASSIGNMENT';
        eventTitle = '1-Click Auto Round-Robin Lead Allocation (Sales Manager)';
        displayFromStage = 'SALES_PITCH_QUEUE';
        displayToStage = 'SALES_PITCHING';
      } else if (isSalesAssignment) {
        eventType = 'ASSIGNMENT';
        eventTitle = 'Sales Closer Direct Assignment (Sales Manager)';
        displayFromStage = 'SALES_PITCH_QUEUE';
        displayToStage = 'SALES_PITCHING';
      } else if (isPaymentCollected) {
        eventType = 'STAGE_CHANGE';
        eventTitle = 'Service Fee Payment Collected & Verified';
        displayFromStage = s.fromStage;
        displayToStage = s.toStage;
      } else if (isForm8879Signed) {
        eventType = 'STAGE_CHANGE';
        eventTitle = 'IRS Form 8879 / 8878 Taxpayer Authorization Signed';
        displayFromStage = s.fromStage;
        displayToStage = s.toStage;
      } else if (isFilingDispatch) {
        eventType = 'STAGE_CHANGE';
        eventTitle = 'Form 1040 Authorized & Dispatched to IRS Filing Queue';
        displayFromStage = 'SALES_PITCHING';
        displayToStage = 'FILING_QUEUE';
      } else if (isPrepAssignment) {
        eventType = 'ASSIGNMENT';
        eventTitle = 'Tax Preparer & QA Reviewer Assignment (Prep Manager)';
        displayFromStage = 'UNASSIGNED';
        displayToStage = 'DOC_PREP';
      } else if (isDocAssignment) {
        eventType = 'ASSIGNMENT';
        eventTitle = 'Documenter Manager Calling Agent Direct Assignment';
      } else if (isSubmitQA) {
        eventType = 'STAGE_CHANGE';
        eventTitle = 'Form 1040 Submitted for 4-Eyes QA Compliance Review';
        displayFromStage = 'DOC_PREP';
        displayToStage = 'QA_IN_REVIEW';
      } else if (isQASignOff) {
        eventType = 'STAGE_CHANGE';
        eventTitle = 'Senior QA Compliance Sign-Off (Ready for Sales)';
        displayFromStage = 'QA_IN_REVIEW';
        displayToStage = 'SALES_PITCH_QUEUE';
      } else if (isQARevision) {
        eventType = 'STAGE_CHANGE';
        eventTitle = 'Senior QA Auditor Requested Calculation Revision';
        displayFromStage = 'QA_IN_REVIEW';
        displayToStage = 'CORRECTION_NEEDED';
      } else if (s.fromStage === s.toStage) {
        eventType = 'STAGE_CHANGE';
        eventTitle = `Department Action (${s.toStage})`;
      }

      events.push({
        id: `stage-${s.id}`,
        type: eventType,
        title: eventTitle,
        description: eventDescription,
        fromStage: displayFromStage,
        toStage: displayToStage,
        actorName: s.movedByName || s.movedByEmail?.split('@')[0] || (isIngestion ? 'Operations Admin' : isPrepAssignment ? 'Prep Manager' : (isSalesAssignment || isAutoRoundRobin) ? 'Sales Manager' : (isPaymentCollected || isForm8879Signed || isFilingDispatch) ? 'Sales Closer' : 'Documenter Manager'),
        actorEmail: s.movedByEmail || undefined,
        actorRole: s.movedByRole || (isIngestion ? 'ADMIN' : isPrepAssignment ? 'PREP_MANAGER' : (isSalesAssignment || isAutoRoundRobin) ? 'SALES_MANAGER' : (isPaymentCollected || isForm8879Signed || isFilingDispatch) ? 'SALES_AGENT' : 'DOC_MANAGER'),
        timestamp: s.createdAt,
      });
    });

    // 2. Call Logs (Primary source of truth for Outbound Outreach Calls)
    callLogs.forEach((c) => {
      events.push({
        id: `call-${c.id}`,
        type: 'CALL',
        title: `Outreach Call (${c.disposition || 'Logged'})`,
        description: c.callSummary ? `Notes: "${c.callSummary}"` : `Agent dialed taxpayer. Disposition recorded: ${c.disposition}`,
        disposition: c.disposition,
        actorName: c.agentName || c.agentEmail?.split('@')[0] || 'Calling Agent',
        actorEmail: c.agentEmail || undefined,
        actorRole: c.agentRole || 'DOC_AGENT',
        timestamp: c.createdAt,
      });
    });

    // 3. System Audits (Organizer, Document Vault, Tax Draft Calculations - Excluding duplicate call/stage events)
    auditLogs.forEach((a) => {
      const isCallAction = a.action === 'DISPOSITION_LOG' || a.moduleKey === 'OUTREACH_CALL';
      const isIngestionAction = a.moduleKey === 'ADMIN_BULK_IMPORT' || a.moduleKey === 'LEAD_INGESTION';
      const isAssignmentAction = a.moduleKey === 'LEAD_ASSIGNMENT' || a.moduleKey === 'AUTO_ROUND_ROBIN';
      const isStageChange = a.action === 'STAGE_CHANGE';

      // Skip records already cleanly represented by stageHistories or callLogs
      if (isCallAction || isIngestionAction || isAssignmentAction || isStageChange) {
        return;
      }

      const isOrganizer = a.action === 'ORGANIZER_UPDATE';
      const isDocUpload = a.action === 'DOCUMENT_UPLOAD';
      const isDocDelete = a.action === 'DOCUMENT_DELETE';
      const isDocVerify = a.action === 'DOCUMENT_VERIFY';
      const isSalesEsignUpload = a.moduleKey === 'SALES' && (isDocUpload || (a.details as any)?.fileName?.includes('8879') || (a.details as any)?.fileName?.includes('8878'));

      let eventTitle = `Audit Action: ${a.action.replace(/_/g, ' ')}`;
      if (isSalesEsignUpload) {
        eventTitle = `IRS Form 8879 E-Sign Authorized & Attached (PIN: ${(a.details as any)?.taxpayerPin || 'Authorized'})`;
      } else if (isOrganizer) {
        eventTitle = `9-Module Tax Organizer Saved`;
      } else if (isDocUpload) {
        eventTitle = `Document Uploaded: ${(a.details as any)?.fileName || (a.details as any)?.categoryLabel || 'Tax Document'}`;
      } else if (isDocDelete) {
        eventTitle = `Document Removed: ${(a.details as any)?.deletedFileName || 'Tax Document'}`;
      } else if (isDocVerify) {
        eventTitle = `Document Verified: ${(a.details as any)?.fileName || 'Tax Document'}`;
      }

      events.push({
        id: `audit-${a.id}`,
        type: 'AUDIT',
        title: eventTitle,
        description: (a.details as any)?.remarks || (a.moduleKey ? `Updated module ${a.moduleKey}` : `System audit record logged for ${a.action}`),
        actorName: a.actorName || a.actorEmail?.split('@')[0] || (a.actorType === 'CLIENT' ? 'Taxpayer Client' : 'System User'),
        actorEmail: a.actorEmail || undefined,
        actorRole: a.actorRole || (a.actorType === 'CLIENT' ? 'TAXPAYER' : 'SYSTEM'),
        timestamp: a.createdAt,
        meta: a.details as any,
      });
    });

    // Sort descending (latest first)
    return events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [stageHistories, callLogs, auditLogs]);

  // Filter events based on active tab and search query
  const filteredEvents = useMemo(() => {
    return unifiedEvents.filter((ev) => {
      // Filter tab
      if (filter === 'STAGES' && ev.type !== 'STAGE_CHANGE' && ev.type !== 'ASSIGNMENT' && ev.type !== 'INGESTION') return false;
      if (filter === 'CALLS' && ev.type !== 'CALL') return false;
      if (filter === 'AUDIT' && ev.type !== 'AUDIT' && ev.type !== 'INGESTION') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesActor = ev.actorName.toLowerCase().includes(q) || (ev.actorEmail && ev.actorEmail.toLowerCase().includes(q));
        const matchesStage = (ev.fromStage && ev.fromStage.toLowerCase().includes(q)) || (ev.toStage && ev.toStage.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesActor && !matchesStage) return false;
      }

      return true;
    });
  }, [unifiedEvents, filter, searchQuery]);

  const counts = useMemo(() => ({
    all: unifiedEvents.length,
    stages: unifiedEvents.filter((e) => e.type === 'STAGE_CHANGE' || e.type === 'ASSIGNMENT' || e.type === 'INGESTION').length,
    calls: unifiedEvents.filter((e) => e.type === 'CALL').length,
    audit: unifiedEvents.filter((e) => e.type === 'AUDIT' || e.type === 'INGESTION').length,
  }), [unifiedEvents]);

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Lead Audit Trail &amp; Lifecycle Activity
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {counts.all} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium ml-10">
            Immutable audit record of all stage handoffs, agent allocations, calls, and data updates for <strong className="text-slate-700">{taxpayerName}</strong>
            {currentStage && (
              <span> • Stage: <strong className="text-indigo-600 font-bold">{currentStage}</strong></span>
            )}.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="px-5 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>All Activity</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            filter === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setFilter('STAGES')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            filter === 'STAGES'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <GitCommit className="w-3 h-3" />
          <span>Stage &amp; Ingestion Handoffs</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            filter === 'STAGES' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.stages}
          </span>
        </button>

        <button
          onClick={() => setFilter('CALLS')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            filter === 'CALLS'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <PhoneCall className="w-3 h-3" />
          <span>Outreach Calls</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            filter === 'CALLS' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.calls}
          </span>
        </button>

        <button
          onClick={() => setFilter('AUDIT')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            filter === 'AUDIT'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>System Audits</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            filter === 'AUDIT' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.audit}
          </span>
        </button>
      </div>

      {/* 3. Timeline Items List */}
      <div className="p-5 sm:p-6">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Audit Events Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No audit logs match "${searchQuery}". Try clearing the search query.`
                : 'No historical stage transitions or audit actions have been recorded yet for this lead.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {paginatedEvents.map((event, idx) => {
              const isIngestion = event.type === 'INGESTION';
              const isStage = event.type === 'STAGE_CHANGE';
              const isAssignment = event.type === 'ASSIGNMENT';
              const isCall = event.type === 'CALL';
              const isAudit = event.type === 'AUDIT';
              const isRevert = event.title.toLowerCase().includes('revert');

              return (
                <div key={event.id || idx} className="relative group">
                  {/* Timeline Dot Marker */}
                  <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                    isRevert
                      ? 'bg-amber-500 text-white'
                      : isIngestion
                      ? 'bg-blue-600 text-white'
                      : isAssignment
                      ? 'bg-indigo-600 text-white'
                      : isStage
                      ? 'bg-emerald-600 text-white'
                      : isCall
                      ? 'bg-cyan-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {isRevert && <RotateCcw className="w-3 h-3" />}
                    {!isRevert && isIngestion && <UploadCloud className="w-3 h-3" />}
                    {!isRevert && isAssignment && <UserCheck className="w-3 h-3" />}
                    {!isRevert && isStage && <GitCommit className="w-3 h-3" />}
                    {!isRevert && isCall && <PhoneCall className="w-3 h-3" />}
                    {!isRevert && isAudit && <ShieldCheck className="w-3 h-3" />}
                  </div>

                  {/* Card Container */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    isRevert 
                      ? 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/70 hover:border-amber-300' 
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}>
                    {/* Top Row: Title, Badge, and Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {event.title}
                        </span>

                        {isRevert && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <RotateCcw className="w-2.5 h-2.5 text-amber-700" />
                            Return Dispatched
                          </span>
                        )}

                        {isIngestion && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <UploadCloud className="w-2.5 h-2.5" />
                            Admin Ingestion
                          </span>
                        )}

                        {isAssignment && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5" />
                            Lead Assigned
                          </span>
                        )}

                        {isStage && event.fromStage && event.toStage && event.fromStage !== event.toStage ? (
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                            isRevert 
                              ? 'bg-amber-100/70 text-amber-800 border-amber-300' 
                              : 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                          }`}>
                            <span>{event.fromStage}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                            <span>{event.toStage}</span>
                          </div>
                        ) : isStage && event.toStage ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                            {event.toStage}
                          </span>
                        ) : null}

                        {isCall && event.disposition && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {event.disposition}
                          </span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0" title={formatFullDateTime(event.timestamp)}>
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(event.timestamp)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{formatFullDateTime(event.timestamp)}</span>
                      </div>
                    </div>

                    {/* Middle: Remarks / Description (Clamped to 2 lines with ellipsis) */}
                    <div>
                      <p className={`text-xs text-slate-700 font-medium mt-2 leading-relaxed ${expandedEvents[event.id] ? '' : 'line-clamp-2'}`}>
                        {event.description}
                      </p>
                      {event.description && event.description.length > 130 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(event.id)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5 cursor-pointer transition-colors inline-block"
                        >
                          {expandedEvents[event.id] ? 'Show less' : '... Read more'}
                        </button>
                      )}
                    </div>

                    {/* Metadata Chips if available */}
                    {event.meta && typeof event.meta === 'object' && (
                      <div className="flex items-center gap-2 flex-wrap mt-2.5">
                        {Boolean((event.meta as any).source) && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Source: {(event.meta as any).source}
                          </span>
                        )}
                        {Boolean((event.meta as any).taxYear) && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            TY {(event.meta as any).taxYear}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Raw Prospect Lead
                        </span>
                        {Boolean((event.meta as any).assignedTo) && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            To: {(event.meta as any).assignedTo}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Row: Actor attribution badge */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                          {(event.actorName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 text-[11px]">
                          {event.actorName || 'System'}
                        </span>
                        {event.actorEmail && (
                          <span className="text-[10px] text-slate-400">
                            ({event.actorEmail})
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        event.actorRole === 'ADMIN'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : event.actorRole === 'DOC_MANAGER'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : event.actorRole === 'DOC_AGENT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {event.actorRole}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Pagination Footer */}
      {totalItems > 0 && (
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            perPageOptions={[5, 10, 20, 50]}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(perPage) => {
              setItemsPerPage(perPage);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
