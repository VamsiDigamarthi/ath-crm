import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { getRoleDefaultRoute } from '@/features/auth/utils/auth-redirect';
import { Button } from '@/shared/components/Button';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import {
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface MockLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxYear: number;
  stage: string;
  status: string;
}

const MOCK_LEADS: MockLead[] = [
  { id: 'TAX-1001', name: 'John Miller', email: 'john.m@gmail.com', phone: '+1 415-555-0192', taxYear: 2024, stage: 'Document Prep', status: 'In Progress' },
  { id: 'TAX-1002', name: 'Sarah Jenkins', email: 'sarah.j@yahoo.com', phone: '+1 415-555-0144', taxYear: 2024, stage: 'Sales Pitch', status: 'Quote Sent' },
  { id: 'TAX-1003', name: 'Robert Chen', email: 'rchen@techcorp.io', phone: '+1 415-555-0188', taxYear: 2024, stage: 'File Operator', status: 'Ready for E-File' },
  { id: 'TAX-1004', name: 'Emily Davis', email: 'emily.d@outlook.com', phone: '+1 415-555-0123', taxYear: 2024, stage: 'Completed', status: 'Filed Successfully' },
];

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (user?.role) {
      const dest = getRoleDefaultRoute(user.role);
      if (dest && dest !== '/dashboard') {
        navigate(dest, { replace: true });
      }
    }
  }, [user?.role, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const columns = useMemo<ColumnDef<MockLead, any>[]>(
    () => [
      {
        id: 'taxpayer',
        header: 'TAXPAYER',
        accessorFn: (row) => `${row.name} ${row.email}`,
        cell: ({ row }) => (
          <TaxpayerCell
            name={row.original.name}
            email={row.original.email}
          />
        ),
      },
      {
        id: 'taxYear',
        header: 'TAX YEAR',
        accessorKey: 'taxYear',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-zinc-900">
            TY{row.original.taxYear}
          </span>
        ),
      },
      {
        id: 'stage',
        header: 'STAGE',
        accessorKey: 'stage',
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.stage}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'STATUS',
        accessorKey: 'status',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            {row.original.status}
          </span>
        ),
      },
    ],
    []
  );

  const handleExport = () => {
    exportTableToExcel(
      MOCK_LEADS,
      [
        { header: 'Taxpayer', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Tax Year', key: 'taxYear' },
        { header: 'Stage', key: 'stage' },
        { header: 'Status', key: 'status' },
      ],
      'tax_filing_pipeline'
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-zinc-900 border-b border-zinc-800 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">TaxCRM Engine</h1>
            <p className="text-[11px] text-zinc-400 font-normal">Operations & Workflow Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-zinc-200">{user?.email || user?.phone || 'Operator'}</span>
            <span className="text-[10px] font-medium text-zinc-400">
              Role: {user?.role || 'SUPER_ADMIN'}
            </span>
          </div>

          {user?.role === 'ADMIN' && (
            <Button size="sm" variant="outline" onClick={() => navigate('/admin')} className="text-white border-zinc-700 hover:bg-zinc-800">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Admin Panel
            </Button>
          )}

          <Button size="sm" variant="danger" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        {/* Welcome & Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-zinc-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900">128</div>
              <div className="text-xs text-zinc-500 font-normal">Active Tax Applications</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900">94</div>
              <div className="text-xs text-zinc-500 font-normal">Completed Filings</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900">22</div>
              <div className="text-xs text-zinc-500 font-normal">In Sales Pitch</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900">12</div>
              <div className="text-xs text-zinc-500 font-normal">Pending E-File CPA</div>
            </div>
          </div>
        </div>

        {/* Unified Table Display */}
        <UnifiedTable<MockLead>
          title="TAX APPLICATIONS REGISTRY"
          subtitle="Real-time status across Documenter, Sales, and CPA File Operator segments."
          data={MOCK_LEADS}
          columns={columns}
          isLoading={false}
          searchPlaceholder="Search leads..."
          onExportExcel={handleExport}
          emptyText="No records found."
        />
      </main>

      {/* Logout Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        description="Are you sure you want to end your current session?"
        confirmLabel="Logout Now"
        variant="danger"
      />
    </div>
  );
};
