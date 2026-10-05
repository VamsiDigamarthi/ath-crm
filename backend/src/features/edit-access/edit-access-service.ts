import { ApplicationStage, EditAccessStatus, NotificationCategory, NotificationPriority, Role } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { NotAllowedError } from "../../errors/not-allowed-error.js";

// Stages where the documenter still owns the return and can edit without asking
const DOCUMENTER_OPEN_STAGES: ApplicationStage[] = [ApplicationStage.RAW_PROSPECT, ApplicationStage.DOC_OUTREACH];

const DOCUMENTER_ROLES: Role[] = [Role.DOC_AGENT, Role.DOC_TEAM_LEAD, Role.DOC_MANAGER];

const fullName = (u?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null) =>
  u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Staff" : "Staff";

const userSelect = { id: true, firstName: true, lastName: true, email: true, role: true } as const;

export class EditAccessService {
  /** Active grant (approved and not yet expired) for this user on this application, if any */
  static async findActiveGrant(applicationId: string, userId: string) {
    return prisma.editAccessRequest.findFirst({
      where: {
        applicationId,
        requesterId: userId,
        status: EditAccessStatus.APPROVED,
        accessUntil: { gt: new Date() },
      },
      orderBy: { accessUntil: "desc" },
    });
  }

  static async getMyStatus(applicationId: string, userId: string) {
    const [activeGrant, pending] = await Promise.all([
      this.findActiveGrant(applicationId, userId),
      prisma.editAccessRequest.findFirst({
        where: { applicationId, requesterId: userId, status: EditAccessStatus.PENDING },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return {
      hasAccess: Boolean(activeGrant),
      accessUntil: activeGrant?.accessUntil ?? null,
      pendingRequestId: pending?.id ?? null,
      pendingSince: pending?.createdAt ?? null,
    };
  }

  static async createRequest(params: { applicationId: string; requesterId: string; requesterRole: Role; reason: string }) {
    if (!DOCUMENTER_ROLES.includes(params.requesterRole)) {
      throw new NotAllowedError();
    }

    const app = await prisma.taxApplication.findUnique({
      where: { id: params.applicationId },
      include: { customer: { select: { firstName: true, lastName: true } } },
    });
    if (!app) throw new NotFoundError("Tax application not found");

    if (DOCUMENTER_OPEN_STAGES.includes(app.currentStage)) {
      throw new BadRequestError("You can already edit this return. Edit access is only needed after it has been submitted.");
    }

    const status = await this.getMyStatus(params.applicationId, params.requesterId);
    if (status.hasAccess) throw new BadRequestError("You already have edit access to this return.");
    if (status.pendingRequestId) throw new BadRequestError("You already have a pending request for this return.");

    const requester = await prisma.user.findUnique({ where: { id: params.requesterId }, select: userSelect });
    const request = await prisma.editAccessRequest.create({
      data: {
        applicationId: params.applicationId,
        requesterId: params.requesterId,
        department: "DOCUMENTER",
        reason: params.reason,
      },
    });

    const clientName = `${app.customer?.firstName || ""} ${app.customer?.lastName || ""}`.trim() || "Taxpayer";
    await prisma.notification
      .create({
        data: {
          targetRole: Role.ADMIN,
          applicationId: app.id,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.HIGH,
          title: `Edit access requested: ${clientName} (TY ${app.taxYear})`,
          message: `${fullName(requester)} asked to edit this return. Reason: "${params.reason}"`,
          actionUrl: "/admin/permissions?tab=REQUESTS",
          actionLabel: "Review request",
          relatedLeadName: clientName,
        },
      })
      .catch((err) => console.error("Failed to notify admins of edit access request:", err));

    return request;
  }

  static async list(status?: EditAccessStatus) {
    const rows = await prisma.editAccessRequest.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        requester: { select: userSelect },
        reviewedBy: { select: userSelect },
        application: {
          select: {
            id: true,
            taxYear: true,
            filingType: true,
            currentStage: true,
            customer: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    const now = new Date();
    return rows.map((r) => ({
      id: r.id,
      applicationId: r.applicationId,
      department: r.department,
      reason: r.reason,
      // An approved grant whose time has run out is reported as expired
      status: r.status === EditAccessStatus.APPROVED && r.accessUntil && r.accessUntil <= now ? "EXPIRED" : r.status,
      accessUntil: r.accessUntil,
      reviewNote: r.reviewNote,
      reviewedAt: r.reviewedAt,
      reviewedByName: r.reviewedBy ? fullName(r.reviewedBy) : null,
      createdAt: r.createdAt,
      requester: { id: r.requester.id, name: fullName(r.requester), email: r.requester.email, role: r.requester.role },
      taxpayerName:
        `${r.application.customer?.firstName || ""} ${r.application.customer?.lastName || ""}`.trim() || "Taxpayer",
      taxpayerEmail: r.application.customer?.email || null,
      taxYear: r.application.taxYear,
      filingType: r.application.filingType,
      currentStage: r.application.currentStage,
    }));
  }

  private static async review(params: {
    id: string;
    reviewerId: string;
    status: EditAccessStatus;
    accessUntil?: Date;
    reviewNote?: string;
    allowedFrom: EditAccessStatus;
  }) {
    const existing = await prisma.editAccessRequest.findUnique({
      where: { id: params.id },
      include: { application: { select: { taxYear: true, customer: { select: { firstName: true, lastName: true } } } } },
    });
    if (!existing) throw new NotFoundError("Edit access request not found");
    if (existing.status !== params.allowedFrom) {
      throw new BadRequestError(`This request is already ${existing.status.toLowerCase()}.`);
    }

    const updated = await prisma.editAccessRequest.update({
      where: { id: params.id },
      data: {
        status: params.status,
        accessUntil: params.status === EditAccessStatus.APPROVED ? params.accessUntil : existing.accessUntil,
        reviewNote: params.reviewNote || null,
        reviewedById: params.reviewerId,
        reviewedAt: new Date(),
      },
    });

    const clientName =
      `${existing.application.customer?.firstName || ""} ${existing.application.customer?.lastName || ""}`.trim() || "Taxpayer";
    const until = params.accessUntil?.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const copy: Record<string, { title: string; message: string }> = {
      APPROVED: {
        title: `Edit access approved: ${clientName}`,
        message: `You can edit ${clientName} (TY ${existing.application.taxYear}) until ${until}.`,
      },
      REJECTED: {
        title: `Edit access declined: ${clientName}`,
        message: `Your request to edit ${clientName} (TY ${existing.application.taxYear}) was declined.${params.reviewNote ? ` Note: "${params.reviewNote}"` : ""}`,
      },
      REVOKED: {
        title: `Edit access removed: ${clientName}`,
        message: `Your edit access to ${clientName} (TY ${existing.application.taxYear}) was removed by an admin.`,
      },
    };

    await prisma.notification
      .create({
        data: {
          recipientUserId: existing.requesterId,
          applicationId: existing.applicationId,
          category: NotificationCategory.DOCUMENTER,
          priority: NotificationPriority.NORMAL,
          title: copy[params.status].title,
          message: copy[params.status].message,
          actionUrl: `/documenter/agent/lead/${existing.applicationId}`,
          actionLabel: "Open return",
          relatedLeadName: clientName,
        },
      })
      .catch((err) => console.error("Failed to notify requester of edit access decision:", err));

    return updated;
  }

  static approve(id: string, reviewerId: string, accessUntil: Date, reviewNote?: string) {
    if (accessUntil.getTime() <= Date.now()) {
      throw new BadRequestError("Access end time must be in the future");
    }
    return this.review({
      id,
      reviewerId,
      status: EditAccessStatus.APPROVED,
      accessUntil,
      reviewNote,
      allowedFrom: EditAccessStatus.PENDING,
    });
  }

  static reject(id: string, reviewerId: string, reviewNote?: string) {
    return this.review({ id, reviewerId, status: EditAccessStatus.REJECTED, reviewNote, allowedFrom: EditAccessStatus.PENDING });
  }

  static revoke(id: string, reviewerId: string) {
    return this.review({ id, reviewerId, status: EditAccessStatus.REVOKED, allowedFrom: EditAccessStatus.APPROVED });
  }
}
