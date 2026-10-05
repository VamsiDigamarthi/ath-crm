import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { Role } from "../../types/index.js";
import {
  getMyEditAccess,
  requestEditAccess,
  listEditAccessRequests,
  approveEditAccess,
  rejectEditAccess,
  revokeEditAccess,
} from "./edit-access-controller.js";
import {
  myStatusSchema,
  createRequestSchema,
  listRequestsSchema,
  approveRequestSchema,
  rejectRequestSchema,
  revokeRequestSchema,
} from "./edit-access-validator.js";

const router = Router();

const REQUESTER_ROLES = [Role.DOC_AGENT, Role.DOC_TEAM_LEAD, Role.DOC_MANAGER];

// Staff side: check own access and raise a request for a submitted return
router.get(
  "/applications/:applicationId/me",
  requireAuth,
  authorize(...REQUESTER_ROLES),
  validateRequest(myStatusSchema),
  getMyEditAccess
);
router.post(
  "/applications/:applicationId",
  requireAuth,
  authorize(...REQUESTER_ROLES),
  validateRequest(createRequestSchema),
  requestEditAccess
);

// Admin side: review requests
router.get("/", requireAuth, authorize(Role.ADMIN), validateRequest(listRequestsSchema), listEditAccessRequests);
router.patch("/:id/approve", requireAuth, authorize(Role.ADMIN), validateRequest(approveRequestSchema), approveEditAccess);
router.patch("/:id/reject", requireAuth, authorize(Role.ADMIN), validateRequest(rejectRequestSchema), rejectEditAccess);
router.patch("/:id/revoke", requireAuth, authorize(Role.ADMIN), validateRequest(revokeRequestSchema), revokeEditAccess);

export { router as editAccessRouter };
