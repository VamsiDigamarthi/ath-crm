import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { Button } from '@/shared/components/Button';
import { AppTable } from '@/shared/components/AppTable';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
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

export const DashboardScreen = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const columns = [
    { header: 'Case ID', accessorKey: 'id' as keyof MockLead, sortable: true, cellClassName: 'font-mono text-xs font-bold text-indigo-600' },
    { header: 'Taxpayer Client', accessorKey: 'name' as keyof MockLead, sortable: true, cellClassName: 'font-semibold text-gray-900' },
    { header: 'Contact Email', accessorKey: 'email' as keyof MockLead },
    { header: 'Tax Year', accessorKey: 'taxYear' as keyof MockLead, cellClassName: 'font-bold text-gray-700' },
    {
      header: 'Workflow Stage',
      accessorKey: 'stage' as keyof MockLead,
      render: (item: MockLead) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Clock className="w-3 h-3" />
          {item.stage}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof MockLead,
      render: (item: MockLead) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 className="w-3 h-3" />
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight font-mono">TaxCRM Engine</h1>
            <p className="text-[11px] text-slate-400">Operations & Workflow Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-200">{user?.email || user?.phone || 'Operator'}</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Role: {user?.role || 'SUPER_ADMIN'}
            </span>
          </div>

          {user?.role === 'ADMIN' && (
            <Button size="sm" variant="outline" onClick={() => navigate('/admin')} className="text-white border-slate-700 hover:bg-slate-800">
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
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">128</div>
              <div className="text-xs text-gray-500 font-medium">Active Tax Applications</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">94</div>
              <div className="text-xs text-gray-500 font-medium">Completed Filings</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">22</div>
              <div className="text-xs text-gray-500 font-medium">In Sales Pitch</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">12</div>
              <div className="text-xs text-gray-500 font-medium">Pending E-File CPA</div>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Active Tax Filing Pipeline</h2>
            <p className="text-sm text-gray-500">Real-time status across Documenter, Sales, and CPA File Operator segments.</p>
          </div>

          <Button size="md" variant="primary">
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Filing Case
          </Button>
        </div>

        {/* Reusable AppTable Display */}
        <AppTable<MockLead>
          title="Tax Applications Registry"
          description="Click any row to open customer tax vault and stage notes."
          columns={columns}
          data={MOCK_LEADS}
          searchable
          exportable
          exportFilename="tax_applications_export"
          density="comfortable"
          striped
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
