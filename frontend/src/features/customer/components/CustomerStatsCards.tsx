import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
} from 'lucide-react';
import { type CustomerFilingItem } from '../services/customer-api';

interface CustomerStatsCardsProps {
  activeFilingsCount: number;
  completedFilingsCount: number;
  totalRefund: number;
  totalBalanceDue?: number;
  isConvertedCustomer?: boolean;
  activeTaxYear?: number | string;
  filings?: CustomerFilingItem[];
  availableTaxYears?: number[];
  selectedYearFilter?: number | 'ALL';
  onYearFilterChange?: (year: number | 'ALL') => void;
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({
  activeFilingsCount = 0,
  completedFilingsCount = 0,
  totalRefund = 0,
  totalBalanceDue = 0,
  activeTaxYear = 2025,
  filings = [],
  availableTaxYears: propAvailableYears,
  selectedYearFilter,
  onYearFilterChange,
}) => {
  // Extract only years for which customer has actual tax application records
  const availableYears = useMemo(() => {
    if (propAvailableYears && propAvailableYears.length > 0) {
      return Array.from(new Set(propAvailableYears)).sort((a, b) => b - a);
    }
    const years = filings.map((f) => f.taxYear).filter(Boolean);
    if (years.length > 0) {
      return Array.from(new Set(years)).sort((a, b) => b - a);
    }
    return [Number(activeTaxYear)];
  }, [propAvailableYears, filings, activeTaxYear]);

  const [localYear, setLocalYear] = useState<number | 'ALL'>('ALL');
  const effectiveYear = selectedYearFilter !== undefined ? selectedYearFilter : localYear;

  const handleYearChange = (year: number | 'ALL') => {
    setLocalYear(year);
    if (onYearFilterChange) {
      onYearFilterChange(year);
    }
  };

  // Compute refund and dues based on year filter
  const { filteredRefund, filteredFedRefund, filteredStateRefund, filteredDue, filteredFedDue, filteredStateDue } = useMemo(() => {
    if (effectiveYear === 'ALL') {
      if (filings.length > 0) {
        const sumRefund = filings.reduce((sum, f) => sum + (f.totalRefund || 0), 0);
        const sumFedRefund = filings.reduce((sum, f) => sum + (f.fedRefund || 0), 0);
        const sumStateRefund = filings.reduce((sum, f) => sum + (f.stateRefund || 0), 0);
        const sumDue = filings.reduce((sum, f) => sum + (f.totalBalanceDue || 0), 0);
        const sumFedDue = filings.reduce((sum, f) => sum + (f.fedDue || 0), 0);
        const sumStateDue = filings.reduce((sum, f) => sum + (f.stateDue || 0), 0);
        return {
          filteredRefund: sumRefund || totalRefund,
          filteredFedRefund: sumFedRefund,
          filteredStateRefund: sumStateRefund,
          filteredDue: sumDue || totalBalanceDue,
          filteredFedDue: sumFedDue,
          filteredStateDue: sumStateDue,
        };
      }
      return {
        filteredRefund: totalRefund,
        filteredFedRefund: 0,
        filteredStateRefund: 0,
        filteredDue: totalBalanceDue,
        filteredFedDue: 0,
        filteredStateDue: 0,
      };
    }

    // Specific Year
    const matchingFiling = filings.find((f) => f.taxYear === effectiveYear);
    if (matchingFiling) {
      return {
        filteredRefund: matchingFiling.totalRefund || 0,
        filteredFedRefund: matchingFiling.fedRefund || 0,
        filteredStateRefund: matchingFiling.stateRefund || 0,
        filteredDue: matchingFiling.totalBalanceDue || 0,
        filteredFedDue: matchingFiling.fedDue || 0,
        filteredStateDue: matchingFiling.stateDue || 0,
      };
    }

    return {
      filteredRefund: 0,
      filteredFedRefund: 0,
      filteredStateRefund: 0,
      filteredDue: 0,
      filteredFedDue: 0,
      filteredStateDue: 0,
    };
  }, [effectiveYear, filings, totalRefund, totalBalanceDue]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Active Filings */}
      <div className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs flex flex-col justify-between min-h-[115px]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-black block">
              Active Filings
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-black mt-1 tracking-tight">
              {activeFilingsCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-300 shrink-0">
            <Clock className="w-4 h-4 text-emerald-700" />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200 flex items-center gap-1.5 text-xs text-black font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>TY {activeTaxYear} in progress</span>
        </div>
      </div>

      {/* Card 2: Total Estimated Refund */}
      <div className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs flex flex-col justify-between min-h-[115px]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-bold text-black block truncate">
              Total Estimated Refund
            </span>
            <div className={`text-2xl sm:text-3xl font-bold mt-1 tracking-tight truncate ${
              filteredRefund > 0 ? 'text-[#16A34A]' : 'text-slate-900'
            }`}>
              ${filteredRefund.toLocaleString()}
            </div>
          </div>

          <div className="shrink-0">
            {availableYears.length > 0 && (
              <select
                value={effectiveYear}
                onChange={(e) => handleYearChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                title="Filter refund by tax year"
                aria-label="Filter refund by tax year"
                className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="ALL">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>TY {yr}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200 text-xs text-black font-semibold truncate">
          {filteredRefund > 0 ? (
            <span>Fed: ${filteredFedRefund.toLocaleString()} | State: ${filteredStateRefund.toLocaleString()}</span>
          ) : (
            <span>{effectiveYear === 'ALL' ? 'Federal & State Combined' : `TY ${effectiveYear} Calculation Pending`}</span>
          )}
        </div>
      </div>

      {/* Card 3: Dues / Amount Client Has to Pay */}
      <div className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs flex flex-col justify-between min-h-[115px]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-bold text-black block truncate">
              Dues
            </span>
            <div className={`text-2xl sm:text-3xl font-bold mt-1 tracking-tight truncate ${
              filteredDue > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}>
              ${filteredDue.toLocaleString()}
            </div>
          </div>

          <div className="shrink-0">
            {availableYears.length > 0 && (
              <select
                value={effectiveYear}
                onChange={(e) => handleYearChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                title="Filter dues by tax year"
                aria-label="Filter dues by tax year"
                className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="ALL">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>TY {yr}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200 text-xs text-black font-semibold truncate">
          {filteredDue > 0 ? (
            <span className="text-amber-800">Fed: ${filteredFedDue.toLocaleString()} | State: ${filteredStateDue.toLocaleString()}</span>
          ) : (
            <span className="text-slate-600">{effectiveYear === 'ALL' ? 'No Outstanding Dues' : `TY ${effectiveYear}: $0 Owed`}</span>
          )}
        </div>
      </div>

      {/* Card 4: Completed Filings */}
      <div className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs flex flex-col justify-between min-h-[115px]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-black block">
              Completed Filings
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-black mt-1 tracking-tight">
              {completedFilingsCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-300 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200 text-xs text-black font-semibold">
          <span>Lifetime Filed Returns</span>
        </div>
      </div>
    </div>
  );
};
