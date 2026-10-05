import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { Role } from "../../types/index.js";
import { listReturnItems, addReturnItem, updateReturnItem, deleteReturnItem } from "./return-item-controller.js";
import {
  listReturnItemsSchema,
  addReturnItemSchema,
  updateReturnItemSchema,
  deleteReturnItemSchema,
} from "./return-item-validator.js";

const router = Router();

const VIEW_ROLES = [
  Role.ADMIN,
  Role.PREP_MANAGER,
  Role.TAX_PREPARER,
  Role.TAX_REVIEWER,
  Role.SALES_MANAGER,
  Role.SALES_TEAM_LEAD,
  Role.SALES_AGENT,
  Role.FILE_OP_MANAGER,
  Role.FILE_OP_TEAM_LEAD,
  Role.FILE_OP_AGENT,
];
const EDIT_ROLES = [
  Role.ADMIN,
  Role.PREP_MANAGER,
  Role.TAX_PREPARER,
  Role.TAX_REVIEWER,
  Role.SALES_MANAGER,
  Role.SALES_TEAM_LEAD,
  Role.SALES_AGENT,
];

router.get("/:applicationId/items", requireAuth, authorize(...VIEW_ROLES), validateRequest(listReturnItemsSchema), listReturnItems);
router.post("/:applicationId/items", requireAuth, authorize(...EDIT_ROLES), validateRequest(addReturnItemSchema), addReturnItem);
router.patch(
  "/:applicationId/items/:itemId",
  requireAuth,
  authorize(...EDIT_ROLES),
  validateRequest(updateReturnItemSchema),
  updateReturnItem
);
router.delete(
  "/:applicationId/items/:itemId",
  requireAuth,
  authorize(...EDIT_ROLES),
  validateRequest(deleteReturnItemSchema),
  deleteReturnItem
);

export { router as returnItemRouter };
