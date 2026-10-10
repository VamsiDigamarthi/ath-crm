import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { HeaderUserProfile } from '@/shared/components/HeaderUserProfile';
import { Button } from '@/shared/components/Button';
import { CreateNewFilingModal } from '../components/CreateNewFilingModal';
import {
  LayoutDashboard,
  FileText,
  Bell,
  User,
  Plus,
  Receipt,
} from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('');
  const [isNewFilingModalOpen, setIsNewFilingModalOpen] = useState<boolean>(false);
  
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
    } else {
      setSelectedTaxYear('');
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
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/customer' 
    },
    { 
      id: 'customer_filings', 
      label: 'My Filings', 
      icon: FileText, 
      path: '/customer/filings' 
    },
    {
      id: 'customer_billing',
      label: 'Billing & Invoices',
      icon: Receipt,
      path: '/customer/billing',
    },
    { 
      id: 'customer_notifications', 
      label: 'Notifications', 
      icon: Bell, 
      badge: unreadCount > 0 ? String(unreadCount) : undefined, 
      path: '/customer/notifications' 
    },
  ];

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/customer/notifications')) return 'customer_notifications';
    if (currentPath.includes('/customer/billing')) return 'customer_billing';
    if (currentPath.includes('/customer/filings')) return 'customer_filings';
    if (currentPath.includes('/customer/organizer')) return 'customer_filings';
    return 'customer_dashboard';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. AppSidebar matching Admin & Manager level UI/UX */}
      <AppSidebar
        width={240}
        variant="dark"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isConvertedCustomer ? 'Customer Tax Portal' : 'Prospect Intake Portal',
          logo: (
            <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <User className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        showLogoutOnly={true}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-end px-6 bg-white border-b border-slate-300 shrink-0 gap-3">
          {/* New Filing Trigger Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsNewFilingModalOpen(true)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer border border-emerald-700 px-3.5 py-1.5 rounded-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Filing</span>
          </Button>

          <NotificationBellPopover />

          {/* Reusable Header User Profile Pill */}
          <HeaderUserProfile name={taxpayerName} email={taxpayerEmail} />
        </header>

        {/* Dynamic Screen Viewport with balanced clean padding */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ selectedTaxYear, isConvertedCustomer, customerProfile, user }} />
        </main>
      </div>

      {/* Create New Filing Modal */}
      <CreateNewFilingModal
        isOpen={isNewFilingModalOpen}
        onClose={() => setIsNewFilingModalOpen(false)}
        existingApplications={applications}
      />
    </div>
  );
};
