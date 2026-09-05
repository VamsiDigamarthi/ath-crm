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
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useNotificationStore } from '../store/notification-store';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppPagination } from '@/shared/components/AppPagination';
import type { AppNotification, NotificationCategory, NotificationPriority } from '../types/notification.types';
import { resolveNotificationClickUrl } from '../utils/notification-router';
import toast from 'react-hot-toast';

export const NotificationCenterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

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
    deleteNotification,
    clearAll,
    setCategoryFilter,
    setOnlyUnreadFilter,
  } = useNotificationStore();

  // Automatically fetch live notifications from database when screen opens
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl text-slate-900">
                Department Notification &amp; Activity Hub
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live audit events, cross-role department handoffs, IRS MeF updates, and rejection alerts.
            </p>
          </div>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => {
                markAllAsRead();
                toast.success('All notifications marked as read! ✅');
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Alerts</div>
            <div className="text-xl font-black text-slate-900">{totalCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unread Actionable</div>
            <div className="text-xl font-black text-rose-600">{unreadCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filing &amp; IRS MeF</div>
            <div className="text-xl font-black text-slate-900">{filingCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Flags</div>
            <div className="text-xl font-black text-amber-600">{criticalCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategoryFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterCategory === tab.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications or taxpayer..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterOnlyUnread}
                onChange={(e) => setOnlyUnreadFilter(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span>Unread Only</span>
            </label>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {paginatedNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Bell className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-base text-slate-700">No Notifications Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching alerts or updates found for the selected category filter.
            </p>
          </div>
        ) : (
          paginatedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-xs hover:border-slate-300 ${
                !notif.isRead ? 'border-l-4 border-l-blue-600 bg-blue-50/15' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Category Icon */}
                <div className="w-10 h-10 rounded-xl border bg-slate-50 border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Details */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getCategoryBadge(notif.category)}`}>
                      {notif.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPriorityBadge(notif.priority)}`}>
                      {notif.priority}
                    </span>
                    {notif.relatedLeadName && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {notif.relatedLeadName}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {notif.timeAgo}
                    </span>
                  </div>

                  <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                    {notif.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
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
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{notif.actionLabel || 'Open Record'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => markAsRead(notif.id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    notif.isRead 
                      ? 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
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
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
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
