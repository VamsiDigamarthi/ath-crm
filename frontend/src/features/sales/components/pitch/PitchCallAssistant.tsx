import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Sparkles, 
  Rocket,
  AlertCircle,
  Lock,
  MessageSquare,
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { SalesLeadItem, SalesPaymentStatus, CloserNoteItem } from '../../types/sales.types';
import toast from 'react-hot-toast';

import { salesService } from '../../services/sales-service';

interface PitchCallAssistantProps {
  lead: SalesLeadItem;
  paymentStatus: SalesPaymentStatus;
  esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED';
  onDispatchToFiling: (notes?: string) => void;
  onNotesSaved?: () => void;
}

export const PitchCallAssistant: React.FC<PitchCallAssistantProps> = ({
  lead,
  paymentStatus,
  esignStatus,
  onDispatchToFiling,
  onNotesSaved,
}) => {
  const appId = lead.id || lead.applicationId;
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isNotesSaved, setIsNotesSaved] = useState(false);

  // Compute unified notes history (latest first)
  const notesHistory: CloserNoteItem[] = useMemo(() => {
    const fromHistory: CloserNoteItem[] = Array.isArray(lead.closerNotesHistory)
      ? lead.closerNotesHistory
      : Array.isArray((lead.taxDraftSummary as any)?.closerNotesHistory)
      ? (lead.taxDraftSummary as any).closerNotesHistory
      : [];

    if (fromHistory.length > 0) {
      return [...fromHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const fromCallLogs: CloserNoteItem[] = (lead.callLogs || [])
      .filter((c: any) => Boolean(c.callSummary))
      .map((c: any) => ({
        id: `call_${c.id}`,
        note: c.callSummary,
        authorId: c.agentId,
        authorName: c.agentName || 'Sales Closer',
        authorEmail: c.agentEmail,
        authorRole: c.agentRole || 'SALES_AGENT',
        disposition: c.disposition || 'CALL_LOGGED',
        createdAt: c.createdAt,
      }));

    if (fromCallLogs.length > 0) {
      return fromCallLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const singleNote = (lead.closerCallNotes || lead.notes || (lead.taxDraftSummary as any)?.closerCallNotes || '').trim();
    if (singleNote) {
      return [{
        id: 'legacy_note',
        note: singleNote,
        authorName: (lead.assignedSalesAgent as any)?.name || 'Sales Closer',
        authorRole: 'SALES_AGENT',
        createdAt: (lead.taxDraftSummary as any)?.lastCallNoteAt || (lead as any).updatedAt || new Date().toISOString(),
      }];
    }

    return [];
  }, [lead.closerNotesHistory, lead.taxDraftSummary, lead.callLogs, lead.closerCallNotes, lead.notes, lead.assignedSalesAgent]);

  const formatNoteTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  React.useEffect(() => {
    let interval: any = null;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCalling]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsCalling(true);
    toast.success(`Dialing ${lead.taxpayerName} (${lead.taxpayerPhone})... 📞`);
  };

  const handleSaveNotes = async () => {
    const textToSave = newNoteText.trim();
    if (!textToSave) return;
    setIsSavingNotes(true);
    try {
      await salesService.saveCloserNotes(appId, {
        notes: textToSave,
        disposition: isCalling ? 'CALL_LOGGED' : 'NOTE_RECORDED',
        callDuration,
      });
      setNewNoteText('');
      setIsNotesSaved(true);
      toast.success('Closer note recorded in history! 📝✅');
      if (onNotesSaved) {
        onNotesSaved();
      }
      setTimeout(() => setIsNotesSaved(false), 3000);
    } catch {
      toast.error('Failed to save closer note to database');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleEndCall = async () => {
    setIsCalling(false);
    if (newNoteText.trim()) {
      await handleSaveNotes();
    }
    toast(`Call completed (${formatTime(callDuration)}). Call log saved! ⏱️`, {
      icon: '📞',
    });
  };

  const isAlreadyDispatched =
    lead.currentStage === 'FILING_QUEUE' ||
    lead.currentStage === 'FILING_IN_PROGRESS' ||
    lead.currentStage === 'FILING_SUCCESS';

  const currentStageStr = (lead.currentStage as string);
  const isQaApproved = Boolean(
    (lead.taxDraftSummary as any)?.status === 'QA_APPROVED' ||
    Boolean((lead.taxDraftSummary as any)?.qaApprovedAt) ||
    ['QA_APPROVED', 'SALES_PITCH_QUEUE', 'SALES_PAYMENT_PENDING', 'SALES_ESIGN_PENDING', 'PAID_AND_AUTHORIZED', 'FILING_QUEUE', 'FILING_IN_PROGRESS', 'FILING_SUCCESS', 'COMPLETED'].includes(currentStageStr)
  );

  const isRevertedToPrecedingDept =
    ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'QA_REVISION_REQUESTED'].includes(currentStageStr) ||
    (lead.taxDraftSummary as any)?.status === 'REVISION_REQUESTED' ||
    (lead.taxDraftSummary as any)?.status === 'REVERTED_TO_DOCUMENTER';

  const isReadyForFiling = isQaApproved && paymentStatus === 'PAID' && esignStatus === 'SIGNED' && !isAlreadyDispatched && !isRevertedToPrecedingDept;

  const targetDeptName = lead.currentStage === 'DOC_OUTREACH' || (lead.taxDraftSummary as any)?.status === 'REVERTED_TO_DOCUMENTER'
    ? 'Documenter Intake'
    : 'Tax Preparation (CPA)';

  const dispatchTooltip = isAlreadyDispatched
    ? 'Already Dispatched: Form 1040 has been certified, fee-paid, authorized, and transferred to the IRS Modernized e-File (MeF) Queue.'
    : isRevertedToPrecedingDept
    ? `Cannot Dispatch: Return has been sent back for revision and is currently with ${targetDeptName}. It must be corrected and certified by QA before dispatching to IRS.`
    : !isQaApproved
    ? 'Cannot Dispatch: Return is awaiting 4-Eyes Compliance Certification from Senior QA Reviewer.'
    : !isReadyForFiling
    ? paymentStatus !== 'PAID' && esignStatus !== 'SIGNED'
      ? 'Cannot Dispatch: Both fee payment and Form 8879 taxpayer authorization are required before dispatching to IRS.'
      : paymentStatus !== 'PAID'
      ? 'Cannot Dispatch: Service fee payment is pending collection.'
      : 'Cannot Dispatch: IRS Form 8879 taxpayer signature authorization is pending.'
    : 'Click to authorize and transfer this certified return to the IRS Modernized e-File (MeF) Department Queue.';

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Integrated Softphone Dialer Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Closer Softphone &amp; Outreach
            </h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {isCalling ? 'Call in Progress' : 'Ready to Call'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <div className="font-bold text-slate-900 text-xs">
              {lead.taxpayerName}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {lead.taxpayerPhone} • {lead.stateOfResidence}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCalling ? (
              <>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 animate-pulse">
                  {formatTime(callDuration)}
                </span>
                <Button
                  size="sm"
                  onClick={handleEndCall}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End Call</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleStartCall}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Recommended Talking Points */}
      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Recommended Closer Talking Points</span>
        </div>

        <ul className="text-[11px] text-amber-900/80 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-amber-950">Certified Calculation Pitch:</strong> &quot;Our Senior Auditor finalized your 1040 Form with a {lead.federalRefund > 0 ? `maximized refund of $${lead.federalRefund.toLocaleString()}` : `minimized balance due of -$${lead.balanceDue.toLocaleString()}`}.&quot;
          </li>
          <li>
            <strong className="text-amber-950">Compliance &amp; State:</strong> &quot;We audited your W-2 wages and optimized state credits to eliminate audit risk.&quot;
          </li>
          <li>
            <strong className="text-amber-950">Payment Close:</strong> &quot;We can transmit this return to the IRS today for ${lead.feeBreakdown.totalServiceFee} all-inclusive.&quot;
          </li>
        </ul>
      </div>

      {/* 3. Call Disposition & Multiple Notes Stream */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900">
              Closer Activity &amp; Call Notes
            </h4>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {notesHistory.length}
            </span>
          </div>
          {isNotesSaved && (
            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-in fade-in duration-150">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Note Saved!</span>
            </span>
          )}
        </div>

        {/* Top: Fixed-Height Scrollable Notes History Stream (Latest first) */}
        <div className="h-44 max-h-44 overflow-y-auto rounded-xl bg-slate-50/80 border border-slate-200 p-2.5 space-y-2 custom-scrollbar">
          {notesHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400">
              <MessageSquare className="w-6 h-6 text-slate-300 mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">No notes recorded yet</p>
              <p className="text-[11px] text-slate-400">Add client feedback, objections, or call notes below.</p>
            </div>
          ) : (
            notesHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs space-y-1.5 transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 truncate">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.authorName || 'Sales Closer'}</span>
                    {item.disposition && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[9px]">
                        {item.disposition.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatNoteTime(item.createdAt)}</span>
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {item.note}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Bottom: New Note Entry Box */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <textarea
            rows={2}
            value={newNoteText}
            onChange={(e) => {
              setNewNoteText(e.target.value);
              setIsNotesSaved(false);
            }}
            placeholder="Type a new closer note (e.g. client agreed on $227, callback scheduled for 5 PM)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              💡 Notes are recorded in history &amp; audit timeline.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveNotes}
              disabled={isSavingNotes || !newNoteText.trim()}
              className="h-7 px-3 text-[11px] font-bold border-slate-300 bg-white text-slate-800 hover:bg-slate-50 cursor-pointer rounded-lg shadow-2xs flex items-center gap-1"
            >
              {isSavingNotes ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Final Handoff: Dispatch to IRS E-Filing Queue */}
      <div
        className={`p-5 rounded-xl border transition-all ${
          isAlreadyDispatched
            ? 'bg-slate-50 border-slate-200'
            : isReadyForFiling
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-xs'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket
              className={`w-4 h-4 ${isAlreadyDispatched ? 'text-slate-400' : isReadyForFiling ? 'text-[#16A34A]' : 'text-slate-400'}`}
            />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              IRS E-Filing Dispatch Handoff
            </h4>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAlreadyDispatched
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isRevertedToPrecedingDept
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                : isReadyForFiling
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isAlreadyDispatched
              ? 'Transferred to Filing Queue'
              : isRevertedToPrecedingDept
              ? `In Revision with ${targetDeptName}`
              : isReadyForFiling
              ? 'Ready to Dispatch'
              : 'Requirements Incomplete'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 mb-3">
          <div className="flex items-center justify-between">
            <span>1. Service Fee Paid:</span>
            <span className={`font-bold ${paymentStatus === 'PAID' ? 'text-[#16A34A]' : paymentStatus === 'PARTIALLY_PAID' ? 'text-amber-600' : 'text-slate-500'}`}>
              {paymentStatus === 'PAID'
                ? `✓ Paid in Full ($${lead.feeBreakdown?.totalServiceFee || 247})`
                : paymentStatus === 'PARTIALLY_PAID'
                ? `⏳ Partial ($${lead.paidAmount || 0} Paid • $${lead.remainingBalance || 0} Due)`
                : '⏳ Pending Payment'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>2. Form 8879 E-Signed:</span>
            <span className={`font-bold ${esignStatus === 'SIGNED' ? 'text-[#16A34A]' : 'text-amber-600'}`}>
              {esignStatus === 'SIGNED' ? '✓ E-Signed & Verified' : '⏳ Pending Authorization'}
            </span>
          </div>
        </div>

        {/* Clear Explanation when Requirements are Incomplete or Reverted */}
        {isRevertedToPrecedingDept ? (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Return in Revision:</strong>
              <span className="ml-1">
                This return is currently with <strong>{targetDeptName}</strong> for Form 1040 corrections. Dispatching to IRS E-Filing is disabled until corrections are completed and certified.
              </span>
            </div>
          </div>
        ) : !isQaApproved && !isAlreadyDispatched ? (
          <div className="mb-3 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Awaiting Senior QA Sign-Off:</strong>
              <span className="ml-1">
                Dispatching to IRS E-Filing will be enabled once Senior QA Reviewer certifies 4-Eyes Compliance Sign-Off on Form 1040.
              </span>
            </div>
          </div>
        ) : !isReadyForFiling && !isAlreadyDispatched ? (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">IRS Transmission Gate:</strong>
              <span className="ml-1">
                {paymentStatus !== 'PAID' && esignStatus !== 'SIGNED'
                  ? 'Both fee payment and Form 8879 taxpayer authorization are required before dispatching to IRS.'
                  : paymentStatus !== 'PAID'
                  ? 'Fee payment is pending. Please collect payment to enable IRS dispatch.'
                  : 'Form 8879 authorization is pending. Please collect digital signature or upload signed PDF to enable IRS dispatch.'}
              </span>
            </div>
          </div>
        ) : null}

        {/* Button with Floating Tooltip matching Reviewer Screen Reference */}
        <div className="relative group w-full" title={dispatchTooltip}>
          <Button
            onClick={() => onDispatchToFiling(newNoteText.trim() || notesHistory[0]?.note || '')}
            disabled={!isReadyForFiling || isAlreadyDispatched || isRevertedToPrecedingDept}
            className={`w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2 shadow-sm transition-all ${
              isAlreadyDispatched || isRevertedToPrecedingDept
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 hover:bg-slate-100 pointer-events-none'
                : isReadyForFiling
                ? 'bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            {isAlreadyDispatched ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Dispatched to Filing Queue</span>
              </>
            ) : isRevertedToPrecedingDept ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>With {targetDeptName} (In Revision)</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Dispatch to IRS E-Filing Queue 🚀</span>
              </>
            )}
          </Button>

          {/* Hover Tooltip Popup Card - Matching Reviewer Screen Styling */}
          {(isAlreadyDispatched || !isReadyForFiling || isRevertedToPrecedingDept) && (
            <div
              className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-72 p-2.5 rounded-lg shadow-2xl border border-slate-700 text-left transition-all duration-150"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', zIndex: 9999 }}
            >
              <p className="text-[11px] font-medium leading-relaxed m-0 p-0" style={{ color: '#ffffff' }}>
                {dispatchTooltip}
              </p>
              <div
                className="w-2.5 h-2.5 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700"
                style={{ backgroundColor: '#0f172a' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
