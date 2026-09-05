import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  ArrowRight, 
  Send, 
  DollarSign, 
  FileCheck2, 
  FolderArchive, 
  AlertTriangle,
  Info,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useNotificationStore } from '../store/notification-store';
import { useAuthStore } from '@/features/auth/store/auth-store';
import type { AppNotification, NotificationCategory } from '../types/notification.types';

export const NotificationBellPopover: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getNotificationUrl = () => {
    const role = user?.role;
    if (role === 'ADMIN') return '/admin/notifications';
    if (role === 'DOC_MANAGER' || role === 'DOC_TEAM_LEAD' || role === 'DOC_AGENT') {
      return '/documenter/notifications';
    }
    if (role === 'PREP_MANAGER' || role === 'TAX_REVIEWER' || role === 'TAX_PREPARER') {
      return '/prep-review/notifications';
    }
    if (role === 'SALES_MANAGER' || role === 'SALES_CLOSER' || role === 'SALES_AGENT') {
      return '/sales/notifications';
    }
    if (role === 'FILE_OP_MANAGER' || role === 'FILE_OP_TEAM_LEAD' || role === 'FILE_OP_AGENT') {
      return '/filing/notifications';
    }
    return '/customer/notifications';
  };

  const { 
    notifications, 
    fetchNotifications,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getUnreadCount 
  } = useNotificationStore();

  const unreadCount = getUnreadCount();
  const recentNotifications = notifications.slice(0, 4);

  // Fetch live notifications on mount and whenever popover opens
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      fetchNotifications();
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, fetchNotifications]);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'FILING':
        return <Send className="w-3.5 h-3.5 text-emerald-600" />;
      case 'SALES':
        return <DollarSign className="w-3.5 h-3.5 text-blue-600" />;
      case 'PREP_REVIEW':
        return <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />;
      case 'DOCUMENTER':
        return <FolderArchive className="w-3.5 h-3.5 text-indigo-600" />;
      case 'REJECTION_ALERT':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getCategoryBg = (category: NotificationCategory) => {
    switch (category) {
      case 'FILING':
        return 'bg-emerald-50 border-emerald-200';
      case 'SALES':
        return 'bg-blue-50 border-blue-200';
      case 'PREP_REVIEW':
        return 'bg-purple-50 border-purple-200';
      case 'DOCUMENTER':
        return 'bg-indigo-50 border-indigo-200';
      case 'REJECTION_ALERT':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  const resolveNotificationClickUrl = (notif: AppNotification): string => {
    const appId = notif.relatedApplicationId;
    const title = (notif.title || '').toLowerCase();
    const msg = (notif.message || '').toLowerCase();
    const rawUrl = (notif.actionUrl || '').toLowerCase();
    const userRole = user?.role;

    // 0. Explicit Action URL with compatibility fix
    let directUrl = notif.actionUrl || '';
    if (directUrl.startsWith('/prep/')) {
      directUrl = directUrl.replace('/prep/', '/prep-review/');
    }

    // 1. FILING NOTIFICATIONS & FILING USERS (Priority #1)
    const isFilingUser = userRole === 'FILE_OP_MANAGER' || userRole === 'FILE_OP_TEAM_LEAD' || userRole === 'FILE_OP_AGENT';
    const isFilingCategory = notif.category === 'FILING' || rawUrl.includes('/filing') || title.includes('filing queue') || title.includes('dispatched to filing') || title.includes('filing');
    if (isFilingCategory || isFilingUser) {
      if (directUrl && directUrl.startsWith('/filing')) return directUrl;
      if (userRole === 'FILE_OP_MANAGER' || userRole === 'ADMIN') return '/filing/manager/queue';
      if (appId) return `/filing/workspace/${appId}`;
      return '/filing/agent/queue';
    }

    // 2. SALES NOTIFICATIONS & SALES ROLES
    const isSalesUser = userRole === 'SALES_MANAGER' || userRole === 'SALES_CLOSER' || userRole === 'SALES_AGENT';
    const isSalesCategory = notif.category === 'SALES' || rawUrl.startsWith('/sales') || title.includes('sales queue') || title.includes('sales pitch') || title.includes('assigned');
    if (isSalesCategory || isSalesUser) {
      if (directUrl && directUrl.startsWith('/sales')) return directUrl;
      if (userRole === 'SALES_MANAGER') return '/sales/manager/queue';
      if (appId) return `/sales/agent/pitch/${appId}`;
      return '/sales/agent/queue';
    }

    // 3. REVISION REQUESTED -> Always Preparer Workspace so preparer can correct computation
    const isRevision = title.includes('revision') || msg.includes('revision') || title.includes('discrepancy');
    if (isRevision) {
      if (appId) return `/prep-review/preparer/workspace/${appId}`;
      return '/prep-review/preparer';
    }

    // 4. QA REVIEW & COMPLIANCE NOTIFICATIONS -> Always Senior QA Reviewer Audit Screen
    const isQANotification = 
      title.includes('qa compliance') ||
      title.includes('submitted for qa') ||
      title.includes('new qa compliance audit assigned') ||
      title.includes('compliance review') ||
      rawUrl.includes('/reviewer');

    if (isQANotification) {
      if (appId) return `/prep-review/reviewer/audit/${appId}`;
      return '/prep-review/reviewer';
    }

    // 5. TAX PREPARATION ASSIGNED NOTIFICATIONS -> Always Tax Preparer 1040 Workspace
    const isPrepNotification = 
      title.includes('preparation assigned') ||
      title.includes('1040 preparation') ||
      msg.includes('assigned you form 1040') ||
      rawUrl.includes('/preparer');

    if (isPrepNotification) {
      if (appId) return `/prep-review/preparer/workspace/${appId}`;
      return '/prep-review/preparer';
    }

    // 6. PREPARATION MANAGER NOTIFICATIONS
    const isManagerNotification = 
      title.includes('ready for preparation') ||
      title.includes('ready for preparer allocation') ||
      rawUrl.includes('/manager') ||
      userRole === 'PREP_MANAGER';

    if (isManagerNotification) {
      return '/prep-review/manager/queue';
    }

    // 7. DOCUMENTER AGENT NOTIFICATIONS
    const isDocAgentNotification = 
      title.includes('calling queue') ||
      title.includes('outreach') ||
      rawUrl.includes('/documenter/agent');

    if (isDocAgentNotification) {
      if (appId) return `/documenter/agent/lead/${appId}`;
      return '/documenter/agent/queue';
    }

    // 8. DOCUMENTER MANAGER NOTIFICATIONS
    if (rawUrl.includes('/documenter/manager') || title.includes('ingested') || userRole === 'DOC_MANAGER') {
      return '/documenter/manager/queue';
    }

    // 9. Direct actionUrl fallback
    if (directUrl) {
      return directUrl;
    }

    return getNotificationUrl();
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    const targetUrl = resolveNotificationClickUrl(notif);
    navigate(targetUrl);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
        }`}
        title="Department Notifications & Alerts"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[9px] font-black text-white items-center justify-center shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Glassmorphic / Modern Notifications Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List (4 Recent) */}
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No recent notifications</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 px-4 flex items-start gap-3 hover:bg-slate-50/90 cursor-pointer transition-all relative group ${
                    !notif.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${getCategoryBg(
                      notif.category
                    )}`}
                  >
                    {getCategoryIcon(notif.category)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs truncate ${
                          !notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {notif.timeAgo}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.relatedLeadName && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {notif.relatedLeadName}
                        </span>
                        {!isAdmin && notif.actionLabel && (
                          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 group-hover:underline">
                            <span>{notif.actionLabel}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions: Unread dot */}
                  <div className="shrink-0 flex items-center justify-center self-stretch">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer CTA: View All Notifications */}
          <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time Cross-Role Activity
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(getNotificationUrl());
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              <span>View All Notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
