import { Request, Response, NextFunction } from "express";
import { TokenManager } from "../utils/token-manager.js";
import { UserPayload } from "../types/index.js";

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string) || (req.headers['x-access-token'] as string);
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
  const token = req.cookies?.token || bearerToken;

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
