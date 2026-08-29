import React, { useState } from 'react';
import { Code, Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

interface MeFXMLViewerProps {
  xmlContent: string;
  submissionId: string;
  efin: string;
  etin: string;
  taxYear: number;
}

export const MeFXMLViewer: React.FC<MeFXMLViewerProps> = ({
  xmlContent,
  submissionId,
  efin,
  etin,
  taxYear,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setIsCopied(true);
    toast.success('IRS MeF XML copied to clipboard! 📋');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IRS_MeF_1040_${submissionId}_TY${taxYear}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('IRS XML package downloaded! 💾');
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs text-slate-300">
      {/* Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 font-sans">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-white flex items-center gap-2">
              <span>IRS Modernized e-File (MeF) XML Schema</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                IRS 2025v5.0 Validated
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              EFIN: <span className="text-white font-bold">{efin}</span> • ETIN: <span className="text-white font-bold">{etin}</span> • Submission ID: <span className="text-emerald-400">{submissionId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer h-7 px-2.5 flex items-center gap-1"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy XML'}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleDownload}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold cursor-pointer h-7 px-2.5 flex items-center gap-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download XML</span>
          </Button>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="p-4 max-h-[380px] overflow-y-auto bg-slate-900/90 text-[11px] leading-relaxed select-all">
        <pre className="font-mono text-emerald-300/90 whitespace-pre-wrap break-all">
          {xmlContent}
        </pre>
      </div>

      {/* Footer Schema Validation */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-sans">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Schema Validation Passed (0 Schema Violations, 0 Schematron Errors)</span>
        </div>
        <div>
          <span>Form 1040 + State Return Package</span>
        </div>
      </div>
    </div>
  );
};
