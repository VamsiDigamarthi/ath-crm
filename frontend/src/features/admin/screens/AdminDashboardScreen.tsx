import React from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { AdminStatsOverview } from '../components/AdminStatsOverview';
import { AdminRecentActivity } from '../components/AdminRecentActivity';
import { BulkLeadImportScreen } from './BulkLeadImportScreen';
import { EmployeeManagementScreen } from './EmployeeManagementScreen';
import { DocumenterDepartmentScreen } from '@/features/documenter/screens/DocumenterDepartmentScreen';
import { FileSpreadsheet, ShieldCheck, LogOut, Bell } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export const AdminDashboardScreen: React.FC = () => {
  const {
    user,
    navItems,
    activeTab,
    setActiveTab,
    stats,
    recentActivity,
    handleLogout,
  } = useAdminDashboard();

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'employees':
        return 'Staff & Team Directory';
      case 'prospects':
        return 'Bulk Lead Import & Deduplication';
      case 'documenter':
        return 'Documenter Department Queue';
      case 'sales':
        return 'Sales Pitches & Quotations';
      case 'filing':
        return 'File Operator & CPA E-Filing';
      case 'settings':
        return 'System Settings';
      case 'dashboard':
      default:
        return 'Operations Dashboard';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
      {/* Compact Width Left Sidebar with aligned h-16 Brand header */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: 'Tax Filing Operations',
          logo: (
            <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeTab}
        onItemClick={(id) => setActiveTab(id)}
        user={{
          name: user?.email?.split('@')[0] || 'Super Admin',
          email: user?.email || user?.mobile || 'admin@taxcrm.com',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`,
        }}
        onUserClick={handleLogout}
      />

      {/* Right Container (Header + Content Body) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Header Bar aligned to h-16 so bottom border matches Sidebar Brand line */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-base text-slate-900">
              {getHeaderTitle()}
            </h1>
            <span className="text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#16A34A]" /> Super Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg p-2"
            >
              <Bell className="w-4 h-4 text-slate-500" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 text-xs flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </header>

        {/* Scrollable Right Main Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {activeTab === 'employees' ? (
            <EmployeeManagementScreen />
          ) : activeTab === 'prospects' ? (
            <BulkLeadImportScreen />
          ) : activeTab === 'documenter' ? (
            <DocumenterDepartmentScreen />
          ) : (
            <>
              {/* Welcome Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-[#16A34A] to-emerald-700 p-6 sm:p-8 text-white border border-emerald-600">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 mb-3">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                    Tax Operations Control Portal
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Welcome back, Admin!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-50 mt-2 leading-relaxed">
                    Manage lead ingestion, department user roles, deduplication rules, and track tax filing operations lifecycle across Documenters, Sales, and File Operators.
                  </p>
                </div>
              </div>

              {/* Stats KPI Overview */}
              <AdminStatsOverview stats={stats} />

              {/* Recent Operations Activity Log */}
              <AdminRecentActivity activities={recentActivity} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};
