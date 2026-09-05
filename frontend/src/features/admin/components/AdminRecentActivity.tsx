import React, { useState, useMemo } from 'react';
import { AppPagination } from '@/shared/components/AppPagination';
import { Activity } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const totalItems = activities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return activities.slice(start, start + itemsPerPage);
  }, [activities, currentPage, itemsPerPage]);

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#16A34A]" />
            <span>Recent System Operations &amp; Audit Logs</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time audit log across Documenter, Sales, and Filing queues
          </p>
        </div>
        <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
          System Live ({totalItems} Events)
        </span>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {paginatedActivities.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            No audit log activities recorded yet.
          </div>
        ) : (
          paginatedActivities.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.type === 'success' ? 'bg-[#16A34A]' : 'bg-blue-600'}`}></span>
                <div>
                  <span className="text-slate-900 font-bold block">{item.title}</span>
                  <span className="text-slate-500 text-[11px] font-normal">{item.details}</span>
                </div>
              </div>
              <span className="text-slate-400 text-[11px] shrink-0 font-medium">
                {formatTime(item.time)}
              </span>
            </div>
          ))
        )}
      </div>

      {totalItems > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            perPageOptions={[5, 10, 20, 50]}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(perPage) => {
              setItemsPerPage(perPage);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
