import React from 'react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';

interface ClientNameCellProps {
  name: string;
  subText?: string;
  badge?: React.ReactNode;
  className?: string;
}

export const ClientNameCell: React.FC<ClientNameCellProps> = ({
  name,
  subText,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 min-w-0 ${className}`}>
      <span className="text-xs font-semibold text-slate-900 truncate">
        {name || '—'}
      </span>
      {subText && (
        <span className="text-[11px] text-slate-400 truncate">({subText})</span>
      )}
      {badge}
    </div>
  );
};

interface ClientEmailCellProps {
  email?: string | null;
  className?: string;
}

export const ClientEmailCell: React.FC<ClientEmailCellProps> = ({
  email,
  className = '',
}) => {
  const cleanEmail = email?.trim();
  if (!cleanEmail || cleanEmail === '-' || cleanEmail === '—') {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs text-slate-700 min-w-0 max-w-[220px] ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="truncate" title={cleanEmail}>
        {cleanEmail}
      </span>
      <AppCopyButton
        text={cleanEmail}
        size="sm"
        className="h-5.5 w-5.5 p-0.5 border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 shrink-0"
        tooltip="Copy email"
      />
    </div>
  );
};

interface ClientPhoneCellProps {
  phone?: string | null;
  className?: string;
}

export const ClientPhoneCell: React.FC<ClientPhoneCellProps> = ({
  phone,
  className = '',
}) => {
  const cleanPhone = phone?.trim();
  if (!cleanPhone || cleanPhone === '-' || cleanPhone === '—') {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs text-slate-700 min-w-0 whitespace-nowrap ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="font-normal" title={cleanPhone}>
        {cleanPhone}
      </span>
      <AppCopyButton
        text={cleanPhone}
        size="sm"
        className="h-5.5 w-5.5 p-0.5 border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 shrink-0"
        tooltip="Copy phone"
      />
    </div>
  );
};
