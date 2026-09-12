import { Request, Response } from "express";
import { EmailTemplateService } from "./email-template-service.js";
import { SuccessHandler } from "../../utils/success-handler.js";
import { Role } from "@prisma/client";

export class EmailTemplateController {
  /**
   * GET /api/email-templates/roles
   * Return all system roles available for email template targeting
   */
  static async getRoles(req: Request, res: Response) {
    const roles = await EmailTemplateService.getRoles();
    return SuccessHandler.handle(res, "System roles retrieved successfully", roles);
  }

  /**
   * GET /api/email-templates
   * Get paginated email templates with filtering
   */
  static async getTemplates(req: Request, res: Response) {
    const { page, limit, search, role, status } = req.query;

    const filters = {
      search: search ? String(search) : undefined,
      role: role ? (role as Role) : undefined,
      status: status ? (status as "ALL" | "ACTIVE" | "INACTIVE") : undefined,
    };

    const paginationOptions = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };

    const result = await EmailTemplateService.getTemplates(filters, paginationOptions);

    return res.status(200).json({
      success: true,
      message: "Email templates retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }

  /**
   * GET /api/email-templates/:id
   * Get single email template by ID
   */
  static async getTemplateById(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const template = await EmailTemplateService.getTemplateById(id);
    return SuccessHandler.handle(res, "Email template details retrieved successfully", template);
  }

  /**
   * POST /api/email-templates
   * Create new email template
   */
  static async createTemplate(req: Request, res: Response) {
    const userId = req.currentUser?.id;
    const newTemplate = await EmailTemplateService.createTemplate(req.body, userId);
    return SuccessHandler.handle(res, "Email template created successfully", newTemplate, 201);
  }

  /**
   * PUT /api/email-templates/:id
   * Update existing email template
   */
  static async updateTemplate(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await EmailTemplateService.updateTemplate(id, req.body);
    return SuccessHandler.handle(res, "Email template updated successfully", updated);
  }

  /**
   * GET /api/email-templates/available
   * Get active templates accessible to the current logged-in staff role
   */
  static async getAvailableTemplates(req: Request, res: Response) {
    const role = req.currentUser?.role;
    if (!role) {
      return SuccessHandler.handle(res, "Available templates retrieved", []);
    }
    const templates = await EmailTemplateService.getAvailableTemplatesForRole(role);
    return SuccessHandler.handle(res, "Available templates retrieved successfully", templates);
  }

  /**
   * POST /api/email-templates/send
   * Send email to client using staff member's configured SMTP credentials and record in DB
   */
  static async sendStaffEmail(req: Request, res: Response) {
    const userId = req.currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    const sentRecord = await EmailTemplateService.sendStaffEmail(userId, req.body);
    return SuccessHandler.handle(res, "Email sent successfully", sentRecord, 201);
  }

  /**
   * DELETE /api/email-templates/:id
   * Delete email template
   */
  static async deleteTemplate(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await EmailTemplateService.deleteTemplate(id);
    return SuccessHandler.handle(res, "Email template deleted successfully", result);
  }
}
