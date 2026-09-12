export type SystemRole =
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
  | 'FILE_OP_AGENT'
  | 'TAXPAYER_USER';

export interface RoleOption {
  value: SystemRole;
  label: string;
  department: string;
}

export interface EmailTemplateItem extends Record<string, unknown> {
  id: string;
  name: string;
  roles: SystemRole[];
  subject: string;
  body: string;
  isActive: boolean;
  createdById?: string | null;
  createdBy?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateFormData {
  name: string;
  roles: SystemRole[];
  subject: string;
  body: string;
  isActive?: boolean;
}

export interface EmailTemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
}

export interface EmailTemplatesResponse {
  data: EmailTemplateItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
