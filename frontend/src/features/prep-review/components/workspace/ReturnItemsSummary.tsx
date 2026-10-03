import React, { useEffect, useState } from 'react';
import { returnItemsService, type ReturnItemsResponse } from '../../services/return-items-service';

interface ReturnItemsSummaryProps {
  applicationId?: string;
}

const money = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ReturnItemsSummary: React.FC<ReturnItemsSummaryProps> = ({ applicationId }) => {
  const [data, setData] = useState<ReturnItemsResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;
    returnItemsService
      .list(applicationId)
      .then((res) => !cancelled && setData(res.data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  if (failed) return <div className="text-sm text-rose-600">Could not load services & pricing.</div>;
  if (!data) return <div className="h-20 rounded-lg bg-slate-100 animate-pulse" />;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-900">
        Services & pricing
      </div>
      {data.items.length === 0 ? (
        <div className="px-3.5 py-4 text-sm text-slate-500">No services added to this return yet.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.items.map((item) => (
            <li key={item.id} className="px-3.5 py-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-800 truncate">
                {item.name}
                <span className="text-slate-400">
                  {' '}
                  · {item.quantity} × {money(item.unitPrice)}
                </span>
              </span>
              <span className="font-medium text-slate-900 shrink-0">{money(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="px-3.5 py-2.5 border-t border-slate-200 space-y-1 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>Subtotal</dt>
          <dd>{money(data.totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>Tax</dt>
          <dd>{money(data.totals.tax)}</dd>
        </div>
        <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-100">
          <dt>Total</dt>
          <dd>{money(data.totals.total)}</dd>
        </div>
      </dl>
    </div>
  );
};
