import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import { CustomerTaxYearDropdown } from '../components/CustomerTaxYearDropdown';
import {
  LayoutDashboard,
  CheckSquare,
  FolderArchive,
  CreditCard,
  LogOut,
  Bell,
  User,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('2025');
  
  // Real DB value from backend/prisma/schema/customer.prisma: customerProfile.isConvertedCustomer
  const customerProfile = user?.customerProfile;
  const isConvertedCustomer = Boolean(customerProfile?.isConvertedCustomer);

  // Derive available multi-year filings from customerProfile applications
  const applications = useMemo(() => customerProfile?.applications || [], [customerProfile?.applications]);

  // Set default selected tax year to the most recent application when user data loads
  useEffect(() => {
    if (applications.length > 0) {
      const hasCurrent = applications.some((a: any) => a.taxYear.toString() === selectedTaxYear);
      if (!hasCurrent) {
        setSelectedTaxYear(applications[0].taxYear.toString());
      }
    }
  }, [applications]);


  const taxpayerName = customerProfile?.firstName
    ? `${customerProfile.firstName} ${customerProfile.lastName || ''}`.trim()
    : user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Taxpayer';

  const taxpayerEmail = customerProfile?.email || user?.email || '-';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  const navItems = [
    { 
      id: 'customer_dashboard', 
      label: 'Tax Filing Hub', 
      icon: LayoutDashboard, 
      section: 'Tax Filing Workspace', 
      badge: isConvertedCustomer ? 'Filed & Paid' : 'Active: Prep',
      path: '/customer' 
    },
    { 
      id: 'customer_organizer', 
      label: 'Tax Organizer', 
      icon: CheckSquare, 
      section: 'Tax Filing Workspace', 
      badge: isConvertedCustomer ? '100%' : '85%', 
      path: '/customer/organizer' 
    },
    { 
      id: 'customer_documents', 
      label: 'Documents Vault', 
      icon: FolderArchive, 
      section: 'Financials & Vault', 
      badge: isConvertedCustomer ? '5 Files (1040 Unlocked)' : '3 Files (Intake)', 
      path: '/customer/documents' 
    },
    { 
      id: 'customer_billing', 
      label: 'Quotations & Invoices', 
      icon: CreditCard, 
      section: 'Financials & Vault', 
      badge: isConvertedCustomer ? 'Paid Receipt' : '$199 Quote', 
      path: '/customer/billing' 
    },
    { 
      id: 'customer_notifications', 
      label: 'Notifications', 
      icon: Bell, 
      section: 'Financials & Vault', 
      badge: unreadCount > 0 ? String(unreadCount) : undefined, 
      path: '/customer/notifications' 
    },
  ];

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/customer/notifications')) return 'customer_notifications';
    if (currentPath.includes('/customer/organizer')) return 'customer_organizer';
    if (currentPath.includes('/customer/documents')) return 'customer_documents';
    if (currentPath.includes('/customer/billing')) return 'customer_billing';
    return 'customer_dashboard';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  const getHeaderTitle = () => {
    switch (activeId) {
      case 'customer_organizer':
        return 'Tax Organizer';
      case 'customer_documents':
        return 'Multi-Year Tax Document Vault & Downloads';
      case 'customer_billing':
        return 'Quotation Approvals, Invoices & Payment Receipts';
      case 'customer_dashboard':
      default:
        return 'Taxpayer Client Overview & Return Lifecycle';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. AppSidebar matching Admin & Manager level UI/UX */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isConvertedCustomer ? 'Customer Tax Portal' : 'Prospect Intake Portal',
          logo: (
            <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <User className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        user={{
          name: taxpayerName,
          email: taxpayerEmail,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${taxpayerEmail}`,
        }}
        onUserClick={handleLogout}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Header Bar matching Admin/Manager */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-base text-slate-900 leading-tight">
              {getHeaderTitle()}
            </h1>
            {isConvertedCustomer ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> Converted Customer (Paid)
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-500" /> Prospective Client (Intake)
              </span>
            )}
          </div>

          {/* Center/Right: Tax Year Switcher & Global Actions */}
          <div className="flex items-center gap-2.5">
            {/* All-in-one Tax Year Dropdown with Top Add Year Field */}
            <CustomerTaxYearDropdown
              selectedTaxYear={selectedTaxYear}
              onSelectTaxYear={setSelectedTaxYear}
              applications={applications}
            />

            <NotificationBellPopover />

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Screen Viewport with real isConvertedCustomer passed to all screens */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet context={{ selectedTaxYear, isConvertedCustomer, customerProfile, user }} />
        </main>
      </div>
    </div>
  );
};
