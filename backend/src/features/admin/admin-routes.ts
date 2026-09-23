import { Router } from "express";
import {
  registerAdmin,
  bulkImportLeads,
  getEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  bulkOnboardEmployees,
  getCustomers,
  getCustomerDetails,
  startNextYearApplication,
  getAdminDashboardStats,
  getReturnedLeads,
  assignReturnedLeadsBulk,
  autoRoundRobinReturnedLeads,
  getSelfSignups,
  assignSelfSignupsBulk,
  autoRoundRobinSelfSignups,
  getMasterTaxpayers,
  getTaxpayerYearDetails,
} from "./admin-controller.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import {
  registerAdminSchema,
  bulkImportLeadsSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  bulkOnboardEmployeesSchema,
  startNextYearApplicationSchema,
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

// Converted Clients & Taxpayer Directory
router.get(
  "/customers",
  requireAuth,
  authorize(Role.ADMIN),
  getCustomers
);

router.get(
  "/customers/:id",
  requireAuth,
  authorize(Role.ADMIN),
  getCustomerDetails
);

router.post(
  "/customers/:id/new-application",
  requireAuth,
  authorize(Role.ADMIN),
  validateRequest(startNextYearApplicationSchema),
  startNextYearApplication
);

// Admin Executive Operations Dashboard Stats
router.get(
  "/dashboard-stats",
  requireAuth,
  authorize(Role.ADMIN),
  getAdminDashboardStats
);

// Admin Returned Leads Management & Direct Assignment
router.get(
  "/returned-leads",
  requireAuth,
  authorize(Role.ADMIN),
  getReturnedLeads
);

router.post(
  "/returned-leads/assign-bulk",
  requireAuth,
  authorize(Role.ADMIN),
  assignReturnedLeadsBulk
);

router.post(
  "/returned-leads/assign-round-robin",
  requireAuth,
  authorize(Role.ADMIN),
  autoRoundRobinReturnedLeads
);

// Admin Direct / Online Self-Signups Management
router.get(
  "/self-signups",
  requireAuth,
  authorize(Role.ADMIN),
  getSelfSignups
);

router.post(
  "/self-signups/assign-bulk",
  requireAuth,
  authorize(Role.ADMIN),
  assignSelfSignupsBulk
);

router.post(
  "/self-signups/assign-round-robin",
  requireAuth,
  authorize(Role.ADMIN),
  autoRoundRobinSelfSignups
);

// Master Taxpayers Registry & Multi-Year Details
router.get(
  "/master-taxpayers",
  requireAuth,
  authorize(Role.ADMIN),
  getMasterTaxpayers
);

router.get(
  "/master-taxpayers/:id",
  requireAuth,
  authorize(Role.ADMIN),
  getTaxpayerYearDetails
);

router.get(
  "/master-taxpayers/:id/year/:taxYear",
  requireAuth,
  authorize(Role.ADMIN),
  getTaxpayerYearDetails
);

export { router as adminRouter };

