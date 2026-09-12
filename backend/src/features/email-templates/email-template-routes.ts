import { Router } from "express";
import { EmailTemplateController } from "./email-template-controller.js";
import {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  queryEmailTemplatesSchema,
  sendStaffEmailSchema,
} from "./email-template-validator.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { Role } from "../../types/index.js";

const router = Router();

// Protect all endpoints with authentication
router.use(requireAuth);

// Accessible by all authenticated staff:
// 1. Get available templates configured for the logged-in staff member's role
router.get("/available", EmailTemplateController.getAvailableTemplates);

// 2. Send email to client using staff member's SMTP credentials
router.post(
  "/send",
  validateRequest(sendStaffEmailSchema),
  EmailTemplateController.sendStaffEmail
);

// Admin-only template management endpoints:
router.use(authorize(Role.ADMIN));

// 3. Get system roles for email template multiselect
router.get("/roles", EmailTemplateController.getRoles);

// 4. Listing & querying with pagination
router.get(
  "/",
  validateRequest(queryEmailTemplatesSchema),
  EmailTemplateController.getTemplates
);

// 5. Single template retrieval
router.get("/:id", EmailTemplateController.getTemplateById);

// 6. Create new email template
router.post(
  "/",
  validateRequest(createEmailTemplateSchema),
  EmailTemplateController.createTemplate
);

// 7. Update existing email template
router.put(
  "/:id",
  validateRequest(updateEmailTemplateSchema),
  EmailTemplateController.updateTemplate
);

// 8. Delete email template
router.delete("/:id", EmailTemplateController.deleteTemplate);

export { router as emailTemplateRouter };

