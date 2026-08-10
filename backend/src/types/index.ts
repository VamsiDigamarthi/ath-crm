export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
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
