import { Button } from '@/shared/components/Button';
import { ShieldCheck, FileSpreadsheet, LogOut } from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';

interface AdminHeaderProps {
  userEmail?: string | null;
  userRole?: string;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  userEmail,
  userRole = 'ADMIN',
  onLogout,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center text-white font-bold">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-slate-900 tracking-tight">
              TaxCRM Engine
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#16A34A]" /> Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Admin Operations Console</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-800">
            {userEmail || 'admin@taxcrm.com'}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
            Role: {userRole}
          </p>
        </div>

        <NotificationBellPopover />

        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 text-xs flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </Button>
      </div>
    </header>
  );
};
