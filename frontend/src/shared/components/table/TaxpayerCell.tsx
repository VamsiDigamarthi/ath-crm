import React from 'react';

interface TaxpayerCellProps {
  name: string;
  email?: string;
  subText?: string;
  className?: string;
}

export const TaxpayerCell: React.FC<TaxpayerCellProps> = ({
  name,
  email,
  subText,
  className = '',
}) => {
  const secondaryText = email || subText || '';

  return (
    <div className={`flex flex-col min-w-0 text-left py-0.5 ${className}`}>
      <span className="text-xs font-semibold text-slate-900 truncate leading-snug">
        {name || 'Unknown'}
      </span>
      {secondaryText && (
        <span className="text-[11px] font-normal text-slate-500 truncate leading-snug">
          {secondaryText}
        </span>
      )}
    </div>
  );
};
