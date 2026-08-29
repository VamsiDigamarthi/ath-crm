import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { useTaxPreparerWorkspace } from '../hooks/useTaxPreparerWorkspace';
import { ClientProfilePanel } from '../components/workspace/ClientProfilePanel';
import { Tax1040FormEngine } from '../components/workspace/Tax1040FormEngine';
import { DocumentPreviewModal } from '../components/workspace/DocumentPreviewModal';

export const TaxPreparerWorkspaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    isSaving,
    isSubmitting,
    isConfirmOpen,
    setIsConfirmOpen,
    taxYear,
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
    isSubmittedToQA,
    isRevisionRequested,
    revisionCategory,
    revisionInstructions,
    calculations,
    handleSaveDraft,
    handleSubmitForQA,
  } = useTaxPreparerWorkspace();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-700">Loading Form 1040 Interactive Workspace...</span>
        <span className="text-[11px] text-slate-400 font-medium">Fetching verified client documents &amp; calculation rules</span>
      </div>
    );
  }

  const taxpayerName = taxpayer?.name || '-';
  const taxpayerSSN = taxpayer?.ssnMasked || '-';
  const taxpayerFilingStatus = taxpayer?.maritalStatus || '-';
  const taxpayerLocation = taxpayer?.city && taxpayer?.state ? `${taxpayer.city}, ${taxpayer.state}` : (taxpayer?.state || '-');
  const reviewerName = assignedReviewer?.name || '-';

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <button
            type="button"
            onClick={() => navigate('/prep-review/preparer')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Queue</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {taxpayerName}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              TY {taxYear} Form 1040
            </span>

            {/* Dynamic Stage Pill */}
            {isSubmittedToQA ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                <span>In QA Audit Review</span>
              </span>
            ) : isRevisionRequested ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                <span>Revision Requested</span>
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Drafting 1040
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            SSN: {taxpayerSSN} • {taxpayerFilingStatus} • {taxpayerLocation}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmittedToQA}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          {isSubmittedToQA ? (
            <Button
              size="sm"
              disabled
              className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Submitted for QA Review</span>
            </Button>
          ) : isRevisionRequested ? (
            <Button
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resubmit for QA Review</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for QA Review</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1.5 Senior QA Revision Request Alert Banner */}
      {isRevisionRequested && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-950 shadow-2xs animate-in fade-in duration-200">
          <RotateCcw className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-900">
              <span>Senior QA Auditor Requested Revision:</span>
              {revisionCategory && (
                <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 text-[10px] font-bold">
                  {revisionCategory}
                </span>
              )}
            </div>
            <p className="text-xs text-rose-800 font-medium leading-relaxed">
              "{revisionInstructions || 'Please review Form 1040 calculations against source documents and resubmit for 4-Eyes audit.'}"
            </p>
          </div>
        </div>
      )}

      {/* 2. Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Profile & Source Document Vault */}
        <div className="lg:col-span-1">
          <ClientProfilePanel
            taxpayer={taxpayer}
            assignedReviewer={assignedReviewer}
            documents={documents}
            standardDeductionAmount={standardDeductionAmount}
            onPreviewDoc={setSelectedDocForPreview}
          />
        </div>

        {/* Right Column: Live Form 1040 Computation Engine */}
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
            isReadOnly={isSubmittedToQA}
            calculations={calculations}
          />
        </div>
      </div>

      {/* 3. Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
      />

      {/* 4. Submit for QA Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={isConfirmOpen}
        title="Submit 1040 Calculation for Senior QA Audit?"
        description={`Are you sure you want to finalize this Form 1040 computation for ${taxpayerName}? It will be dispatched immediately to Senior QA Auditor ${reviewerName} with a computed Federal Refund of $${calculations.federalRefund.toLocaleString()}.`}
        confirmLabel={isSubmitting ? 'Submitting...' : 'Yes, Submit to QA'}
        cancelLabel="Keep Drafting"
        variant="success"
        isLoading={isSubmitting}
        onConfirm={handleSubmitForQA}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
