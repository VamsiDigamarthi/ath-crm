import React from 'react';
import { CheckCircle2, Send, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export interface FilingActivityEvent {
  id: string;
  type: 'ACCEPTED' | 'TRANSMITTED' | 'ASSIGNED' | 'VALIDATED';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
}

export interface FilingSpecialistActivityFeedProps {
  activities?: FilingActivityEvent[];
  onGoToQueue: () => void;
}

export const FilingSpecialistActivityFeed: React.FC<FilingSpecialistActivityFeedProps> = ({
  activities = [],
  onGoToQueue,
}) => {
  const defaultActivities: FilingActivityEvent[] = activities.length > 0 ? activities : [
    {
      id: '1',
      type: 'ASSIGNED',
      title: 'Return Assigned to You',
      description: 'Taxpayer Rahul Choudhury TY2025 Form 1040 assigned by Filing Manager.',
      timestamp: '10 mins ago',
      badge: 'E-File Ready',
    },
    {
      id: '2',
      type: 'VALIDATED',
      title: 'MeF XML Schema Validated',
      description: 'Schema version 2025.5 passed IRS Schematron business rules.',
      timestamp: '25 mins ago',
      badge: 'Schema 100%',
    },
    {
      id: '3',
      type: 'ACCEPTED',
      title: 'EFIN Gateway Connected',
      description: 'Authorized ERO Gateway #582910 live with IRS Modernized e-File.',
      timestamp: '1 hour ago',
      badge: 'ERO Live',
    },
  ];

  const getIcon = (type: FilingActivityEvent['type']) => {
    if (type === 'ACCEPTED') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />;
    }
    if (type === 'TRANSMITTED') {
      return <Send className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (type === 'VALIDATED') {
      return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
    }
    return <Clock className="w-3.5 h-3.5 text-amber-600" />;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              IRS Transmission Activity Feed
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit trail of MeF transmissions and IRS Ack events.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onGoToQueue}
          className="text-xs text-[#16A34A] hover:bg-emerald-50 font-bold p-1 cursor-pointer"
        >
          <span>View All</span>
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {defaultActivities.map((act) => (
          <div key={act.id} className="py-3 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(act.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {act.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {act.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {act.description}
              </p>
              {act.badge && (
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {act.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
