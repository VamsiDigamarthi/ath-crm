export function getRoleDefaultRoute(role?: string): string {
  if (!role) return '/login';
  
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';

    // Documenter Department
    case 'DOC_MANAGER':
      return '/documenter/manager';
    case 'DOC_TEAM_LEAD':
    case 'DOC_AGENT':
      return '/documenter/agent';

    // Prep & Review Department
    case 'PREP_MANAGER':
      return '/prep-review/manager';
    case 'TAX_REVIEWER':
      return '/prep-review/reviewer';
    case 'TAX_PREPARER':
      return '/prep-review/preparer';

    // Sales Department
    case 'SALES_MANAGER':
      return '/sales/manager';
    case 'SALES_TEAM_LEAD':
    case 'SALES_CLOSER':
    case 'SALES_AGENT':
      return '/sales/agent/queue';

    // Filing Department (IRS Modernized e-File MeF)
    case 'FILE_OP_MANAGER':
      return '/filing/manager';
    case 'FILE_OP_TEAM_LEAD':
    case 'FILE_OP_AGENT':
      return '/filing/agent/queue';

    // Customer Portal
    case 'TAXPAYER_USER':
      return '/customer';

    default:
      return '/dashboard';
  }
}
