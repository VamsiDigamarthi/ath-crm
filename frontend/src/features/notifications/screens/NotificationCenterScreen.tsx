import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Search, 
  Send, 
  DollarSign, 
  FileCheck2, 
  FolderArchive, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';
import { useNotificationStore } from '../store/notification-store';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppPagination } from '@/shared/components/AppPagination';
import type { NotificationCategory, NotificationPriority } from '../types/notification.types';
import { resolveNotificationClickUrl } from '../utils/notification-router';
import toast from 'react-hot-toast';

export const NotificationCenterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [adminScope, setAdminScope] = useState<'my' | 'all'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const {
    notifications,
    fetchNotifications,
    filterCategory,
    filterOnlyUnread,
    markAsRead,
    markAllAsRead,
    setCategoryFilter,
    setOnlyUnreadFilter,
  } = useNotificationStore();

  // Automatically fetch live notifications from database when screen opens or scope changes
  useEffect(() => {
    fetchNotifications(isAdmin && adminScope === 'all' ? 'all' : undefined);
  }, [fetchNotifications, isAdmin, adminScope]);

  // Reset pagination when any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterOnlyUnread, selectedPriority, searchTerm]);

  // Summary Metrics
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const criticalCount = notifications.filter((n) => n.priority === 'CRITICAL').length;
  const filingCount = notifications.filter((n) => n.category === 'FILING').length;

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // 1. Category Filter
      if (filterCategory !== 'ALL' && notif.category !== filterCategory) {
        return false;
      }
      // 2. Unread Filter
      if (filterOnlyUnread && notif.isRead) {
        return false;
      }
      // 3. Priority Filter
      if (selectedPriority !== 'ALL' && notif.priority !== selectedPriority) {
        return false;
      }
      // 4. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(query);
        const matchesMessage = notif.message.toLowerCase().includes(query);
        const matchesLead = notif.relatedLeadName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage && !matchesLead) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, filterCategory, filterOnlyUnread, selectedPriority, searchTerm]);

  const totalItems = filteredNotifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'FILING':
        return <Send className="w-4 h-4 text-emerald-600" />;
      case 'SALES':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'PREP_REVIEW':
        return <FileCheck2 className="w-4 h-4 text-purple-600" />;
      case 'DOCUMENTER':
        return <FolderArchive className="w-4 h-4 text-indigo-600" />;
      case 'REJECTION_ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadge = (category: NotificationCategory) => {
    switch (category) {
      case 'FILING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SALES':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PREP_REVIEW':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DOCUMENTER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REJECTION_ALERT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'NORMAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const categoryTabs: { label: string; value: NotificationCategory | 'ALL' }[] = [
    { label: 'All Activity', value: 'ALL' },
    { label: 'Filing & IRS MeF', value: 'FILING' },
    { label: 'Sales & Closer', value: 'SALES' },
    { label: 'Prep & CPA Review', value: 'PREP_REVIEW' },
    { label: 'Document Vault', value: 'DOCUMENTER' },
    { label: 'Rejection Alerts', value: 'REJECTION_ALERT' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-md bg-white border border-slate-300 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-300 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-black">Total Alerts</div>
            <div className="text-2xl font-bold text-black mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-white border border-slate-300 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-300 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-black">Unread Actionable</div>
            <div className="text-2xl font-bold text-rose-700 mt-0.5">{unreadCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-white border border-slate-300 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-300 shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-black">Filing &amp; IRS MeF</div>
            <div className="text-2xl font-bold text-black mt-0.5">{filingCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-white border border-slate-300 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-300 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-black">Critical Flags</div>
            <div className="text-2xl font-bold text-amber-700 mt-0.5">{criticalCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs space-y-3.5">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategoryFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterCategory === tab.value
                  ? 'bg-[#16A34A] text-white shadow-2xs border border-emerald-700'
                  : 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications or taxpayer..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#16A34A] shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {isAdmin && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-300 text-xs">
                <button
                  type="button"
                  onClick={() => setAdminScope('my')}
                  className={`px-2.5 py-1 rounded-sm font-bold transition-all cursor-pointer ${
                    adminScope === 'my'
                      ? 'bg-white text-black shadow-2xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  My Alerts
                </button>
                <button
                  type="button"
                  onClick={() => setAdminScope('all')}
                  className={`px-2.5 py-1 rounded-sm font-bold transition-all cursor-pointer ${
                    adminScope === 'all'
                      ? 'bg-white text-black shadow-2xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  All Dept
                </button>
              </div>
            )}

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  markAllAsRead();
                  toast.success('All notifications marked as read! ✅');
                }}
                className="px-3 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}

            <label className="flex items-center gap-2 text-xs font-bold text-black cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterOnlyUnread}
                onChange={(e) => setOnlyUnreadFilter(e.target.checked)}
                className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A] border-slate-300 cursor-pointer"
              />
              <span>Unread</span>
            </label>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#16A34A] cursor-pointer shadow-2xs"
            >
              <option value="ALL">ALL</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {paginatedNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-md border border-slate-300 shadow-2xs text-center space-y-3">
            <Bell className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-base text-black">No Notifications Found</h3>
            <p className="text-xs text-black/70 max-w-sm mx-auto">
              No matching alerts or updates found for the selected category filter.
            </p>
          </div>
        ) : (
          paginatedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-md border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-2xs hover:border-slate-400 ${
                !notif.isRead ? 'border-slate-300 border-l-4 border-l-[#16A34A] bg-emerald-50/20' : 'border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Category Icon */}
                <div className="w-9 h-9 rounded-md border bg-slate-50 border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Details */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadge(notif.category)}`}>
                      {notif.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadge(notif.priority)}`}>
                      {notif.priority}
                    </span>
                    {notif.relatedLeadName && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-black border border-slate-300">
                        {notif.relatedLeadName}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 font-medium">
                      • {notif.timeAgo}
                    </span>
                  </div>

                  <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-black' : 'font-semibold text-black/80'}`}>
                    {notif.title}
                  </h3>

                  <p className="text-xs text-black/70 leading-relaxed max-w-3xl">
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end">
                {!isAdmin && notif.actionUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      markAsRead(notif.id);
                      const targetUrl = resolveNotificationClickUrl(notif, user?.role);
                      navigate(targetUrl || notif.actionUrl!);
                    }}
                    className="px-3.5 py-1.5 rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-emerald-700 transition-colors cursor-pointer"
                  >
                    <span>{notif.actionLabel || 'Open Record'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => markAsRead(notif.id)}
                  className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                    notif.isRead 
                      ? 'bg-slate-50 text-slate-400 border-slate-300 hover:text-slate-600' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title={notif.isRead ? 'Already Read' : 'Mark as Read'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            perPageOptions={[5, 10, 20, 50]}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(perPage) => {
              setItemsPerPage(perPage);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
