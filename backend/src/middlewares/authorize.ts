import { Request, Response, NextFunction } from "express";
import { NotAllowedError } from "../errors/not-allowed-error.js";
import { Role } from "../types/index.js";

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser || !roles.includes(req.currentUser.role)) {
      throw new NotAllowedError();
    }

    next();
  };
};
