import React from 'react';
import { 
  Flame, 
  AlertTriangle, 
  ArrowUpCircle, 
  MinusCircle, 
  ArrowDownCircle, 
  CircleDot 
} from 'lucide-react';

export type ApplicationPriority = 
  | 'URGENT' 
  | 'IMPORTANT' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW' 
  | 'NO_PRIORITY';

interface PriorityBadgeProps {
  priority?: ApplicationPriority | string | null;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const norm = (priority || 'NO_PRIORITY').toUpperCase();

  const getBadgeConfig = () => {
    switch (norm) {
      case 'URGENT':
        return {
          label: 'Urgent',
          classes: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80',
          dotColor: 'bg-rose-500',
          icon: Flame,
          iconColor: 'text-rose-600',
        };
      case 'IMPORTANT':
        return {
          label: 'Important',
          classes: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/80',
          dotColor: 'bg-amber-500',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
        };
      case 'HIGH':
        return {
          label: 'High',
          classes: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/80',
          dotColor: 'bg-purple-500',
          icon: ArrowUpCircle,
          iconColor: 'text-purple-600',
        };
      case 'MEDIUM':
        return {
          label: 'Medium',
          classes: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80',
          dotColor: 'bg-blue-500',
          icon: MinusCircle,
          iconColor: 'text-blue-600',
        };
      case 'LOW':
        return {
          label: 'Low',
          classes: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80',
          dotColor: 'bg-slate-400',
          icon: ArrowDownCircle,
          iconColor: 'text-slate-500',
        };
      case 'NO_PRIORITY':
      default:
        return {
          label: 'No Priority',
          classes: 'bg-slate-50/60 text-slate-400 border-dashed border-slate-200',
          dotColor: 'bg-slate-300',
          icon: CircleDot,
          iconColor: 'text-slate-400',
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1',
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-1.5',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border transition-colors shadow-2xs whitespace-nowrap ${sizeClasses} ${config.classes} ${className}`}
      title={`Application Priority: ${config.label}`}
    >
      {showIcon && <IconComponent className={`${iconSizes} ${config.iconColor} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
