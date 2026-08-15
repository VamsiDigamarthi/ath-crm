import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  DollarSign,
  FileCheck,
  UserPlus,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const useAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('employees');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Main' },
    { id: 'prospects', label: 'Bulk Lead Import', icon: FileSpreadsheet, section: 'Operations', badge: '1,248' },
    { id: 'employees', label: 'Team & Staff', icon: UserPlus, section: 'Management', badge: '8' },
    { id: 'documenter', label: 'Documenter Dept', icon: Users, section: 'Operations', badge: '432' },
    { id: 'sales', label: 'Sales Pitches', icon: DollarSign, section: 'Operations', badge: '289' },
    { id: 'filing', label: 'File Operator', icon: FileCheck, section: 'Operations', badge: '527' },
    { id: 'settings', label: 'System Settings', icon: Settings, section: 'Admin' },
  ];

  const stats = [
    {
      title: 'Total Prospects',
      value: '1,248',
      description: '+12% from bulk CSV import',
      trend: 'up',
      badgeColor: 'emerald',
    },
    {
      title: 'Documenter Queue',
      value: '432',
      description: 'Outreach & Tax Prep',
      trend: 'neutral',
      badgeColor: 'blue',
    },
    {
      title: 'Sales Pitches',
      value: '289',
      description: 'Active Fee Quotes',
      trend: 'neutral',
      badgeColor: 'purple',
    },
    {
      title: 'Completed Filings',
      value: '527',
      description: 'Converted Customers',
      trend: 'up',
      badgeColor: 'emerald',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      title: 'Bulk Lead Import Executed',
      details: '150 records processed, 12 duplicates skipped',
      time: '10 mins ago',
      type: 'success',
    },
    {
      id: '2',
      title: 'Documenter Agent Assigned',
      details: 'Application #TAX-2026-0941 routed to Doc Team',
      time: '25 mins ago',
      type: 'info',
    },
    {
      id: '3',
      title: 'Sales Fee Quote Approved',
      details: 'Moved to File Operator Queue',
      time: '1 hour ago',
      type: 'primary',
    },
  ];

  return {
    user,
    navItems,
    activeTab,
    setActiveTab,
    stats,
    recentActivity,
    handleLogout,
  };
};
