import React from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  BadgeCheck,
  Shield,
  Award,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const AuthBrandShowcase: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-7/12 relative flex-col justify-between p-8 xl:p-10 bg-slate-950 border-r border-slate-800/80 h-full select-none">
      
      {/* Brand Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center text-white">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">TaxCRM</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Professional Tax Operations Solutions</p>
          </div>
        </div>

        {/* Live Network Operational Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>IRS E-File Portal Active</span>
        </div>
      </div>

      {/* Center Feature Pitch */}
      <div className="relative z-10 max-w-xl my-auto py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Professional Tax Solution Suite
        </div>

        <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-snug mb-4">
          Accurate, CPA-Backed Tax Preparation & Filing.
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Our expert CPAs deliver the tax refunds you deserve with audit protection, transparent pricing, and zero hidden fees.
        </p>

        {/* Value Badges Row */}
        <div className="flex flex-wrap gap-3 mb-6 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <BadgeCheck className="w-4 h-4 text-[#16A34A]" /> No Hidden Fees
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <Shield className="w-4 h-4 text-[#16A34A]" /> Audit Protection
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <Award className="w-4 h-4 text-[#16A34A]" /> Max Refund Guarantee
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">$48.5M+</div>
            <div className="text-[11px] text-slate-400">Refunds Processed</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">99.8%</div>
            <div className="text-[11px] text-slate-400">Compliance Rate</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">AES-256</div>
            <div className="text-[11px] text-slate-400">Encrypted Vault</div>
          </div>
        </div>
      </div>

      {/* Footer Feature Highlights */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Smart Deduplication</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Dynamic Correction Loops</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Multi-Year Access</span>
        </div>
        <span>© 2026 TaxCRM Platform</span>
      </div>
    </div>
  );
};
