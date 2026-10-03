export interface PermissionUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
  enabled: boolean;
}

export interface PermissionItem {
  key: string;
  label: string;
  description: string;
  module: string;
  roles: string[];
  users: PermissionUser[];
  enabledCount: number;
}

export const ROLE_LABELS: Record<string, string> = {
  TAX_PREPARER: 'Tax Preparer',
  TAX_REVIEWER: 'Tax Reviewer',
  PREP_MANAGER: 'Prep Manager',
  DOC_AGENT: 'Documenter Agent',
  DOC_MANAGER: 'Documenter Manager',
  SALES_AGENT: 'Sales Agent',
  SALES_MANAGER: 'Sales Manager',
  FILE_OP_AGENT: 'Filing Agent',
  FILE_OP_MANAGER: 'Filing Manager',
};
