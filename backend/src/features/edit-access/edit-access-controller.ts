import { Request, Response } from "express";
import { EditAccessStatus } from "@prisma/client";
import { SuccessHandler } from "../../utils/success-handler.js";
import { EditAccessService } from "./edit-access-service.js";

export const getMyEditAccess = async (req: Request, res: Response) => {
  const data = await EditAccessService.getMyStatus(String(req.params.applicationId), req.currentUser!.id);
  return SuccessHandler.handle(res, "Edit access status retrieved", data);
};

export const requestEditAccess = async (req: Request, res: Response) => {
  const data = await EditAccessService.createRequest({
    applicationId: String(req.params.applicationId),
    requesterId: req.currentUser!.id,
    requesterRole: req.currentUser!.role as any,
    reason: req.body.reason,
  });
  return SuccessHandler.handle(res, "Edit access requested. An admin will review it.", data, 201);
};

export const listEditAccessRequests = async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? (req.query.status as EditAccessStatus) : undefined;
  const data = await EditAccessService.list(status);
  return SuccessHandler.handle(res, "Edit access requests retrieved", data);
};

export const approveEditAccess = async (req: Request, res: Response) => {
  const data = await EditAccessService.approve(
    String(req.params.id),
    req.currentUser!.id,
    new Date(req.body.accessUntil),
    req.body.reviewNote
  );
  return SuccessHandler.handle(res, "Edit access approved", data);
};

export const rejectEditAccess = async (req: Request, res: Response) => {
  const data = await EditAccessService.reject(String(req.params.id), req.currentUser!.id, req.body.reviewNote);
  return SuccessHandler.handle(res, "Edit access declined", data);
};

export const revokeEditAccess = async (req: Request, res: Response) => {
  const data = await EditAccessService.revoke(String(req.params.id), req.currentUser!.id);
  return SuccessHandler.handle(res, "Edit access removed", data);
};
