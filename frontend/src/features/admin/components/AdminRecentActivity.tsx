import React from 'react';

interface ActivityItem {
  id: string;
  title: string;
  details: string;
  time: string;
  type: string;
}

interface AdminRecentActivityProps {
  activities: ActivityItem[];
}

export const AdminRecentActivity: React.FC<AdminRecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent System Operations</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time audit log across Documenter, Sales, and Filing queues</p>
        </div>
        <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
          System Live
        </span>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {activities.map((item) => (
          <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
              <div>
                <span className="text-slate-900 font-bold block">{item.title}</span>
                <span className="text-slate-500 text-[11px] font-normal">{item.details}</span>
              </div>
            </div>
            <span className="text-slate-400 text-[11px]">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
