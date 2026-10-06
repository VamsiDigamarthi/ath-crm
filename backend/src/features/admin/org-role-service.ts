import { prisma } from "../../config/db.js";
import { Role } from "@prisma/client";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";

export interface CreateOrgRoleInput {
  name: string;
  description?: string;
  systemRole: Role;
  department?: string;
  sidebarPermissions: string[];
  defaultRoute?: string;
}

export interface UpdateOrgRoleInput {
  name?: string;
  description?: string;
  systemRole?: Role;
  department?: string;
  sidebarPermissions?: string[];
  defaultRoute?: string;
}

export const DEFAULT_ORG_ROLES: Array<{
  name: string;
  systemRole: Role;
  department: string;
  description: string;
  defaultRoute: string;
  sidebarPermissions: string[];
}> = [
  {
    name: "System Administrator",
    systemRole: Role.ADMIN,
    department: "ADMIN",
    description: "Full administrative access to entire platform, team, settings, and directory.",
    defaultRoute: "/admin/dashboard",
    sidebarPermissions: [
      "*",
      "dashboard",
      "prospects",
      "self-signups",
      "returned-leads",
      "all-taxpayers",
      "coupons",
      "products",
      "customers",
      "employees",
      "roles",
      "email-templates",
      "documenter",
      "prep-review",
      "sales",
      "filing",
      "notifications",
      "permissions",
      "settings",
    ],
  },
  {
    name: "Documenter Manager",
    systemRole: Role.DOC_MANAGER,
    department: "DOC",
    description: "Supervises outreach, lead intake, verification queues, and team scorecards.",
    defaultRoute: "/documenter/manager",
    sidebarPermissions: [
      "dashboard",
      "self_signups",
      "caseload",
      "scorecards",
      "notifications",
      "doc_manager_dashboard",
      "doc_self_signups",
      "doc_department_queue",
      "doc_scorecards",
      "doc_manager_notifications",
    ],
  },
  {
    name: "Documenter Agent",
    systemRole: Role.DOC_AGENT,
    department: "DOC",
    description: "Handles taxpayer intake calls, verifies documents, and schedules callbacks.",
    defaultRoute: "/documenter/agent/queue",
    sidebarPermissions: [
      "agent_dashboard",
      "agent_queue",
      "agent_callbacks",
      "agent_fallback",
      "agent_documents",
      "notifications",
      "doc_agent_dashboard",
      "doc_my_calling",
      "doc_scheduled_callbacks",
      "doc_fallback_leads",
      "doc_my_documents",
      "doc_agent_notifications",
    ],
  },
  {
    name: "Tax Preparation Manager",
    systemRole: Role.PREP_MANAGER,
    department: "PREP_REVIEW",
    description: "Oversees tax return preparation assignments, capacity, and queue distribution.",
    defaultRoute: "/prep-review/manager/queue",
    sidebarPermissions: [
      "dashboard",
      "caseload",
      "staff",
      "notifications",
      "prep_manager_dashboard",
      "prep_department_queue",
      "prep_staff",
      "prep_manager_notifications",
    ],
  },
  {
    name: "Tax Preparer",
    systemRole: Role.TAX_PREPARER,
    department: "PREP_REVIEW",
    description: "Prepares Form 1040 computations, drafts returns, and submits to QA.",
    defaultRoute: "/prep-review/preparer",
    sidebarPermissions: [
      "specialist_hub",
      "preparer",
      "notifications",
      "prep_specialist_hub",
      "prep_preparer",
      "prep_specialist_notifications",
    ],
  },
  {
    name: "Tax Reviewer (QA)",
    systemRole: Role.TAX_REVIEWER,
    department: "PREP_REVIEW",
    description: "Audits computed returns for compliance, signs off, or requests revisions.",
    defaultRoute: "/prep-review/reviewer",
    sidebarPermissions: [
      "specialist_hub",
      "reviewer",
      "notifications",
      "prep_specialist_hub",
      "prep_reviewer",
      "prep_specialist_notifications",
    ],
  },
  {
    name: "Sales Manager",
    systemRole: Role.SALES_MANAGER,
    department: "SALES",
    description: "Monitors sales pitch pipelines, dual-role agents, and discounts.",
    defaultRoute: "/sales/manager/queue",
    sidebarPermissions: [
      "dashboard",
      "pipeline",
      "dual_role",
      "team",
      "coupons",
      "notifications",
      "sales_manager_dashboard",
      "sales_department_queue",
      "sales_dual_role",
      "sales_team",
      "sales_coupons",
      "sales_manager_notifications",
    ],
  },
  {
    name: "Sales Closer Agent",
    systemRole: Role.SALES_AGENT,
    department: "SALES",
    description: "Pitches pricing, discounts, and closes tax filing contracts.",
    defaultRoute: "/sales/agent/queue",
    sidebarPermissions: [
      "agent_hub",
      "pitch_queue",
      "notifications",
      "sales_agent_hub",
      "sales_pitch_queue",
      "sales_agent_notifications",
    ],
  },
  {
    name: "Filing Operations Manager",
    systemRole: Role.FILE_OP_MANAGER,
    department: "FILE_OP",
    description: "Oversees CPA transmissions, electronic IRS filings, and batch approvals.",
    defaultRoute: "/filing/manager/queue",
    sidebarPermissions: [
      "dashboard",
      "queue",
      "team",
      "notifications",
      "filing_manager_dashboard",
      "filing_department_queue",
      "filing_team",
      "filing_manager_notifications",
    ],
  },
  {
    name: "Filing Specialist (CPA)",
    systemRole: Role.FILE_OP_AGENT,
    department: "FILE_OP",
    description: "Executes final IRS e-filing transmissions and tracks acknowledgements.",
    defaultRoute: "/filing/agent/queue",
    sidebarPermissions: [
      "agent_hub",
      "agent_queue",
      "notifications",
      "filing_agent_hub",
      "filing_transmission_queue",
      "filing_agent_notifications",
    ],
  },
];

export class OrgRoleService {
  /**
   * Seed default system OrgRoles and backfill any users who don't have UserOrgRole mappings yet.
   */
  public static async seedDefaultOrgRoles() {
    for (const def of DEFAULT_ORG_ROLES) {
      const existing = await prisma.orgRole.findFirst({
        where: { name: def.name },
      });

      if (!existing) {
        await prisma.orgRole.create({
          data: {
            name: def.name,
            description: def.description,
            systemRole: def.systemRole,
            department: def.department,
            sidebarPermissions: def.sidebarPermissions,
            defaultRoute: def.defaultRoute,
            isSystemDefault: true,
          },
        });
      } else {
        await prisma.orgRole.update({
          where: { id: existing.id },
          data: {
            sidebarPermissions: def.sidebarPermissions,
            defaultRoute: def.defaultRoute,
            description: def.description,
            systemRole: def.systemRole,
            department: def.department,
          },
        });
      }
    }

    // Backfill existing staff users who have no orgRoles assigned
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        orgRoles: { none: {} },
      },
      select: { id: true, role: true },
    });

    const allOrgRoles = await prisma.orgRole.findMany();

    for (const u of usersWithoutRoles) {
      // Find matching default org role for user's system role
      const matchedOrgRole = allOrgRoles.find((r) => r.systemRole === u.role) ||
        allOrgRoles.find((r) => r.systemRole === Role.ADMIN);

      if (matchedOrgRole) {
        await prisma.userOrgRole.create({
          data: {
            userId: u.id,
            orgRoleId: matchedOrgRole.id,
            isPrimary: true,
          },
        });
        await prisma.user.update({
          where: { id: u.id },
          data: { activeOrgRoleId: matchedOrgRole.id },
        });
      }
    }
  }

  /**
   * List all defined OrgRoles with counts of assigned users
   */
  public static async listOrgRoles() {
    await this.seedDefaultOrgRoles();

    const roles = await prisma.orgRole.findMany({
      orderBy: [{ isSystemDefault: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { userRoles: true },
        },
      },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      systemRole: r.systemRole,
      department: r.department,
      sidebarPermissions: r.sidebarPermissions,
      defaultRoute: r.defaultRoute,
      isSystemDefault: r.isSystemDefault,
      userCount: r._count.userRoles,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Get a single OrgRole by ID
   */
  public static async getOrgRoleById(id: string) {
    const role = await prisma.orgRole.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    return role;
  }

  /**
   * Create a new custom OrgRole
   */
  public static async createOrgRole(data: CreateOrgRoleInput) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestError("Role name is required");
    }

    const trimmedName = data.name.trim();
    const existing = await prisma.orgRole.findFirst({
      where: { name: { equals: trimmedName, mode: "insensitive" } },
    });

    if (existing) {
      throw new BadRequestError(`A role with name "${trimmedName}" already exists`);
    }

    const created = await prisma.orgRole.create({
      data: {
        name: trimmedName,
        description: data.description?.trim() || null,
        systemRole: data.systemRole,
        department: data.department || "CUSTOM",
        sidebarPermissions: Array.isArray(data.sidebarPermissions) ? data.sidebarPermissions : [],
        defaultRoute: data.defaultRoute?.trim() || null,
        isSystemDefault: false,
      },
    });

    return created;
  }

  /**
   * Update an existing OrgRole
   */
  public static async updateOrgRole(id: string, data: UpdateOrgRoleInput) {
    const role = await prisma.orgRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const updatePayload: any = {};

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) throw new BadRequestError("Role name cannot be empty");

      const existing = await prisma.orgRole.findFirst({
        where: {
          name: { equals: trimmedName, mode: "insensitive" },
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestError(`A role with name "${trimmedName}" already exists`);
      }
      updatePayload.name = trimmedName;
    }

    if (data.description !== undefined) {
      updatePayload.description = data.description?.trim() || null;
    }

    if (data.systemRole !== undefined) {
      updatePayload.systemRole = data.systemRole;
    }

    if (data.department !== undefined) {
      updatePayload.department = data.department;
    }

    if (data.sidebarPermissions !== undefined) {
      updatePayload.sidebarPermissions = Array.isArray(data.sidebarPermissions)
        ? data.sidebarPermissions
        : [];
    }

    if (data.defaultRoute !== undefined) {
      updatePayload.defaultRoute = data.defaultRoute?.trim() || null;
    }

    const updated = await prisma.orgRole.update({
      where: { id },
      data: updatePayload,
    });

    return updated;
  }

  /**
   * Delete an OrgRole (custom roles only)
   */
  public static async deleteOrgRole(id: string) {
    const role = await prisma.orgRole.findUnique({
      where: { id },
      include: { _count: { select: { userRoles: true } } },
    });

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    if (role.isSystemDefault) {
      throw new BadRequestError("System default roles cannot be deleted. You can edit their permissions instead.");
    }

    // Delete role (cascade deletes UserOrgRole junction records)
    await prisma.orgRole.delete({ where: { id } });

    // For any user whose activeOrgRoleId was this deleted role, reset to their first available role
    const affectedUsers = await prisma.user.findMany({
      where: { activeOrgRoleId: id },
      include: { orgRoles: { take: 1 } },
    });

    for (const u of affectedUsers) {
      const nextRoleId = u.orgRoles[0]?.orgRoleId || null;
      await prisma.user.update({
        where: { id: u.id },
        data: { activeOrgRoleId: nextRoleId },
      });
    }

    return { success: true, message: `Role "${role.name}" deleted successfully` };
  }

  /**
   * Switch the active OrgRole for a user
   */
  public static async switchUserActiveRole(userId: string, targetOrgRoleId: string) {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orgRoles: {
          include: { orgRole: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // 2. Check if the user is assigned this orgRole (or is root ADMIN)
    const isRootAdmin =
      user.role === Role.ADMIN ||
      user.orgRoles.some((ur) => ur.orgRole.systemRole === Role.ADMIN);

    const assigned = user.orgRoles.find((ur) => ur.orgRoleId === targetOrgRoleId);

    let targetRole = assigned?.orgRole;

    if (!targetRole && isRootAdmin) {
      targetRole = (await prisma.orgRole.findUnique({ where: { id: targetOrgRoleId } })) || undefined;
    }

    if (!targetRole) {
      throw new BadRequestError("You are not assigned to this role");
    }

    // 3. Update user's activeOrgRoleId and underlying system role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        activeOrgRoleId: targetRole.id,
        role: targetRole.systemRole,
      },
      include: {
        orgRoles: {
          include: { orgRole: true },
        },
      },
    });

    return {
      activeOrgRole: {
        id: targetRole.id,
        name: targetRole.name,
        systemRole: targetRole.systemRole,
        department: targetRole.department,
        sidebarPermissions: targetRole.sidebarPermissions,
        defaultRoute: targetRole.defaultRoute,
      },
      user: updatedUser,
    };
  }

  /**
   * Assign multiple OrgRoles to a user (used by Add/Edit Employee Drawer)
   */
  public static async setUserOrgRoles(userId: string, orgRoleIds: string[], primaryOrgRoleId?: string) {
    if (!orgRoleIds || orgRoleIds.length === 0) {
      return;
    }

    // Remove existing assignments
    await prisma.userOrgRole.deleteMany({ where: { userId } });

    // Effective primary role
    const effectivePrimaryId = primaryOrgRoleId && orgRoleIds.includes(primaryOrgRoleId)
      ? primaryOrgRoleId
      : orgRoleIds[0];

    // Create new assignments
    await prisma.userOrgRole.createMany({
      data: orgRoleIds.map((rId) => ({
        userId,
        orgRoleId: rId,
        isPrimary: rId === effectivePrimaryId,
      })),
    });

    // Fetch primary role's systemRole
    const primaryRole = await prisma.orgRole.findUnique({
      where: { id: effectivePrimaryId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        activeOrgRoleId: effectivePrimaryId,
        ...(primaryRole ? { role: primaryRole.systemRole } : {}),
      },
    });
  }
}
