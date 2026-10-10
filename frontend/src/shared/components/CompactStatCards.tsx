import React from 'react';

export interface CompactStatCard {
  name: string;
  value: number | string;
  hint?: string;
  /** Text color for the number, e.g. 'text-blue-700' */
  tone?: string;
}

/** Small summary cards row (same size as the Follow-Ups cards) */
export const CompactStatCards: React.FC<{ cards: CompactStatCard[] }> = ({ cards }) => (
  <div
    className={`grid grid-cols-2 gap-3 ${
      cards.length === 3 ? 'lg:grid-cols-3' : cards.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
    }`}
  >
    {cards.map((c) => (
      <div key={c.name} className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
        <p className="text-xs text-slate-500">{c.name}</p>
        <p className={`text-xl font-bold mt-0.5 ${c.tone || 'text-slate-900'}`}>{c.value}</p>
        {c.hint && <p className="text-[11px] text-slate-400 mt-0.5">{c.hint}</p>}
      </div>
    ))}
  </div>
);
