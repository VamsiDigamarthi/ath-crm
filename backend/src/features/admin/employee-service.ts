import { prisma } from "../../config/db.js";
import { Role, Prisma } from "@prisma/client";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  role?: Role;
  isActive?: boolean;
}

export interface ListEmployeesQuery {
  search?: string;
  department?: 'ALL' | 'DOC' | 'SALES' | 'FILE_OP' | 'ADMIN';
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class EmployeeService {
  /**
   * Helper: Map Prisma Role to Department Code and Department Label
   */
  public static getDepartmentFromRole(role: Role): {
    department: 'DOC' | 'SALES' | 'FILE_OP' | 'ADMIN';
    departmentLabel: string;
    roleLabel: string;
  } {
    switch (role) {
      case Role.DOC_MANAGER:
        return { department: 'DOC', departmentLabel: 'Documenter Dept', roleLabel: 'Department Manager' };
      case Role.DOC_TEAM_LEAD:
        return { department: 'DOC', departmentLabel: 'Documenter Dept', roleLabel: 'Team Leader' };
      case Role.DOC_AGENT:
        return { department: 'DOC', departmentLabel: 'Documenter Dept', roleLabel: 'Outreach / Prep Agent' };
      case Role.SALES_MANAGER:
        return { department: 'SALES', departmentLabel: 'Sales Dept', roleLabel: 'Sales Operations Manager' };
      case Role.SALES_TEAM_LEAD:
        return { department: 'SALES', departmentLabel: 'Sales Dept', roleLabel: 'Sales Team Leader' };
      case Role.SALES_AGENT:
        return { department: 'SALES', departmentLabel: 'Sales Dept', roleLabel: 'Sales Pitch Agent' };
      case Role.FILE_OP_MANAGER:
        return { department: 'FILE_OP', departmentLabel: 'File Operator', roleLabel: 'CPA Operations Head' };
      case Role.FILE_OP_TEAM_LEAD:
        return { department: 'FILE_OP', departmentLabel: 'File Operator', roleLabel: 'Filing Team Leader' };
      case Role.FILE_OP_AGENT:
        return { department: 'FILE_OP', departmentLabel: 'File Operator', roleLabel: 'IRS E-Filer (CPA)' };
      case Role.ADMIN:
      default:
        return { department: 'ADMIN', departmentLabel: 'Administration', roleLabel: 'System Administrator' };
    }
  }

  /**
   * Helper: Map Department Code to Roles Array
   */
  public static getRolesByDepartment(dept: 'DOC' | 'SALES' | 'FILE_OP' | 'ADMIN'): Role[] {
    switch (dept) {
      case 'DOC':
        return [Role.DOC_MANAGER, Role.DOC_TEAM_LEAD, Role.DOC_AGENT];
      case 'SALES':
        return [Role.SALES_MANAGER, Role.SALES_TEAM_LEAD, Role.SALES_AGENT];
      case 'FILE_OP':
        return [Role.FILE_OP_MANAGER, Role.FILE_OP_TEAM_LEAD, Role.FILE_OP_AGENT];
      case 'ADMIN':
        return [Role.ADMIN];
    }
  }

  /**
   * List all operational staff members with filters, pagination, and workload stats
   */
  public static async listEmployees(query: ListEmployeesQuery) {
    const { search, department, role, isActive, page: queryPage, limit: queryLimit } = query;

    const page = Math.max(1, Number(queryPage) || 1);
    const limit = Math.max(1, Math.min(100, Number(queryLimit) || 10));
    const skip = (page - 1) * limit;

    // Filter staff members only (exclude client TAXPAYER_USER)
    const where: Prisma.UserWhereInput = {
      role: { not: Role.TAXPAYER_USER },
    };

    // Department Filter
    if (department && department !== 'ALL') {
      const allowedRoles = this.getRolesByDepartment(department);
      where.role = { in: allowedRoles };
    }

    // Role Filter
    if (role && role !== 'ALL' && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    // Active Status Filter
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Search Filter
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              assignedDocApps: true,
              assignedSalesApps: true,
              assignedFileApps: true,
            },
          },
        },
      }),
    ]);

    // Calculate global department stats across all staff
    const allStaff = await prisma.user.findMany({
      where: {
        role: { not: Role.TAXPAYER_USER },
      },
      select: { role: true, isActive: true },
    });

    let documenters = 0;
    let sales = 0;
    let fileOperators = 0;
    let admins = 0;
    let activeCount = 0;

    allStaff.forEach((s) => {
      const meta = this.getDepartmentFromRole(s.role);
      if (meta.department === 'DOC') documenters++;
      if (meta.department === 'SALES') sales++;
      if (meta.department === 'FILE_OP') fileOperators++;
      if (meta.department === 'ADMIN') admins++;
      if (s.isActive) activeCount++;
    });

    const stats = {
      total: allStaff.length,
      documenters,
      sales,
      fileOperators,
      admins,
      activeCount,
      inactiveCount: allStaff.length - activeCount,
    };

    const totalPages = Math.ceil(totalCount / limit) || 1;

    // Format staff items for frontend
    const employees = users.map((u) => {
      const meta = this.getDepartmentFromRole(u.role);
      const assignedCases =
        u._count.assignedDocApps + u._count.assignedSalesApps + u._count.assignedFileApps;
      const firstName = u.firstName || u.email?.split('@')[0] || 'Staff';
      const lastName = u.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        id: u.id,
        firstName,
        lastName,
        fullName,
        email: u.email || '',
        mobile: u.mobile || '',
        department: meta.department,
        departmentLabel: meta.departmentLabel,
        role: u.role,
        roleLabel: meta.roleLabel,
        isActive: u.isActive,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        assignedCasesCount: assignedCases,
        completedCasesCount: 0,
        createdAt: u.createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
      };
    });

    return {
      employees,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Create single staff member
   * IMPORTANT: Duplicate check is ONLY performed against currently ACTIVE users!
   */
  public static async createEmployee(input: CreateEmployeeInput) {
    const { firstName, lastName, email, mobile, role, isActive = true } = input;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    // Check duplicate ONLY among ACTIVE users
    const existingActive = await prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
      },
    });

    if (existingActive) {
      throw new BadRequestError(
        `Active staff account with email '${normalizedEmail}' or mobile '${normalizedMobile}' already exists`
      );
    }

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        mobile: normalizedMobile,
        role,
        isActive,
      },
    });

    const meta = this.getDepartmentFromRole(user.role);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      mobile: user.mobile,
      department: meta.department,
      departmentLabel: meta.departmentLabel,
      role: user.role,
      roleLabel: meta.roleLabel,
      isActive: user.isActive,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}${user.lastName}`,
      assignedCasesCount: 0,
      completedCasesCount: 0,
      createdAt: user.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    };
  }

  /**
   * Update existing staff member
   */
  public static async updateEmployee(id: string, input: UpdateEmployeeInput) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Staff member not found");
    }

    if (!existing.isActive && input.isActive !== true) {
      throw new BadRequestError("Cannot edit details of an inactive staff member. Please activate the account first.");
    }

    // Check uniqueness among ACTIVE users if email, mobile, or active status is updated
    if (input.email || input.mobile || input.isActive === true) {
      const normalizedEmail = input.email ? input.email.trim().toLowerCase() : existing.email || undefined;
      const normalizedMobile = input.mobile ? input.mobile.trim() : existing.mobile || undefined;

      const conflict = await prisma.user.findFirst({
        where: {
          id: { not: id },
          isActive: true,
          OR: [
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ...(normalizedMobile ? [{ mobile: normalizedMobile }] : []),
          ],
        },
      });
      if (conflict) {
        throw new BadRequestError("Another active staff member already exists with this email or mobile number");
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(input.firstName !== undefined && { firstName: input.firstName.trim() }),
        ...(input.lastName !== undefined && { lastName: input.lastName.trim() }),
        ...(input.email !== undefined && { email: input.email.trim().toLowerCase() }),
        ...(input.mobile !== undefined && { mobile: input.mobile.trim() }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    const meta = this.getDepartmentFromRole(updated.role);
    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      fullName: `${updated.firstName} ${updated.lastName}`.trim(),
      email: updated.email,
      mobile: updated.mobile,
      department: meta.department,
      departmentLabel: meta.departmentLabel,
      role: updated.role,
      roleLabel: meta.roleLabel,
      isActive: updated.isActive,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${updated.firstName}${updated.lastName}`,
    };
  }

  /**
   * Toggle staff active / inactive status
   */
  public static async toggleStatus(id: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Staff member not found");
    }

    const newStatus = !existing.isActive;

    // If activating (false -> true), verify no other active user has this email/mobile
    if (newStatus) {
      const conflict = await prisma.user.findFirst({
        where: {
          id: { not: id },
          isActive: true,
          OR: [
            ...(existing.email ? [{ email: existing.email }] : []),
            ...(existing.mobile ? [{ mobile: existing.mobile }] : []),
          ],
        },
      });
      if (conflict) {
        throw new BadRequestError(
          "Cannot activate this staff member because another active account already uses this email or mobile"
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: newStatus },
    });

    return {
      id: updated.id,
      isActive: updated.isActive,
      fullName: `${updated.firstName || ''} ${updated.lastName || ''}`.trim() || updated.email,
    };
  }

  /**
   * Bulk Onboard Staff with ACTIVE deduplication only
   */
  public static async bulkOnboard(staffList: CreateEmployeeInput[]) {
    if (!staffList || staffList.length === 0) {
      throw new BadRequestError("No staff records provided for onboarding");
    }

    // Collect all incoming emails and mobiles (normalized)
    const emails = staffList.map((s) => s.email.trim().toLowerCase()).filter(Boolean);
    const mobiles = staffList.map((s) => s.mobile.trim()).filter(Boolean);

    // Find existing among ACTIVE users ONLY
    const existingActiveUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { email: { in: emails } },
          { mobile: { in: mobiles } },
        ],
      },
      select: { email: true, mobile: true },
    });

    const existingEmailSet = new Set(existingActiveUsers.map((u) => u.email?.toLowerCase()));
    const existingMobileSet = new Set(existingActiveUsers.map((u) => u.mobile));

    const validNewStaff = staffList.filter((s) => {
      const emailMatch = s.email && existingEmailSet.has(s.email.trim().toLowerCase());
      const mobileMatch = s.mobile && existingMobileSet.has(s.mobile.trim());
      return !emailMatch && !mobileMatch;
    });

    if (validNewStaff.length === 0) {
      return {
        totalReceived: staffList.length,
        createdCount: 0,
        duplicatesSkipped: staffList.length,
      };
    }

    // Create in bulk
    await prisma.user.createMany({
      data: validNewStaff.map((s) => ({
        firstName: s.firstName.trim(),
        lastName: s.lastName.trim(),
        email: s.email.trim().toLowerCase(),
        mobile: s.mobile.trim(),
        role: s.role,
        isActive: s.isActive ?? true,
      })),
    });

    return {
      totalReceived: staffList.length,
      createdCount: validNewStaff.length,
      duplicatesSkipped: staffList.length - validNewStaff.length,
    };
  }
}
