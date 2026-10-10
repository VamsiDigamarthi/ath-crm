import React from 'react';

interface ScheduleStatCardsProps {
  label: string; // "callbacks" or "follow-ups"
  stats: { total: number; due: number; missed: number; completed: number };
}

/** Four simple stat cards: Total, Due today, Missed, Completed */
export const ScheduleStatCards: React.FC<ScheduleStatCardsProps> = ({ label, stats }) => {
  const title = label.charAt(0).toUpperCase() + label.slice(1);
  const cards = [
    { name: `Total ${label}`, value: stats.total, hint: 'All scheduled', tone: 'text-slate-900' },
    { name: `${title} due`, value: stats.due, hint: 'Later today', tone: 'text-blue-700' },
    { name: `Missed ${label}`, value: stats.missed, hint: 'Time passed, not called', tone: 'text-rose-600' },
    { name: `Completed ${label}`, value: stats.completed, hint: 'Called after scheduling', tone: 'text-emerald-700' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.name} className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
          <p className="text-xs text-slate-500">{c.name}</p>
          <p className={`text-xl font-bold mt-0.5 ${c.tone}`}>{c.value}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{c.hint}</p>
        </div>
      ))}
    </div>
  );
};
