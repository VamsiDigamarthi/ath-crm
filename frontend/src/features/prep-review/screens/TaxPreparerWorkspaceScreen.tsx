import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, ShieldCheck, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { SendBackLeadModal } from '@/shared/components/workflow/SendBackLeadModal';
import { useTaxPreparerWorkspace } from '../hooks/useTaxPreparerWorkspace';
import { ClientProfilePanel } from '../components/workspace/ClientProfilePanel';
import { Tax1040FormEngine } from '../components/workspace/Tax1040FormEngine';
import { DocumentPreviewModal } from '../components/workspace/DocumentPreviewModal';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';

export const TaxPreparerWorkspaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isSendBackOpen, setIsSendBackOpen] = useState(false);
  const {
    isLoading,
    isSaving,
    isSubmitting,
    isConfirmOpen,
    setIsConfirmOpen,
    applicationId,
    taxYear,
    currentStage,
    taxpayer,
    assignedReviewer,
    documents,
    selectedDocForPreview,
    setSelectedDocForPreview,
    w2Wages,
    setW2Wages,
    taxableInterest,
    setTaxableInterest,
    capitalGains,
    setCapitalGains,
    otherIncome,
    setOtherIncome,
    deductionType,
    setDeductionType,
    itemizedDeduction,
    setItemizedDeduction,
    taxCredits,
    setTaxCredits,
    fedWithheld,
    setFedWithheld,
    stateWithheld,
    setStateWithheld,
    preparerNotes,
    setPreparerNotes,
    standardDeductionAmount,
    calculations,
    isSubmittedToQA,
    isRevisionRequested,
    isRevertedToDocs,
    isRevertedToSales,
    lastRevertInfo,
    documenterNotes,
    documenterNotesBy,
    documenterNotesAt,
    revisionCategory,
    revisionInstructions,
    stageHistories,
    callLogs,
    auditLogs,
    handleSaveDraft,
    handleSubmitForQA,
  } = useTaxPreparerWorkspace();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Form 1040 drafting workspace...</p>
        </div>
      </div>
    );
  }

  const taxpayerName = taxpayer?.name || 'Taxpayer Client';
  const taxpayerSSN = taxpayer?.ssnMasked || '***-**-****';
  const taxpayerFilingStatus = taxpayer?.maritalStatus || 'Single';
  const taxpayerLocation = taxpayer?.state ? `${taxpayer?.city ? `${taxpayer.city}, ` : ''}${taxpayer.state}` : 'USA';
  const reviewerName = assignedReviewer?.name || 'Senior QA Reviewer';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/prep-review/preparer')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Queue</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              {taxpayerName}
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
              TY {taxYear} Form 1040
            </span>
            {isSubmittedToQA ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>In QA Review</span>
              </span>
            ) : isRevertedToSales ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-blue-600" />
                <span>With Sales Closer</span>
              </span>
            ) : isRevertedToDocs ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>Reverted to Documenter</span>
              </span>
            ) : isRevisionRequested ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-rose-600" />
                <span>Revision Requested</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Drafting 1040
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SSN: {taxpayerSSN} • {taxpayerFilingStatus} • {taxpayerLocation}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(() => {
            const isFilingOrCompleted =
              currentStage.startsWith('FILING') || currentStage === 'QA_APPROVED' || currentStage === 'PAID_AND_AUTHORIZED';
            const isSendBackDisabled = isSaving || isSubmitting || isSubmittedToQA || isRevertedToDocs || isRevertedToSales || isFilingOrCompleted;

            const sendBackLabel = isRevertedToDocs
              ? 'Sent to Documenter'
              : isRevertedToSales
              ? 'With Sales'
              : isFilingOrCompleted
              ? 'In IRS Filing'
              : isSubmittedToQA
              ? 'In QA Review'
              : 'Send Back to Documenter';

            const sendBackTitle = isRevertedToDocs
              ? 'Return is currently with Documenter department awaiting intake documents'
              : isRevertedToSales
              ? 'Return is currently with Sales department awaiting pricing or client consultation'
              : isFilingOrCompleted
              ? 'Return has already been certified and dispatched to IRS Filing Operations'
              : isSubmittedToQA
              ? 'Return is currently undergoing Senior QA Review'
              : 'Send return back to Documenter for missing documents or customer clarification';

            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSendBackOpen(true)}
                disabled={isSendBackDisabled}
                className={`text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                  isSendBackDisabled
                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-75 shadow-none'
                    : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer'
                }`}
                title={sendBackTitle}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSendBackDisabled ? 'text-slate-400' : 'text-amber-600'}`} />
                <span>{sendBackLabel}</span>
              </Button>
            );
          })()}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmittedToQA || isRevertedToDocs || isRevertedToSales || currentStage.startsWith('FILING') || currentStage === 'QA_APPROVED'}
            className={`text-xs font-semibold ${
              isRevertedToDocs || isRevertedToSales || isSubmittedToQA || currentStage.startsWith('FILING') || currentStage === 'QA_APPROVED'
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                : 'cursor-pointer'
            }`}
            title={
              isRevertedToDocs
                ? 'Drafting is locked while return is in Documenter outreach'
                : isRevertedToSales
                ? 'Drafting is locked while return is with Sales closer'
                : currentStage.startsWith('FILING')
                ? 'Drafting is locked while return is in IRS Filing'
                : 'Save Draft Form 1040'
            }
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          {isSubmittedToQA ? (
            <Button size="sm" disabled className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold cursor-not-allowed">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Submitted for QA</span>
            </Button>
          ) : isRevertedToDocs ? (
            <Button
              size="sm"
              disabled
              className="bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 opacity-75"
              title="Cannot submit for QA while awaiting missing documents from Documenter intake"
            >
              <Send className="w-3.5 h-3.5 opacity-40" />
              <span>Submit for QA (Awaiting Docs)</span>
            </Button>
          ) : isRevertedToSales ? (
            <Button
              size="sm"
              disabled
              className="bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 opacity-75"
              title="Cannot submit for QA while return is with Sales closer"
            >
              <Send className="w-3.5 h-3.5 opacity-40" />
              <span>With Sales Closer</span>
            </Button>
          ) : currentStage.startsWith('FILING') ? (
            <Button
              size="sm"
              disabled
              className="bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 opacity-75"
              title="Return is already authorized and in IRS Filing Operations"
            >
              <Send className="w-3.5 h-3.5 opacity-40" />
              <span>In IRS Filing Operations</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for QA</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1.3 Documenter Intake Handover Notes Banner */}
      {documenterNotes && !isRevertedToDocs && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 flex items-start gap-3.5 text-emerald-950 shadow-2xs animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
            <FileSpreadsheet className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-950">
                <span>Documenter Intake Handover Notes</span>
                {documenterNotesBy && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900 text-[10px] font-bold">
                    from {documenterNotesBy}
                  </span>
                )}
              </div>
              {documenterNotesAt && (
                <span className="text-[11px] text-emerald-700 font-medium">
                  {new Date(documenterNotesAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-emerald-200/80 shadow-2xs">
              "{documenterNotes}"
            </p>
          </div>
        </div>
      )}



      {/* 1.5 Revision Request Alert Banner (from Sales, Filing, or Senior QA - strictly for PREPARATION target) */}
      {isRevisionRequested && (!lastRevertInfo || lastRevertInfo?.targetDepartment === 'PREPARATION') && (
        lastRevertInfo?.sourceDepartment === 'SALES' ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3.5 text-amber-950 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <span>Client Revision Requested by Sales Closer:</span>
                  {(revisionCategory || lastRevertInfo.reasonCategory) && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[10px] font-bold">
                      {(revisionCategory || lastRevertInfo.reasonCategory).replace(/_/g, ' ')}
                    </span>
                  )}
                  {lastRevertInfo.revertedByName && (
                    <span className="text-xs text-amber-800 font-semibold">
                      by {lastRevertInfo.revertedByName} (Sales Closer)
                    </span>
                  )}
                </div>
                {lastRevertInfo.revertedAt && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    {new Date(lastRevertInfo.revertedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-amber-200 shadow-2xs">
                "{revisionInstructions || lastRevertInfo.revertNotes || 'Client requested tax calculation / deduction adjustment.'}"
              </p>
              <div className="pt-1 text-[11px] text-amber-800 font-medium border-t border-amber-200/60 flex items-center gap-1.5">
                <span>💡 Please review taxpayer feedback from Sales, adjust Form 1040 line items/deductions below, and click <strong>Submit for QA</strong> to resubmit for certification.</span>
              </div>
            </div>
          </div>
        ) : lastRevertInfo?.sourceDepartment === 'FILING' ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3.5 text-amber-950 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <span>Correction Requested by IRS Filing Specialist:</span>
                  {(revisionCategory || lastRevertInfo.reasonCategory) && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[10px] font-bold">
                      {(revisionCategory || lastRevertInfo.reasonCategory).replace(/_/g, ' ')}
                    </span>
                  )}
                  {lastRevertInfo.revertedByName && (
                    <span className="text-xs text-amber-800 font-semibold">
                      by {lastRevertInfo.revertedByName} (Filing Specialist)
                    </span>
                  )}
                </div>
                {lastRevertInfo.revertedAt && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    {new Date(lastRevertInfo.revertedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-amber-200 shadow-2xs">
                "{revisionInstructions || lastRevertInfo.revertNotes || 'IRS MeF XML / Calculation correction required.'}"
              </p>
              <div className="pt-1 text-[11px] text-amber-800 font-medium border-t border-amber-200/60 flex items-center gap-1.5">
                <span>💡 Please review feedback from Filing Operations, correct Form 1040 line items/deductions below, and click <strong>Submit for QA</strong> to resubmit for review.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3.5 text-rose-950 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
              <RotateCcw className="w-4 h-4 text-rose-700" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-950">
                  <span>Senior QA Auditor Requested Revision:</span>
                  {(revisionCategory || lastRevertInfo?.reasonCategory) && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 text-[10px] font-bold">
                      {(revisionCategory || lastRevertInfo?.reasonCategory).replace(/_/g, ' ')}
                    </span>
                  )}
                  {lastRevertInfo?.revertedByName && (
                    <span className="text-xs text-rose-800 font-semibold">
                      by {lastRevertInfo.revertedByName}
                    </span>
                  )}
                </div>
                {lastRevertInfo?.revertedAt && (
                  <span className="text-[11px] text-rose-700 font-medium">
                    {new Date(lastRevertInfo.revertedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-rose-200 shadow-2xs">
                "{revisionInstructions || lastRevertInfo?.revertNotes || 'Please review Form 1040 calculations against source documents and resubmit for 4-Eyes audit.'}"
              </p>
            </div>
          </div>
        )
      )}

      {/* 2. Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ClientProfilePanel
            taxpayer={taxpayer}
            assignedReviewer={assignedReviewer}
            documents={documents}
            standardDeductionAmount={standardDeductionAmount}
            onPreviewDoc={setSelectedDocForPreview}
          />
        </div>

        <div className="lg:col-span-2">
          <Tax1040FormEngine
            w2Wages={w2Wages}
            setW2Wages={setW2Wages}
            taxableInterest={taxableInterest}
            setTaxableInterest={setTaxableInterest}
            capitalGains={capitalGains}
            setCapitalGains={setCapitalGains}
            otherIncome={otherIncome}
            setOtherIncome={setOtherIncome}
            deductionType={deductionType}
            setDeductionType={setDeductionType}
            itemizedDeduction={itemizedDeduction}
            setItemizedDeduction={setItemizedDeduction}
            taxCredits={taxCredits}
            setTaxCredits={setTaxCredits}
            fedWithheld={fedWithheld}
            setFedWithheld={setFedWithheld}
            stateWithheld={stateWithheld}
            setStateWithheld={setStateWithheld}
            preparerNotes={preparerNotes}
            setPreparerNotes={setPreparerNotes}
            standardDeductionAmount={standardDeductionAmount}
            isReadOnly={isSubmittedToQA || isRevertedToDocs}
            readOnlyReason={isRevertedToDocs ? 'REVERTED_DOCS' : isSubmittedToQA ? 'QA_AUDIT' : undefined}
            calculations={calculations}
          />
        </div>
      </div>

      {/* 2.5 Complete Lead Audit Trail & Lifecycle Activity Stream */}
      <LeadAuditTrailSection
        leadId={applicationId}
        taxpayerName={taxpayerName}
        currentStage={currentStage}
        stageHistories={stageHistories}
        callLogs={callLogs}
        auditLogs={auditLogs}
      />

      <DocumentPreviewModal
        document={selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
      />

      {/* 4. Rich Submit for QA Confirmation Modal */}
      <AppModal
        isOpen={isConfirmOpen}
        onClose={() => !isSubmitting && setIsConfirmOpen(false)}
        title="Submit Form 1040 for 4-Eyes QA Compliance Review"
        width="620px"
      >
        <div className="space-y-4">
          {/* Header Summary Pill */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#16A34A]" />
                <span>{taxpayerName}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">TY {taxYear} Form 1040</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {taxpayerFilingStatus} • {taxpayerLocation}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Designated QA Auditor</span>
              <span className="text-xs font-bold text-purple-700">{reviewerName}</span>
            </div>
          </div>

          {/* Key Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <div className="text-[10px] font-medium text-slate-500">Gross Income</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                ${calculations.totalGrossIncome.toLocaleString()}
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <div className="text-[10px] font-medium text-slate-500">Taxable Income</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                ${calculations.taxableIncome.toLocaleString()}
              </div>
            </div>

            <div className={`p-2.5 rounded-lg border text-center ${
              calculations.balanceDue > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="text-[10px] font-medium opacity-80">Federal Result</div>
              <div className="text-xs sm:text-sm font-bold mt-0.5">
                {calculations.balanceDue > 0 
                  ? `-$${calculations.balanceDue.toLocaleString()} Due`
                  : `+$${calculations.federalRefund.toLocaleString()} Refund`}
              </div>
            </div>

            <div className={`p-2.5 rounded-lg border text-center ${
              calculations.stateBalanceDue > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="text-[10px] font-medium opacity-80">State Result</div>
              <div className="text-xs sm:text-sm font-bold mt-0.5">
                {calculations.stateBalanceDue > 0 
                  ? `-$${calculations.stateBalanceDue.toLocaleString()} Due`
                  : `+$${calculations.stateRefund.toLocaleString()} Refund`}
              </div>
            </div>
          </div>

          {/* Preparer Handover Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preparer Handover Comments for Senior QA Auditor (Optional)
            </label>
            <textarea
              value={preparerNotes}
              onChange={(e) => setPreparerNotes(e.target.value)}
              placeholder="e.g., Verified Box 1 W-2 against payroll stub, applied standard deduction for Married Filing Jointly..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none text-slate-800"
            />
          </div>

          {/* Audit Notice */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5 text-xs text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Upon confirmation, this return will be placed in <strong>{reviewerName}</strong>'s QA Audit Deck and an audit trail entry will be recorded in the system log.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
              className="text-xs cursor-pointer"
            >
              Keep Drafting
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitForQA}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Confirm & Submit to QA Review'}</span>
            </Button>
          </div>
        </div>
      </AppModal>

      {/* 5. Reusable Send Back to Documenter Workflow Modal */}
      <SendBackLeadModal
        isOpen={isSendBackOpen}
        onClose={() => setIsSendBackOpen(false)}
        applicationId={applicationId || ''}
        taxpayerName={taxpayerName}
        taxYear={taxYear}
        currentDepartment="PREPARATION"
        availableTargetDepartments={[
          {
            key: 'DOCUMENTER',
            label: 'Documenter Department (Intake & Verification)',
            badge: 'DOC_OUTREACH',
            description: 'Revert to Documenter agent to collect missing documents or follow up directly with taxpayer.',
          },
        ]}
        defaultTargetDepartment="DOCUMENTER"
        onRevertSuccess={() => {
          navigate('/prep-review/preparer');
        }}
      />
    </div>
  );
};
