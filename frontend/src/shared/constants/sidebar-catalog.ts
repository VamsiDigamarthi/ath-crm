export interface SidebarItemDefinition {
  id: string;
  legacyId?: string;
  label: string;
  department: 'ADMIN' | 'DOC' | 'PREP_REVIEW' | 'SALES' | 'FILE_OP';
  departmentLabel: string;
  path: string;
  section: string;
  description: string;
}

export const MASTER_SIDEBAR_CATALOG: SidebarItemDefinition[] = [
  // 1. Administration (/admin/*)
  {
    id: 'admin_dashboard',
    legacyId: 'dashboard',
    label: 'Dashboard',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/dashboard',
    section: 'Overview',
    description: 'System-wide high-level metrics, conversion rates, and revenue KPI overview.',
  },
  {
    id: 'admin_prospects',
    legacyId: 'prospects',
    label: 'Bulk Lead Import',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/prospects',
    section: 'Intake Pipeline',
    description: 'Bulk CSV imported raw leads awaiting assignment to Documenter calling queues.',
  },
  {
    id: 'admin_self_signups',
    legacyId: 'self-signups',
    label: 'Direct Sign-ups',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/self-signups',
    section: 'Intake Pipeline',
    description: 'Taxpayers who initiated individual filings directly via the self-service web portal.',
  },
  {
    id: 'admin_returned_leads',
    legacyId: 'returned-leads',
    label: 'Returned Leads',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/returned-leads',
    section: 'Intake Pipeline',
    description: 'Leads returned from preparation or sales requiring outreach re-assignment.',
  },
  {
    id: 'admin_all_taxpayers',
    legacyId: 'all-taxpayers',
    label: 'Data',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/all-taxpayers',
    section: 'Directories',
    description: 'Global master index of every contact in the CRM across all stages.',
  },
  {
    id: 'admin_coupons',
    legacyId: 'coupons',
    label: 'Discount Coupons',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/coupons',
    section: 'Commercial',
    description: 'Manage promotion codes, referral discounts, dollar cuts, and percentage offers.',
  },
  {
    id: 'admin_products',
    legacyId: 'products',
    label: 'Products & Services',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/products',
    section: 'Commercial',
    description: 'Manage filing pricing packages and add-on tax filing service products.',
  },
  {
    id: 'admin_customers',
    legacyId: 'customers',
    label: 'Files',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/customers',
    section: 'Directories',
    description: 'Directory of converted taxpayers who have active tax returns and documents.',
  },
  {
    id: 'admin_employees',
    legacyId: 'employees',
    label: 'Team & Staff',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/employees',
    section: 'Access & Team',
    description: 'Employee directory, active status management, capacity tracking, and role allocation.',
  },
  {
    id: 'admin_roles',
    legacyId: 'roles',
    label: 'Roles & Permissions',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/roles',
    section: 'Access & Team',
    description: 'Define custom organizational roles and configure visible sidebar navigation items.',
  },
  {
    id: 'admin_email_templates',
    legacyId: 'email-templates',
    label: 'Email Templates',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/email-templates',
    section: 'Commercial',
    description: 'System communication email templates for onboarding, invoices, and handoffs.',
  },
  {
    id: 'admin_documenter',
    legacyId: 'documenter',
    label: 'Documenter Dept',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/documenter',
    section: 'Departments',
    description: 'Admin view of Documenter department operations and queue management.',
  },
  {
    id: 'admin_prep_review',
    legacyId: 'prep-review',
    label: 'Prep & Review Dept',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/prep-review',
    section: 'Departments',
    description: 'Admin view of Tax Preparation & Review operations and QA audits.',
  },
  {
    id: 'admin_sales',
    legacyId: 'sales',
    label: 'Sales Dept',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/sales',
    section: 'Departments',
    description: 'Admin view of Sales pipelines, closers, and pricing quote authorizations.',
  },
  {
    id: 'admin_filing',
    legacyId: 'filing',
    label: 'File Operator Hub',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/filing',
    section: 'Departments',
    description: 'Admin view of CPA electronic transmission queue and IRS acknowledgements.',
  },
  {
    id: 'admin_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/notifications',
    section: 'System',
    description: 'System notifications, broadcast alerts, and compliance updates.',
  },
  {
    id: 'admin_settings',
    legacyId: 'settings',
    label: 'System Settings',
    department: 'ADMIN',
    departmentLabel: 'Administration',
    path: '/admin/settings',
    section: 'System',
    description: 'General system configuration, branding, and notification settings.',
  },

  // 2. Documenter Department (/documenter/*)
  {
    id: 'doc_manager_dashboard',
    legacyId: 'dashboard',
    label: 'Operations Dashboard',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/manager',
    section: 'Management',
    description: 'Intake metrics, documents verified, and conversion throughput.',
  },
  {
    id: 'doc_self_signups',
    legacyId: 'self_signups',
    label: 'Direct Sign-ups',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/manager/self-signups',
    section: 'Operations',
    description: 'Self-registered leads allocated to the Documenter department.',
  },
  {
    id: 'doc_department_queue',
    legacyId: 'caseload',
    label: 'Department Queue',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/manager/queue',
    section: 'Operations',
    description: 'Master pool of document collection and outreach prospects.',
  },
  {
    id: 'doc_scorecards',
    legacyId: 'scorecards',
    label: 'Agent Scorecards',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/manager/scorecards',
    section: 'Operations',
    description: 'Individual documenter outreach metrics, dials, and verified leads.',
  },
  {
    id: 'doc_manager_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/notifications',
    section: 'Management',
    description: 'Urgent callbacks, client uploads, and lead assignment alerts.',
  },
  {
    id: 'doc_agent_dashboard',
    legacyId: 'agent_dashboard',
    label: 'Dashboard',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/agent',
    section: 'Calling Workspace',
    description: 'Daily calling goals, scheduled callbacks, and pending verifications.',
  },
  {
    id: 'doc_my_calling',
    legacyId: 'agent_queue',
    label: 'My Calling',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/agent/queue',
    section: 'Calling Workspace',
    description: 'Active calling queue assigned to you for document collection.',
  },
  {
    id: 'doc_scheduled_callbacks',
    legacyId: 'agent_callbacks',
    label: 'Scheduled Callbacks',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/agent/callbacks',
    section: 'Calling Workspace',
    description: 'Appointments and callbacks requested by taxpayers.',
  },
  {
    id: 'doc_fallback_leads',
    legacyId: 'agent_fallback',
    label: 'Fallback Leads',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/agent/fallback',
    section: 'Calling Workspace',
    description: 'Fallback leads who requested postponed outreach or missing papers.',
  },
  {
    id: 'doc_my_documents',
    legacyId: 'agent_documents',
    label: 'My Documents',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/agent/documents',
    section: 'My Filings',
    description: 'Incoming taxpayer paperwork (W-2, 1099, Passports) awaiting review.',
  },
  {
    id: 'doc_agent_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'DOC',
    departmentLabel: 'Documenter Dept',
    path: '/documenter/notifications',
    section: 'My Filings',
    description: 'Documenter alerts and calling queue updates.',
  },

  // 3. Tax Preparation & Review (/prep-review/*)
  {
    id: 'prep_manager_dashboard',
    legacyId: 'dashboard',
    label: 'Operations Dashboard',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/manager',
    section: 'Management',
    description: 'Manager overview of drafting metrics and QA turnaround times.',
  },
  {
    id: 'prep_department_queue',
    legacyId: 'caseload',
    label: 'Department Queue',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/manager/queue',
    section: 'Operations',
    description: 'Manager pool of returns ready for tax preparer allocation.',
  },
  {
    id: 'prep_staff',
    legacyId: 'staff',
    label: 'Staff Matrix & Capacity',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/manager/staff',
    section: 'Operations',
    description: 'Preparer & Reviewer staff bandwidth and drafting capacity.',
  },
  {
    id: 'prep_manager_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/notifications',
    section: 'Management',
    description: 'Prep department notifications and stage alerts.',
  },
  {
    id: 'prep_specialist_hub',
    legacyId: 'specialist_hub',
    label: 'Dashboard',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/dashboard',
    section: 'Specialist Workspace',
    description: 'Unified operational dashboard for tax preparers and reviewers.',
  },
  {
    id: 'prep_preparer',
    legacyId: 'preparer',
    label: 'Return Preparation',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/preparer',
    section: 'Active Operations',
    description: 'Active working Form 1040 tax drafting returns actively assigned to you.',
  },
  {
    id: 'prep_pending_returns',
    legacyId: 'preparer_pending',
    label: 'Pending Returns',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/preparer/pending',
    section: 'Active Operations',
    description: 'Returns assigned to you awaiting draft initiation.',
  },
  {
    id: 'prep_under_review',
    legacyId: 'preparer_under_review',
    label: 'Under Review',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/preparer/under-review',
    section: 'Active Operations',
    description: 'Returns submitted and currently under four-eyes QA compliance review.',
  },
  {
    id: 'prep_completed_returns',
    legacyId: 'preparer_completed',
    label: 'Completed Returns',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/preparer/completed',
    section: 'My Filings',
    description: 'Returns that successfully passed QA compliance review and sign-off.',
  },
  {
    id: 'prep_reviewer',
    legacyId: 'reviewer',
    label: 'Assigned Returns',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/reviewer',
    section: 'Active Operations',
    description: 'All Form 1040 returns assigned to you for four-eyes QA compliance review.',
  },
  {
    id: 'prep_reviewer_pending',
    legacyId: 'reviewer_pending',
    label: 'Pending Returns',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/reviewer/pending',
    section: 'Active Operations',
    description: 'Returns awaiting QA compliance review in processing.',
  },
  {
    id: 'prep_reviewer_revisions',
    legacyId: 'reviewer_revisions',
    label: 'Revision Required',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/reviewer/revisions',
    section: 'Active Operations',
    description: 'Returns sent back to preparers with correction instructions.',
  },
  {
    id: 'prep_reviewer_approved',
    legacyId: 'reviewer_approved',
    label: 'Approved Returns',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/reviewer/approved',
    section: 'My Filings',
    description: 'Returns that successfully passed QA review and compliance sign-off.',
  },
  {
    id: 'prep_specialist_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'PREP_REVIEW',
    departmentLabel: 'Tax Prep & Review',
    path: '/prep-review/notifications',
    section: 'My Filings',
    description: 'Revision requests, QA approvals, and handoff alerts.',
  },

  // 4. Sales Department (/sales/*)
  {
    id: 'sales_manager_dashboard',
    legacyId: 'dashboard',
    label: 'Operations Dashboard',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/manager',
    section: 'Management',
    description: 'Sales volume, closed deals, conversion rates, and revenue pipeline.',
  },
  {
    id: 'sales_department_queue',
    legacyId: 'pipeline',
    label: 'Department Queue',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/manager/queue',
    section: 'Operations',
    description: 'Returns with finalized draft estimates ready for pricing quotes.',
  },
  {
    id: 'sales_dual_role',
    legacyId: 'dual_role',
    label: 'Dual Doc + Sales',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/manager/dual-role',
    section: 'Operations',
    description: 'Combined intake + pricing sales pitch workflow cases.',
  },
  {
    id: 'sales_team',
    legacyId: 'team',
    label: 'Staff Matrix & Capacity',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/manager/team',
    section: 'Operations',
    description: 'Sales closers capacity, active pitches, and quotas.',
  },
  {
    id: 'sales_coupons',
    legacyId: 'coupons',
    label: 'Discount Coupons',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/coupons',
    section: 'Management',
    description: 'Sales discount codes and authorized margin discounts.',
  },
  {
    id: 'sales_manager_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/notifications',
    section: 'Management',
    description: 'Sales management alerts and quote approvals.',
  },
  {
    id: 'sales_agent_hub',
    legacyId: 'agent_dashboard',
    label: 'Dashboard',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/agent',
    section: 'Closer Workspace',
    description: 'Sales closer operational dashboard, performance KPIs, and conversion metrics.',
  },
  {
    id: 'sales_my_prospects',
    legacyId: 'pitch_queue',
    label: 'My Prospects (My leads)',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/agent/queue',
    section: 'Active Operations',
    description: 'All assigned taxpayer prospects and leads across sales pipeline.',
  },
  {
    id: 'sales_pending_prospects',
    legacyId: 'pending_prospects',
    label: 'Pending Prospects (pending Leads)',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/agent/pending',
    section: 'Active Operations',
    description: 'QA-approved taxpayer leads awaiting initial sales outreach and pitch.',
  },
  {
    id: 'sales_callbacks',
    legacyId: 'scheduled_callbacks',
    label: 'Scheduled Callbacks',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/agent/callbacks',
    section: 'Active Operations',
    description: 'Taxpayers with scheduled callback appointments and timed consultations.',
  },
  {
    id: 'sales_follow_ups',
    legacyId: 'follow_ups',
    label: 'Follow-Ups',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/agent/follow-ups',
    section: 'Active Operations',
    description: 'Active quotations and payment checkouts awaiting client completion.',
  },
  {
    id: 'sales_converted',
    legacyId: 'converted_clients',
    label: 'Converted Clients',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/agent/converted',
    section: 'My Filings',
    description: 'Deals closed, payment collected, and Form 8879 authorizations completed.',
  },
  {
    id: 'sales_agent_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'SALES',
    departmentLabel: 'Sales Dept',
    path: '/sales/notifications',
    section: 'My Filings',
    description: 'Client quote acceptances, payments, and sign-offs.',
  },

  // 5. Filing Operations (/filing/*)
  {
    id: 'filing_manager_dashboard',
    legacyId: 'dashboard',
    label: 'Operations Dashboard',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/manager',
    section: 'Management',
    description: 'CPA e-filing volumes, batch transmissions, and IRS acknowledgements.',
  },
  {
    id: 'filing_department_queue',
    legacyId: 'queue',
    label: 'Department Queue',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/manager/queue',
    section: 'Operations',
    description: 'Fully paid and authorized returns queued for IRS transmission.',
  },
  {
    id: 'filing_team',
    legacyId: 'team',
    label: 'Staff Matrix & Capacity',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/manager/staff',
    section: 'Operations',
    description: 'CPA and Filing Operator capacity and batch allocation.',
  },
  {
    id: 'filing_manager_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/notifications',
    section: 'Management',
    description: 'Filing manager alerts and IRS batch notices.',
  },
  {
    id: 'filing_agent_dashboard',
    legacyId: 'filing_dashboard',
    label: 'Dashboard',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/agent',
    section: 'Filing Workspace',
    description: 'Specialist operations overview, daily velocity, and gateway health.',
  },
  {
    id: 'filing_ready',
    legacyId: 'filing_transmission_queue',
    label: 'Ready for Filing',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/agent/queue',
    section: 'Active Operations',
    description: 'Returns approved and authorized for IRS MeF batch transmission.',
  },
  {
    id: 'filing_pending',
    legacyId: 'agent_pending',
    label: 'Filing Pending',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/agent/pending',
    section: 'Active Operations',
    description: 'Returns actively validating schemas or transmitting across the IRS MeF gateway.',
  },
  {
    id: 'filing_on_hold',
    legacyId: 'agent_on_hold',
    label: 'Filing on Hold',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/agent/on-hold',
    section: 'Active Operations',
    description: 'Returns temporarily paused or reverted to previous departments.',
  },
  {
    id: 'filing_rejected',
    legacyId: 'agent_rejected',
    label: 'Rejected Returns',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/agent/rejected',
    section: 'Active Operations',
    description: 'Returns rejected by IRS or State agencies requiring diagnostic fixes.',
  },
  {
    id: 'filing_filed',
    legacyId: 'agent_filed',
    label: 'Filed Returns',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/agent/filed',
    section: 'My Filings',
    description: 'Returns officially acknowledged and accepted with Acceptance Certificates.',
  },
  {
    id: 'filing_agent_notifications',
    legacyId: 'notifications',
    label: 'Notifications',
    department: 'FILE_OP',
    departmentLabel: 'Filing Operations',
    path: '/filing/notifications',
    section: 'My Filings',
    description: 'IRS reject notices, transmission acceptances, and refund acknowledgements.',
  },
];

export const DEPARTMENT_LABELS: Record<string, string> = {
  ADMIN: 'Administration',
  DOC: 'Documenter Dept',
  PREP_REVIEW: 'Tax Prep & Review',
  SALES: 'Sales Dept',
  FILE_OP: 'Filing Operations',
};

/**
 * Filter an array of navigation items against the allowed sidebar permission keys.
 * If user is root ADMIN or no permissions list is enforced, all items are visible.
 */
export function filterNavItemsByPermissions<T extends { id: string; path?: string }>(
  items: T[],
  allowedPermissions?: string[] | null,
  isRootAdmin: boolean = false
): T[] {
  if (isRootAdmin) return items;
  if (!allowedPermissions || allowedPermissions.length === 0) return items;
  const permSet = new Set(allowedPermissions);
  if (permSet.has('*')) return items;

  return items.filter((item) => {
    // Always preserve notifications in all workspaces
    if (item.id === 'notifications') return true;

    // 1. Direct ID match (e.g. 'preparer' or 'prep_preparer')
    if (permSet.has(item.id)) return true;

    // 2. Exact or path match via master catalog
    if (item.path) {
      const match = MASTER_SIDEBAR_CATALOG.find(
        (cat) =>
          cat.id === item.id ||
          cat.legacyId === item.id ||
          cat.path === item.path
      );
      if (
        match &&
        (permSet.has(match.id) || (match.legacyId && permSet.has(match.legacyId)))
      ) {
        return true;
      }
    }

    // 3. Preparer sub-queues inherit preparer permission
    if (
      (item.id.startsWith('preparer') || item.id.startsWith('prep_preparer') || item.id.startsWith('prep_pending') || item.id.startsWith('prep_under_review') || item.id.startsWith('prep_completed')) &&
      (permSet.has('preparer') || permSet.has('prep_preparer'))
    ) {
      return true;
    }

    // 4. Reviewer sub-queues inherit reviewer permission
    if (
      (item.id.startsWith('reviewer') || item.id.startsWith('prep_reviewer')) &&
      (permSet.has('reviewer') || permSet.has('prep_reviewer'))
    ) {
      return true;
    }

    // 5. Sales Closer sub-queues inherit sales permissions
    if (
      (item.id.startsWith('sales_') || item.id === 'agent_dashboard' || item.id === 'pitch_queue' || item.id === 'agent_hub') &&
      (permSet.has('sales') || permSet.has('sales_agent') || permSet.has('pitch_queue') || permSet.has('agent_hub') || permSet.has('sales_pitch_queue') || permSet.has('sales_agent_hub'))
    ) {
      return true;
    }

    // 6. Filing Specialist sub-queues inherit filing permissions
    if (
      (item.id.startsWith('filing_') || item.id === 'agent_hub' || item.id === 'agent_queue') &&
      (permSet.has('filing') || permSet.has('filing_agent') || permSet.has('agent_queue') || permSet.has('agent_hub') || permSet.has('filing_transmission_queue') || permSet.has('filing_agent_hub'))
    ) {
      return true;
    }

    return false;
  });
}
