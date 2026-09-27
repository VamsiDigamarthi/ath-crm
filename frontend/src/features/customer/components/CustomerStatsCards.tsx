import React from 'react';
import { 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerStatsCardsProps {
  activeFilingsCount: number;
  completedFilingsCount: number;
  totalRefund: number;
  totalBalanceDue?: number;
  isConvertedCustomer?: boolean;
  activeTaxYear?: number | string;
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({
  activeFilingsCount = 0,
  completedFilingsCount = 0,
  totalRefund = 0,
  totalBalanceDue = 0,
  activeTaxYear = 2025,
}) => {
  const navigate = useNavigate();
  const isBalanceDue = totalBalanceDue > 0 && totalRefund === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {/* Card 1: Active Filings */}
      <div 
        onClick={() => navigate('/customer/organizer')}
        className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[125px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-black block">
              Active Filings
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-black mt-1 tracking-tight">
              {activeFilingsCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-300 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4 text-emerald-700" />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-black font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>TY {activeTaxYear} in progress</span>
          </div>
          <span className="text-[#16A34A] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            View Details <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Card 2: Total Estimated Refund / Balance Due */}
      <div 
        onClick={() => navigate('/customer/documents')}
        className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[125px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-black block">
              {isBalanceDue ? 'Total Balance Due' : 'Total Estimated Refund'}
            </span>
            <div className={`text-2xl sm:text-3xl font-bold mt-1 tracking-tight ${
              isBalanceDue ? 'text-amber-700' : 'text-[#16A34A]'
            }`}>
              {isBalanceDue ? `-$${totalBalanceDue.toLocaleString()}` : `+$${totalRefund.toLocaleString()}`}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold border group-hover:scale-105 transition-transform ${
            isBalanceDue 
              ? 'bg-amber-50 text-amber-700 border-amber-300' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
          }`}>
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200 flex items-center justify-end text-xs">
          <span className="text-[#16A34A] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Claimed Deductions <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Card 3: Completed Filings */}
      <div 
        onClick={() => navigate('/customer/documents')}
        className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[125px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-black block">
              Completed Filings
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-black mt-1 tracking-tight">
              {completedFilingsCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-300 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200 flex items-center justify-end text-xs">
          <span className="text-blue-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Vault Archive <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
