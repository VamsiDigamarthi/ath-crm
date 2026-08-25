export enum Role {
  ADMIN = "ADMIN",
  DOC_MANAGER = "DOC_MANAGER",
  DOC_TEAM_LEAD = "DOC_TEAM_LEAD",
  DOC_AGENT = "DOC_AGENT",
  PREP_MANAGER = "PREP_MANAGER",
  TAX_REVIEWER = "TAX_REVIEWER",
  TAX_PREPARER = "TAX_PREPARER",
  SALES_MANAGER = "SALES_MANAGER",
  SALES_TEAM_LEAD = "SALES_TEAM_LEAD",
  SALES_AGENT = "SALES_AGENT",
  FILE_OP_MANAGER = "FILE_OP_MANAGER",
  FILE_OP_TEAM_LEAD = "FILE_OP_TEAM_LEAD",
  FILE_OP_AGENT = "FILE_OP_AGENT",
  TAXPAYER_USER = "TAXPAYER_USER",
}

export interface UserPayload {
  id: string;
  email?: string | null;
  mobile?: string | null;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
