import type { AppNotification } from '../types/notification.types';

/**
 * Returns the default notifications page URL for a given role
 */
export function getNotificationListUrl(role?: string): string {
  if (role === 'ADMIN') return '/admin/notifications';
  if (role === 'DOC_MANAGER' || role === 'DOC_TEAM_LEAD' || role === 'DOC_AGENT') {
    return '/documenter/notifications';
  }
  if (role === 'PREP_MANAGER' || role === 'TAX_REVIEWER' || role === 'TAX_PREPARER') {
    return '/prep-review/notifications';
  }
  if (role === 'SALES_MANAGER' || role === 'SALES_TEAM_LEAD' || role === 'SALES_CLOSER' || role === 'SALES_AGENT') {
    return '/sales/notifications';
  }
  if (role === 'FILE_OP_MANAGER' || role === 'FILE_OP_TEAM_LEAD' || role === 'FILE_OP_AGENT') {
    return '/filing/notifications';
  }
  return '/customer/notifications';
}

/**
 * Checks if a specific target URL is permitted for the user's role
 */
export function isRouteAllowedForRole(url: string, role?: string): boolean {
  if (!role) return false;
  if (role === 'ADMIN') return true;

  if (url.startsWith('/documenter')) {
    return role === 'DOC_MANAGER' || role === 'DOC_TEAM_LEAD' || role === 'DOC_AGENT';
  }
  if (url.startsWith('/prep-review') || url.startsWith('/prep/')) {
    return role === 'PREP_MANAGER' || role === 'TAX_REVIEWER' || role === 'TAX_PREPARER';
  }
  if (url.startsWith('/sales')) {
    return role === 'SALES_MANAGER' || role === 'SALES_TEAM_LEAD' || role === 'SALES_CLOSER' || role === 'SALES_AGENT';
  }
  if (url.startsWith('/filing')) {
    return role === 'FILE_OP_MANAGER' || role === 'FILE_OP_TEAM_LEAD' || role === 'FILE_OP_AGENT';
  }
  if (url.startsWith('/customer')) {
    return role === 'TAXPAYER_USER';
  }
  return true;
}

/**
 * Resolves the destination URL when a user clicks a notification or its action button.
 * Enforces strict department role boundaries and ensures user is routed to the proper workspace.
 */
export function resolveNotificationClickUrl(notif: AppNotification, userRole?: string): string {
  const appId = notif.relatedApplicationId;
  const title = (notif.title || '').toLowerCase();
  const msg = (notif.message || '').toLowerCase();
  let directUrl = (notif.actionUrl || '').trim();

  // Normalize legacy shorthand URLs
  if (directUrl.startsWith('/prep/')) {
    directUrl = directUrl.replace('/prep/', '/prep-review/');
  }

  // 1. If notification has an explicit actionUrl that is permitted for this role, prioritize it
  if (directUrl && isRouteAllowedForRole(directUrl, userRole)) {
    return directUrl;
  }

  // 2. Department-based resolution by recipient's role:

  // --- DOCUMENTER ROLES ---
  if (userRole === 'DOC_AGENT' || userRole === 'DOC_TEAM_LEAD') {
    // If notification is about a single specific lead and appId is available
    if (appId && (title.includes('lead') || title.includes('outreach') || notif.category === 'DOCUMENTER')) {
      return `/documenter/agent/lead/${appId}`;
    }
    return '/documenter/agent/queue';
  }

  if (userRole === 'DOC_MANAGER') {
    return '/documenter/manager/queue';
  }

  // --- TAX PREPARATION & REVIEW ROLES ---
  if (userRole === 'TAX_PREPARER') {
    if (appId) return `/prep-review/preparer/workspace/${appId}`;
    return '/prep-review/preparer';
  }

  if (userRole === 'TAX_REVIEWER') {
    if (appId) return `/prep-review/reviewer/audit/${appId}`;
    return '/prep-review/reviewer';
  }

  if (userRole === 'PREP_MANAGER') {
    return '/prep-review/manager/queue';
  }

  // --- SALES ROLES ---
  if (userRole === 'SALES_AGENT' || userRole === 'SALES_CLOSER' || userRole === 'SALES_TEAM_LEAD') {
    if (appId) return `/sales/agent/pitch/${appId}`;
    return '/sales/agent/queue';
  }

  if (userRole === 'SALES_MANAGER') {
    return '/sales/manager/queue';
  }

  // --- IRS FILING / MEF ROLES ---
  if (userRole === 'FILE_OP_AGENT' || userRole === 'FILE_OP_TEAM_LEAD') {
    if (appId) return `/filing/workspace/${appId}`;
    return '/filing/agent/queue';
  }

  if (userRole === 'FILE_OP_MANAGER') {
    return '/filing/manager/queue';
  }

  // --- CUSTOMER PORTAL ---
  if (userRole === 'TAXPAYER_USER') {
    if (title.includes('document') || msg.includes('document')) return '/customer/documents';
    if (title.includes('organizer') || msg.includes('questionnaire')) return '/customer/organizer';
    if (title.includes('billing') || title.includes('quote') || title.includes('invoice')) return '/customer/billing';
    return '/customer';
  }

  // --- ADMIN PORTAL ---
  if (userRole === 'ADMIN') {
    if (notif.category === 'DOCUMENTER') return '/admin/documenter';
    if (notif.category === 'PREP_REVIEW') return '/admin/prep-review';
    if (notif.category === 'SALES') return '/admin/sales';
    if (notif.category === 'FILING') return '/admin/filing';
    return '/admin/dashboard';
  }

  // Fallback: Default notification list for user's role
  return getNotificationListUrl(userRole);
}
