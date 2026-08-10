import { Request, Response, NextFunction } from "express";
import { TokenManager } from "../utils/token-manager.js";
import { UserPayload } from "../types/index.js";

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return next();
  }

  try {
    const payload = TokenManager.verifyToken(token) as UserPayload;
    req.currentUser = payload;
  } catch (err) {
    // If token is invalid, we just continue without setting currentUser
  }

  next();
};
