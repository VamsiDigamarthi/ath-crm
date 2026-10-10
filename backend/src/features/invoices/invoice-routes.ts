import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { Role } from "../../types/index.js";
import { listApplicationInvoices, raiseInvoice, listMyInvoices } from "./invoice-controller.js";
import { applicationInvoiceSchema } from "./invoice-validator.js";

const router = Router();

const RAISE_ROLES = [Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT];
const VIEW_ROLES = [...RAISE_ROLES, Role.FILE_OP_MANAGER, Role.FILE_OP_AGENT];

// Customer portal: own invoices
router.get("/mine", requireAuth, authorize(Role.TAXPAYER_USER), listMyInvoices);

// Staff: invoices of one return, and raising a new one from Services & Pricing
router.get(
  "/applications/:applicationId",
  requireAuth,
  authorize(...VIEW_ROLES),
  validateRequest(applicationInvoiceSchema),
  listApplicationInvoices
);
router.post(
  "/applications/:applicationId",
  requireAuth,
  authorize(...RAISE_ROLES),
  validateRequest(applicationInvoiceSchema),
  raiseInvoice
);

export { router as invoiceRouter };
