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
  ExternalLink
} from 'lucide-react';
import { useNotificationStore } from '../store/notification-store';
import { useAuthStore } from '@/features/auth/store/auth-store';
import type { AppNotification, NotificationCategory } from '../types/notification.types';
import { resolveNotificationClickUrl, getNotificationListUrl } from '../utils/notification-router';

export const NotificationBellPopover: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { 
    notifications, 
    fetchNotifications,
    markAsRead, 
    markAllAsRead, 
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

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    const targetUrl = resolveNotificationClickUrl(notif, user?.role);
    navigate(targetUrl || notif.actionUrl || getNotificationListUrl(user?.role));
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button - Clean borderless with reduced radius */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-slate-100 text-black'
            : 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-black'
        }`}
        title="Department Notifications & Alerts"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-[8.5px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Modern Notifications Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-md bg-white shadow-xl border border-slate-300 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-black text-xs sm:text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
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
                  className={`p-3.5 px-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-all relative group ${
                    !notif.isRead ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div
                    className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${getCategoryBg(
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
                          !notif.isRead ? 'font-bold text-black' : 'font-semibold text-black/80'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                        {notif.timeAgo}
                      </span>
                    </div>

                    <p className="text-[11px] text-black/70 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.relatedLeadName && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-black border border-slate-200">
                          {notif.relatedLeadName}
                        </span>
                        {!isAdmin && notif.actionLabel && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 group-hover:underline">
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
                      <span className="w-2 h-2 rounded-full bg-emerald-600" title="Unread" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer CTA: View All Notifications */}
          <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-black/60 font-medium">
              Real-time Cross-Role Activity
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(getNotificationListUrl(user?.role));
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer hover:underline"
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
