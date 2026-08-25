export type EmployeeRole =
  | 'ADMIN'
  | 'DOC_MANAGER'
  | 'DOC_TEAM_LEAD'
  | 'DOC_AGENT'
  | 'PREP_MANAGER'
  | 'TAX_REVIEWER'
  | 'TAX_PREPARER'
  | 'SALES_MANAGER'
  | 'SALES_TEAM_LEAD'
  | 'SALES_AGENT'
  | 'FILE_OP_MANAGER'
  | 'FILE_OP_TEAM_LEAD'
  | 'FILE_OP_AGENT';

export type DepartmentType = 'ALL' | 'DOC' | 'PREP_REVIEW' | 'SALES' | 'FILE_OP' | 'ADMIN';

export interface EmployeeItem extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile: string;
  department: 'DOC' | 'PREP_REVIEW' | 'SALES' | 'FILE_OP' | 'ADMIN';
  departmentLabel: string;
  role: EmployeeRole;
  roleLabel: string;
  isActive: boolean;
  avatar: string;
  assignedCasesCount: number;
  completedCasesCount: number;
  createdAt: string;
}

export interface EmployeeStats {
  total: number;
  documenters: number;
  prepReview: number;
  sales: number;
  fileOperators: number;
  admins: number;
  activeCount: number;
  inactiveCount: number;
}

export interface AddEmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  department: 'DOC' | 'PREP_REVIEW' | 'SALES' | 'FILE_OP' | 'ADMIN';
  role: EmployeeRole;
  isActive: boolean;
}
