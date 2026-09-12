import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface AppTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  tabClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const AppTabs: React.FC<AppTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  tabClassName = '',
  size = 'md',
  fullWidth = false,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-5 py-3 text-sm sm:text-base',
  };

  return (
    <div
      className={`flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-2 border-b-2 font-semibold whitespace-nowrap transition-colors duration-150 shrink-0
              ${sizeClasses[size]}
              ${
                isActive
                  ? 'border-[#16A34A] text-[#16A34A] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed hover:border-transparent hover:text-slate-500' : 'cursor-pointer'}
              ${fullWidth ? 'flex-1 text-center' : ''}
              ${tabClassName}
            `}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
};
