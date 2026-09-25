import React from 'react';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import type { ClientPaymentStatus } from '../types/payment-status.types';
import { evaluateClientPaymentStatus } from '../utils/payment-status-evaluator';

export interface ClientPaymentStatusChipProps {
  status?: ClientPaymentStatus | null;
  lead?: any;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const ClientPaymentStatusChip: React.FC<ClientPaymentStatusChipProps> = ({
  status: statusProp,
  lead,
  size = 'xs',
  showIcon = true,
  className = '',
}) => {
  const resolvedStatus: ClientPaymentStatus = 
    statusProp || (lead ? evaluateClientPaymentStatus(lead) : 'NEW');

  const getConfig = () => {
    switch (resolvedStatus) {
      case 'PAID':
        return {
          label: 'PAID',
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs hover:bg-emerald-100/80',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
          tooltip: 'Retained Client • Paid Service Fee / Prior IRS Filing',
        };
      case 'NEW':
        return {
          label: 'NEW',
          classes: 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs hover:bg-blue-100/80',
          icon: Sparkles,
          iconColor: 'text-blue-600',
          tooltip: 'Fresh Ingested Lead • 1st Time Client Intake',
        };
      case 'UNPAID':
      default:
        return {
          label: 'UNPAID',
          classes: 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs hover:bg-amber-100/80',
          icon: Clock,
          iconColor: 'text-amber-600',
          tooltip: 'Payment Pending • Active Return Draft / Pitch',
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] font-extrabold gap-1 rounded-full',
    sm: 'px-2.5 py-0.5 text-[11px] font-extrabold gap-1.5 rounded-full',
    md: 'px-3 py-1 text-xs font-extrabold gap-1.5 rounded-full',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center border tracking-tight transition-all duration-150 whitespace-nowrap cursor-default ${sizeClasses} ${config.classes} ${className}`}
      title={config.tooltip}
    >
      {showIcon && <IconComponent className={`${iconSizes} ${config.iconColor} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
