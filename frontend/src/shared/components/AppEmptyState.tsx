import React from 'react';
import { Plus, type LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

export interface AppEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  icon: IconComponent = Plus,
  title,
  description,
  className,
  action,
  secondaryAction,
}) => {
  return (
    <div className={cn(
      "w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-md border border-dashed border-slate-300 shadow-2xs transition-all duration-300 hover:border-slate-400",
      className
    )}>
      {/* Animated Pulsing Icon Ring */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-50 animate-ping opacity-60 scale-75 duration-1000" />
        <div className="relative w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center shadow-xs">
          <IconComponent className="w-6 h-6 stroke-[1.8]" />
        </div>
      </div>

      {/* Texts */}
      <h3 className="text-lg font-bold text-black tracking-tight font-sans">{title}</h3>
      <p className="text-sm text-slate-700 max-w-[320px] mt-1.5 font-sans leading-relaxed font-medium">
        {description}
      </p>

      {/* Call to Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="h-9 px-4 rounded-md text-sm font-bold border-slate-300 text-black hover:bg-slate-50 transition-colors font-sans"
            >
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              onClick={action.onClick}
              className="h-9 px-4 rounded-md text-sm font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs transition-colors font-sans gap-1.5"
            >
              {action.icon ? (
                React.createElement(action.icon, { className: "w-4 h-4" })
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
