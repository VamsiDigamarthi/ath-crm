import { prisma } from "../../config/db.js";
import { paginate, PaginationOptions } from "../../utils/pagination.js";
import { Role, Prisma, AuditActorType, AuditActionType } from "@prisma/client";
import { NotFoundError } from "../../errors/not-found-error.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import nodemailer from "nodemailer";
import { staffEmailQueue } from "../queue/email-queue.js";


export interface CreateEmailTemplateDTO {
  name: string;
  roles: Role[];
  subject: string;
  body: string;
  isActive?: boolean;
}

export interface UpdateEmailTemplateDTO {
  name?: string;
  roles?: Role[];
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export interface EmailTemplateFilterQuery {
  search?: string;
  role?: Role;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
}

export class EmailTemplateService {
  /**
   * Return all system roles with human-friendly display labels and departments
   */
  static async getRoles() {
    const rolesList = [
      { value: Role.ADMIN, label: "Super Admin", department: "Executive" },
      { value: Role.DOC_MANAGER, label: "Documenter Manager", department: "Documenter" },
      { value: Role.DOC_TEAM_LEAD, label: "Documenter Team Lead", department: "Documenter" },
      { value: Role.DOC_AGENT, label: "Documenter Agent", department: "Documenter" },
      { value: Role.PREP_MANAGER, label: "Prep Operations Manager", department: "Tax Prep & Review" },
      { value: Role.TAX_PREPARER, label: "Tax Preparer", department: "Tax Prep & Review" },
      { value: Role.TAX_REVIEWER, label: "QA Compliance Reviewer", department: "Tax Prep & Review" },
      { value: Role.SALES_MANAGER, label: "Sales Operations Manager", department: "Sales" },
      { value: Role.SALES_TEAM_LEAD, label: "Sales Team Lead", department: "Sales" },
      { value: Role.SALES_AGENT, label: "Sales Closer / Agent", department: "Sales" },
      { value: Role.FILE_OP_MANAGER, label: "Filing Operations Manager", department: "Filing Operations" },
      { value: Role.FILE_OP_TEAM_LEAD, label: "Filing Team Lead", department: "Filing Operations" },
      { value: Role.FILE_OP_AGENT, label: "Filing Specialist", department: "Filing Operations" },
      { value: Role.TAXPAYER_USER, label: "Taxpayer / Client", department: "Customer Portal" },
    ];

    // Count templates or users associated with each role if needed
    return rolesList;
  }

  /**
   * Get paginated email templates with search and role filters
   */
  static async getTemplates(
    filters: EmailTemplateFilterQuery,
    paginationOptions: PaginationOptions
  ) {
    const { search, role, status } = filters;
    const where: Prisma.EmailTemplateWhereInput = {};

    if (search && search.trim() !== "") {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { subject: { contains: query, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.roles = {
        has: role,
      };
    }

    if (status && status !== "ALL") {
      where.isActive = status === "ACTIVE";
    }

    const result = await paginate(
      prisma.emailTemplate,
      {
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
      paginationOptions
    );

    return result;
  }

  /**
   * Get single template by ID
   */
  static async getTemplateById(id: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundError();
    }

    return template;
  }

  /**
   * Create new email template
   */
  static async createTemplate(data: CreateEmailTemplateDTO, createdById?: string) {
    // Check if template with exact same name already exists
    const existing = await prisma.emailTemplate.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: "insensitive" },
      },
    });

    if (existing) {
      throw new BadRequestError(`An email template with the name "${data.name}" already exists.`);
    }

    const newTemplate = await prisma.emailTemplate.create({
      data: {
        name: data.name.trim(),
        roles: data.roles,
        subject: data.subject.trim(),
        body: data.body,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdById: createdById || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return newTemplate;
  }

  /**
   * Update existing email template
   */
  static async updateTemplate(id: string, data: UpdateEmailTemplateDTO) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError();
    }

    if (data.name && data.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const nameConflict = await prisma.emailTemplate.findFirst({
        where: {
          name: { equals: data.name.trim(), mode: "insensitive" },
          NOT: { id },
        },
      });

      if (nameConflict) {
        throw new BadRequestError(`Another email template with the name "${data.name}" already exists.`);
      }
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.roles && { roles: data.roles }),
        ...(data.subject && { subject: data.subject.trim() }),
        ...(data.body && { body: data.body }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete email template
   */
  static async deleteTemplate(id: string) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError();
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    return { id, message: "Template deleted successfully" };
  }

  /**
   * Get active email templates accessible by the user's specific role
   */
  static async getAvailableTemplatesForRole(role: Role) {
    const templates = await prisma.emailTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { roles: { has: role } },
          ...(role === Role.ADMIN ? [] : [{ roles: { has: Role.ADMIN } }]),
        ],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        roles: true,
        subject: true,
        body: true,
        isActive: true,
      },
    });

    return templates;
  }

  /**
   * Dispatch email to customer with pre-flight confirmation check,
   * BullMQ queue entry, state tracking (QUEUED -> PROCESSING -> SENT/FAILED), and audit trail.
   */
  static async sendStaffEmail(
    userId: string,
    data: {
      applicationId?: string;
      recipientEmail: string;
      subject: string;
      body: string;
      templateId?: string;
    }
  ) {
    // 1. Pre-flight Validation & Sender Confirmation (Before entering queue)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Sender staff account not found in database.");
    }

    if (!user.isActive) {
      throw new BadRequestError("Sender staff account is deactivated.");
    }

    const cleanRecipientEmail = data.recipientEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanRecipientEmail)) {
      throw new BadRequestError(`Invalid recipient email format: "${cleanRecipientEmail}"`);
    }

    if (!data.subject || data.subject.trim() === "") {
      throw new BadRequestError("Email subject line is required before entering dispatch queue.");
    }

    if (!data.body || data.body.trim() === "") {
      throw new BadRequestError("Email message body content cannot be empty.");
    }

    // Check sender SMTP configuration
    const cleanSmtpPassword = user.smtpAppPassword
      ? user.smtpAppPassword.replace(/\s+/g, "")
      : (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
    const smtpEmail = user.smtpEmail || user.email || process.env.EMAIL_USER;

    if (!smtpEmail || !cleanSmtpPassword) {
      throw new BadRequestError(
        "Sender SMTP credentials are not configured. Please configure your email & app password before sending."
      );
    }

    // 2. Pre-Queue Confirmation: Save record in database with initial status QUEUED
    const sentRecord = await prisma.sentEmail.create({
      data: {
        applicationId: data.applicationId || null,
        senderUserId: user.id,
        recipientEmail: cleanRecipientEmail,
        subject: data.subject.trim(),
        body: data.body,
        templateId: data.templateId || null,
        status: "QUEUED",
        errorMessage: null,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            smtpEmail: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`[PRE-QUEUE CONFIRMED] SentEmail #${sentRecord.id} recorded with status QUEUED`);

    // 3. Enqueue to BullMQ for asynchronous background processing
    try {
      const job = await staffEmailQueue.add(
        "send-staff-email",
        {
          sentEmailId: sentRecord.id,
          userId: user.id,
          applicationId: data.applicationId,
          recipientEmail: cleanRecipientEmail,
          subject: data.subject.trim(),
          body: data.body,
          templateId: data.templateId,
        },
        {
          jobId: `email-${sentRecord.id}`,
        }
      );

      await prisma.sentEmail.update({
        where: { id: sentRecord.id },
        data: { jobId: job.id },
      });

      console.log(`[BULLMQ QUEUE] Enqueued job ${job.id} for SentEmail #${sentRecord.id}`);
      return {
        ...sentRecord,
        jobId: job.id,
        queueStatus: "ENQUEUED",
      };
    } catch (queueErr: any) {
      console.warn(`[BULLMQ QUEUE WARNING] Failed to enqueue to Redis, executing fallback synchronous dispatch:`, queueErr.message);

      // Fallback: Synchronous dispatch if Redis is temporarily unreachable
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: smtpEmail,
            pass: cleanSmtpPassword,
          },
        });

        const senderDisplayName =
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email ||
          "Tax Specialist";

        await transporter.sendMail({
          from: `"${senderDisplayName}" <${smtpEmail}>`,
          to: cleanRecipientEmail,
          subject: data.subject.trim(),
          html: data.body,
        });

        const updatedRecord = await prisma.sentEmail.update({
          where: { id: sentRecord.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            errorMessage: null,
          },
        });

        return updatedRecord;
      } catch (fallbackErr: any) {
        console.error("[SMTP FALLBACK ERROR]", fallbackErr);
        await prisma.sentEmail.update({
          where: { id: sentRecord.id },
          data: {
            status: "FAILED",
            errorMessage: fallbackErr.message || "Failed to dispatch email",
          },
        });

        throw new BadRequestError(
          fallbackErr.message || "Failed to dispatch email via Gmail SMTP."
        );
      }
    }
  }
}
