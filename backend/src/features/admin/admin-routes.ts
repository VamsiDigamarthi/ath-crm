import { Router } from "express";
import {
  registerAdmin,
  bulkImportLeads,
  getEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  bulkOnboardEmployees,
} from "./admin-controller.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import {
  registerAdminSchema,
  bulkImportLeadsSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  bulkOnboardEmployeesSchema,
} from "./admin-validator.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { Role } from "../../types/index.js";

const router = Router();

// Public / Initial Registration
router.post("/register", validateRequest(registerAdminSchema), registerAdmin);

// Lead Ingestion
router.post(
  "/leads/bulk-import",
  requireAuth,
  authorize(Role.ADMIN),
  validateRequest(bulkImportLeadsSchema),
  bulkImportLeads
);

// Staff & Employee Management (Active / Inactive Status Flow)
router.get(
  "/employees",
  requireAuth,
  authorize(Role.ADMIN),
  getEmployees
);

router.post(
  "/employees",
  requireAuth,
  authorize(Role.ADMIN),
  validateRequest(createEmployeeSchema),
  createEmployee
);

router.put(
  "/employees/:id",
  requireAuth,
  authorize(Role.ADMIN),
  validateRequest(updateEmployeeSchema),
  updateEmployee
);

router.patch(
  "/employees/:id/toggle-status",
  requireAuth,
  authorize(Role.ADMIN),
  toggleEmployeeStatus
);

router.post(
  "/employees/bulk-onboard",
  requireAuth,
  authorize(Role.ADMIN),
  validateRequest(bulkOnboardEmployeesSchema),
  bulkOnboardEmployees
);

export { router as adminRouter };
