import React from 'react';
import { Plus, type LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

export interface AppEmptyStateProps {
  icon: LucideIcon;
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
  icon: IconComponent,
  title,
  description,
  className,
  action,
  secondaryAction,
}) => {
  return (
    <div className={cn(
      "w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-gray-200/80 shadow-sm transition-all duration-300 hover:border-gray-300",
      className
    )}>
      {/* Animated Pulsing Icon Ring */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-50 animate-ping opacity-60 scale-75 duration-1000" />
        <div className="relative w-14 h-14 rounded-full bg-indigo-50/80 border border-indigo-100/60 text-indigo-600 flex items-center justify-center shadow-sm">
          <IconComponent className="w-6 h-6 stroke-[1.8]" />
        </div>
      </div>

      {/* Texts */}
      <h3 className="text-lg font-bold text-gray-900 tracking-tight font-sans">{title}</h3>
      <p className="text-sm text-gray-500 max-w-[320px] mt-1.5 font-sans leading-relaxed">
        {description}
      </p>

      {/* Call to Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="h-9 px-4 rounded-lg text-sm font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-sans"
            >
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              onClick={action.onClick}
              className="h-9 px-4 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors font-sans gap-1.5"
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
