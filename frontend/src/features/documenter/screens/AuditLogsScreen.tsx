import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  History, 
  Search, 
  ExternalLink, 
  RotateCcw, 
  Layers, 
  PhoneCall, 
  FileCheck2, 
  ShieldCheck,
  User,
  X
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { documenterService } from '../services/documenter-service';
import { LeadAuditTrailSection } from '../components/LeadAuditTrailSection';
import type { DocumenterLeadItem } from '../types/documenter.types';
import toast from 'react-hot-toast';

export const AuditLogsScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialLeadId = searchParams.get('leadId') || '';
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId);
  const [leadList, setLeadList] = useState<DocumenterLeadItem[]>([]);
  const [selectedLead, setSelectedLead] = useState<DocumenterLeadItem | null>(null);

  const [auditData, setAuditData] = useState<{
    auditLogs: any[];
    stageHistories: any[];
    callLogs: any[];
    stats: {
      totalEvents: number;
      systemAudits: number;
      stageHandoffs: number;
      outreachCalls: number;
    };
  }>({
    auditLogs: [],
    stageHistories: [],
    callLogs: [],
    stats: {
      totalEvents: 0,
      systemAudits: 0,
      stageHandoffs: 0,
      outreachCalls: 0,
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Sync state with URL params
  useEffect(() => {
    const paramId = searchParams.get('leadId') || '';
    if (paramId !== selectedLeadId) {
      setSelectedLeadId(paramId);
    }
  }, [searchParams]);

  // Load leads for selector
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await documenterService.getLeads({ tab: 'ALL', limit: 100 });
        if (res?.data?.leads) {
          setLeadList(res.data.leads);
        }
      } catch (err) {
        console.error('Failed to load lead directory for audit logs:', err);
      }
    };
    fetchLeads();
  }, []);

  // Fetch audit logs for selected lead or global feed
  const fetchAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await documenterService.getAuditLogs({
        leadId: selectedLeadId || undefined,
      });

      if (res?.data) {
        setAuditData(res.data);
      }

      // If a specific lead is selected, find lead metadata
      if (selectedLeadId) {
        try {
          const detailRes = await documenterService.getLeadDetails(selectedLeadId);
          if (detailRes?.data) {
            setSelectedLead(detailRes.data);
          }
        } catch {
          const found = leadList.find((l) => l.id === selectedLeadId);
          if (found) setSelectedLead(found);
        }
      } else {
        setSelectedLead(null);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      toast.error('Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLeadId, leadList]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleSelectLead = (lead: DocumenterLeadItem | null) => {
    if (lead) {
      setSelectedLeadId(lead.id);
      setSelectedLead(lead);
      setSearchParams({ leadId: lead.id });
    } else {
      setSelectedLeadId('');
      setSelectedLead(null);
      setSearchParams({});
    }
    setIsDropdownOpen(false);
  };

  const filteredLeads = leadList.filter((lead) => {
    const name = `${lead.customer?.firstName || ''} ${lead.customer?.lastName || ''}`.toLowerCase();
    const email = (lead.customer?.email || '').toLowerCase();
    const phone = (lead.customer?.phone || '').toLowerCase();
    const q = leadSearchQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q) || lead.id.includes(q);
  });

  const taxpayerDisplayName = selectedLead?.customer
    ? `${selectedLead.customer.firstName || ''} ${selectedLead.customer.lastName || ''}`.trim() || selectedLead.customer.email || 'Taxpayer'
    : 'All Department Taxpayers';

  return (
    <div className="w-full space-y-4 pb-8 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-[#16A34A]" />
            <span>Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Centralized, immutable record of all lifecycle stages, stage handoffs, outreach calls, and system audits
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedLeadId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/documenter/agent/lead/${selectedLeadId}?from=audit_logs`, { state: { from: 'audit_logs' } })}
              className="text-xs font-semibold flex items-center gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer rounded-md"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Taxpayer 360 Workspace</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="text-xs font-semibold flex items-center gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer rounded-md"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Compact Taxpayer Scoping Bar */}
      <div className="bg-white rounded-md border border-slate-200 px-3.5 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-700 shrink-0">Filter by Taxpayer:</span>
          <div className="relative flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full text-left px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {selectedLead ? (
                  <span className="font-semibold text-slate-900 truncate">
                    {selectedLead.customer?.firstName} {selectedLead.customer?.lastName} ({selectedLead.customer?.email}) • TY {selectedLead.taxYear}
                  </span>
                ) : (
                  <span className="text-slate-600 font-medium">
                    All Department Leads &amp; Taxpayers (Full Audit Feed)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-2">
                Change
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-30 mt-1 w-full bg-white rounded-md border border-slate-200 shadow-lg p-2 max-h-80 overflow-y-auto">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leadSearchQuery}
                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                    placeholder="Search taxpayer name, email, or ID..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleSelectLead(null)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md font-semibold flex items-center justify-between ${
                      !selectedLeadId ? 'bg-emerald-50 text-[#16A34A]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>All Leads &amp; Applications (Global Stream)</span>
                    {!selectedLeadId && <span className="text-[10px] uppercase font-bold text-emerald-600">Active</span>}
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  {filteredLeads.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No matching taxpayers found
                    </div>
                  ) : (
                    filteredLeads.map((lead) => {
                      const isSelected = lead.id === selectedLeadId;
                      const name = `${lead.customer?.firstName || ''} ${lead.customer?.lastName || ''}`.trim() || 'Client';
                      return (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => handleSelectLead(lead)}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-emerald-50 text-[#16A34A]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold truncate text-slate-900">{name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{lead.customer?.email || 'No email'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              TY {lead.taxYear}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedLeadId && (
            <button
              type="button"
              onClick={() => handleSelectLead(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Clear Taxpayer filter"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-md border border-slate-200 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Events</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{auditData.stats.totalEvents}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Stage Handoffs</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{auditData.stats.stageHandoffs}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Outreach Calls</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{auditData.stats.outreachCalls}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">System Audits</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{auditData.stats.systemAudits}</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. Main Audit Trail Component (No Outer Wrapper / No Double Container) */}
      <LeadAuditTrailSection
        stageHistories={auditData.stageHistories}
        auditLogs={auditData.auditLogs}
        callLogs={auditData.callLogs}
        leadId={selectedLeadId || undefined}
        taxpayerName={taxpayerDisplayName}
        taxpayerEmail={selectedLead?.customer?.email || undefined}
        currentStage={selectedLead?.currentStage}
      />
    </div>
  );
};
