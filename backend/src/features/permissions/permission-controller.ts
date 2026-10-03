import { Request, Response } from "express";
import { SuccessHandler } from "../../utils/success-handler.js";
import { PermissionService } from "./permission-service.js";

export const listPermissions = async (_req: Request, res: Response) => {
  const data = await PermissionService.listWithUsers();
  return SuccessHandler.handle(res, "Permissions retrieved successfully", data);
};

export const setUserPermission = async (req: Request, res: Response) => {
  const result = await PermissionService.setUserPermission(
    String(req.params.key),
    String(req.params.userId),
    req.body.enabled,
    req.currentUser?.id
  );
  return SuccessHandler.handle(res, result.enabled ? "Permission granted" : "Permission removed", result);
};

export const setBulkPermission = async (req: Request, res: Response) => {
  const result = await PermissionService.setBulk(String(req.params.key), req.body.userIds, req.body.enabled, req.currentUser?.id);
  return SuccessHandler.handle(res, result.enabled ? "Permission granted" : "Permission removed", result);
};

export const getMyPermissions = async (req: Request, res: Response) => {
  const keys = req.currentUser?.id ? await PermissionService.getUserPermissionKeys(req.currentUser.id) : [];
  return SuccessHandler.handle(res, "Permissions retrieved successfully", keys);
};
