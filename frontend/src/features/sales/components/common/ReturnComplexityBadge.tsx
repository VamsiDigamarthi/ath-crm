import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  UserCheck, 
  ChevronRight,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { calculateReturnComplexity, RETURN_COMPLEXITY_TIERS } from '../../utils/complexity-evaluator';
import type { ReturnComplexityInfo, ReturnComplexityTier } from '../../types/complexity.types';

interface ReturnComplexityBadgeProps {
  lead?: any;
  complexityInfo?: ReturnComplexityInfo;
  showDetailsOnHover?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showScoreLabel?: boolean;
  className?: string;
}

export const ReturnComplexityBadge: React.FC<ReturnComplexityBadgeProps> = ({
  lead,
  complexityInfo: explicitInfo,
  showDetailsOnHover = true,
  size = 'md',
  showScoreLabel = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const info: ReturnComplexityInfo = explicitInfo || calculateReturnComplexity(lead);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div className={`relative inline-block font-sans ${className}`} ref={popoverRef}>
      {/* Badge Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title={`Return Complexity: ${info.label} (${info.score}/4) - Click for details`}
        className={`inline-flex items-center rounded-md font-bold border transition-all cursor-pointer select-none hover:shadow-2xs active:scale-95 ${sizeClasses[size]} ${info.badgeBg} ${info.badgeBorder} ${info.badgeText}`}
      >
        <span className={`rounded-full shrink-0 ${dotSizes[size]} ${info.dotColor}`} />
        <span className="font-extrabold">{info.label}</span>
        {showScoreLabel && (
          <span className="opacity-60 text-[9px] font-mono">
            {info.score}/4
          </span>
        )}
      </button>

      {/* Rich Interactive Popover / Rubric Preview */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 left-0 sm:left-auto sm:right-0 mt-1.5 w-80 sm:w-96 p-4 rounded-xl bg-white border border-slate-200 shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${info.dotColor}`} />
                <h4 className="font-extrabold text-xs text-slate-900">
                  Return Complexity: {info.label} (Score: {info.score}/4)
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Evaluated based on schedules, income sources, deductions, and foreign reporting.
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${info.badgeBg} ${info.badgeBorder} ${info.badgeText}`}>
              Level {info.score}
            </span>
          </div>

          {/* Current Lead's Matched Criteria Factors */}
          <div className="py-2.5 border-b border-slate-100 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-slate-400" />
              <span>Detected Complexity Factors:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {info.factors.map((factor, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200"
                >
                  <Check className="w-3 h-3 text-[#16A34A] shrink-0" />
                  <span>{factor}</span>
                </span>
              ))}
            </div>
          </div>

          {/* TL / Manager Assignment Guideline */}
          <div className="my-2.5 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <UserCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Manager / TL Assignment Rule:</span>
            </div>
            <div className="text-emerald-800 font-semibold mt-0.5 pl-5">
              👉 {info.recommendation}
            </div>
          </div>

          {/* Complete 4-Tier Reference Matrix */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Return Complexity Framework</span>
              <span className="text-[9px] font-normal text-slate-400">4-Tier System</span>
            </div>

            <div className="space-y-1 text-[11px]">
              {Object.values(RETURN_COMPLEXITY_TIERS).map((tierDef) => {
                const isActive = tierDef.tier === info.tier;
                return (
                  <div
                    key={tierDef.tier}
                    className={`p-1.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white font-bold ring-1 ring-slate-900'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>{tierDef.dotEmoji}</span>
                        <span className="font-bold text-xs">{tierDef.label}</span>
                      </div>
                      <span className={`text-[10px] ${isActive ? 'text-emerald-300 font-bold' : 'text-slate-500'}`}>
                        → {tierDef.assignmentTarget}
                      </span>
                    </div>
                    <div className={`text-[10px] mt-0.5 pl-5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {tierDef.criteria.join(' • ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
