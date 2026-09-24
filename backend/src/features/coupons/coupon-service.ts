import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { 
  CouponDiscountType, 
  CouponJustificationCategory, 
  CouponStatus,
  Role,
  Prisma
} from "@prisma/client";
import type { 
  CreateCouponInput, 
  ValidateCouponInput, 
  ApplyCouponInput, 
  CouponFilterQuery, 
  CouponAuditFilterQuery 
} from "./coupon-types.js";

export class CouponService {
  /**
   * Create a new manager-approved discount coupon with strict business justification
   */
  public static async createCoupon(input: CreateCouponInput, creatorUserId: string) {
    const existingCoupon = await prisma.discountCoupon.findUnique({
      where: { code: input.code.toUpperCase().trim() },
    });

    if (existingCoupon) {
      throw new BadRequestError(`Coupon code '${input.code.toUpperCase()}' already exists`);
    }

    // Identify creator and approver
    const creator = await prisma.user.findUnique({
      where: { id: creatorUserId },
    });

    if (!creator) {
      throw new NotFoundError("Creator user profile not found");
    }

    // An approver can be explicitly specified or default to the authenticated manager
    let approverId = input.approvedById || creatorUserId;
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
    });

    if (!approver) {
      throw new BadRequestError("Approving manager profile not found");
    }

    // Verify creator or approver holds a management or team lead role
    const managerRoles: Role[] = [
      Role.ADMIN,
      Role.SALES_MANAGER,
      Role.SALES_TEAM_LEAD,
      Role.DOC_MANAGER,
      Role.DOC_TEAM_LEAD,
      Role.PREP_MANAGER,
      Role.FILE_OP_MANAGER,
      Role.FILE_OP_TEAM_LEAD,
    ];

    const hasManagerPrivilege = managerRoles.includes(creator.role) || managerRoles.includes(approver.role);
    if (!hasManagerPrivilege) {
      throw new BadRequestError(
        "Manager-Approved Justification Violation: Discount coupons must originate exclusively from a Manager or Team Leader"
      );
    }

    const coupon = await prisma.discountCoupon.create({
      data: {
        code: input.code.toUpperCase().trim(),
        description: input.description,
        discountType: input.discountType,
        discountValue: new Prisma.Decimal(input.discountValue),
        minServiceFee: input.minServiceFee !== undefined ? new Prisma.Decimal(input.minServiceFee) : new Prisma.Decimal(0),
        maxDiscountAmount: input.maxDiscountAmount !== undefined ? new Prisma.Decimal(input.maxDiscountAmount) : null,
        justificationCategory: input.justificationCategory,
        justificationNotes: input.justificationNotes.trim(),
        createdById: creatorUserId,
        approvedById: approverId,
        validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        maxUsageLimit: input.maxUsageLimit || null,
        timesUsed: 0,
        status: CouponStatus.ACTIVE,
        isActive: true,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
    });

    return coupon;
  }

  /**
   * Get all coupons with filtering, search, and pagination
   */
  public static async getCoupons(query: CouponFilterQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.DiscountCouponWhereInput = {};

    if (query.search && query.search.trim() !== '') {
      const s = query.search.trim();
      where.OR = [
        { code: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { justificationNotes: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as CouponStatus;
    }

    if (query.category && query.category !== 'ALL') {
      where.justificationCategory = query.category as CouponJustificationCategory;
    }

    if (query.discountType && query.discountType !== 'ALL') {
      where.discountType = query.discountType as CouponDiscountType;
    }

    const [coupons, totalCount] = await Promise.all([
      prisma.discountCoupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
          approvedBy: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
          _count: {
            select: { usages: true },
          },
        },
      }),
      prisma.discountCoupon.count({ where }),
    ]);

    // Check if any coupons need automatic expiration update
    const now = new Date();
    const formattedCoupons = coupons.map((c: any) => {
      let currentStatus = c.status;
      if (c.validUntil && c.validUntil < now && currentStatus === CouponStatus.ACTIVE) {
        currentStatus = CouponStatus.EXPIRED;
      } else if (c.maxUsageLimit && c.timesUsed >= c.maxUsageLimit && currentStatus === CouponStatus.ACTIVE) {
        currentStatus = CouponStatus.DEPLETED;
      }

      return {
        id: c.id,
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: Number(c.discountValue),
        minServiceFee: Number(c.minServiceFee || 0),
        maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
        justificationCategory: c.justificationCategory,
        justificationNotes: c.justificationNotes,
        validFrom: c.validFrom.toISOString(),
        validUntil: c.validUntil ? c.validUntil.toISOString() : null,
        maxUsageLimit: c.maxUsageLimit,
        timesUsed: c.timesUsed,
        status: currentStatus,
        isActive: c.isActive && currentStatus === CouponStatus.ACTIVE,
        createdAt: c.createdAt.toISOString(),
        createdBy: {
          id: c.createdBy?.id || '',
          name: `${c.createdBy?.firstName || ''} ${c.createdBy?.lastName || ''}`.trim() || c.createdBy?.email || 'Admin',
          email: c.createdBy?.email || '',
          role: c.createdBy?.role || 'ADMIN',
        },
        approvedBy: {
          id: c.approvedBy?.id || '',
          name: `${c.approvedBy?.firstName || ''} ${c.approvedBy?.lastName || ''}`.trim() || c.approvedBy?.email || 'Manager',
          email: c.approvedBy?.email || '',
          role: c.approvedBy?.role || 'ADMIN',
        },
      };
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      records: formattedCoupons,
      totalCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get KPI statistics and justification breakdown
   */
  public static async getCouponStats() {
    const [
      totalCoupons,
      activeCoupons,
      totalUsages,
      usagesAggregate,
      categoryGroupings,
    ] = await Promise.all([
      prisma.discountCoupon.count(),
      prisma.discountCoupon.count({ where: { status: CouponStatus.ACTIVE, isActive: true } }),
      prisma.couponUsage.count(),
      prisma.couponUsage.aggregate({
        _sum: {
          discountAmount: true,
          originalFee: true,
          finalFee: true,
        },
      }),
      prisma.couponUsage.groupBy({
        by: ['justificationCategory'],
        _count: { id: true },
        _sum: { discountAmount: true },
      }),
    ]);

    const totalDiscountGiven = Number(usagesAggregate._sum.discountAmount || 0);
    const totalRevenueGenerated = Number(usagesAggregate._sum.finalFee || 0);

    const justificationBreakdown = categoryGroupings.map((cg: any) => ({
      category: cg.justificationCategory,
      count: cg._count.id,
      totalDiscount: Number(cg._sum.discountAmount || 0),
      percentage: totalUsages > 0 ? Math.round((cg._count.id / totalUsages) * 100) : 0,
    }));

    return {
      totalCoupons,
      activeCoupons,
      totalRedemptions: totalUsages,
      totalDiscountGiven,
      totalRevenueGenerated,
      justificationBreakdown,
    };
  }

  /**
   * Validate a coupon code and calculate the discount without applying it (Quote Simulator & Live Verification)
   */
  public static async validateCoupon(input: ValidateCouponInput) {
    const code = input.code.toUpperCase().trim();
    const serviceFee = Number(input.serviceFee);

    const coupon = await prisma.discountCoupon.findUnique({
      where: { code },
      include: {
        approvedBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
    });

    if (!coupon) {
      throw new BadRequestError(`Invalid promo code '${code}'. Please check spelling or verify manager authorization.`);
    }

    if (!coupon.isActive || coupon.status === CouponStatus.DISABLED) {
      throw new BadRequestError(`Coupon code '${code}' has been disabled by management.`);
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      throw new BadRequestError(`Coupon code '${code}' is not yet active.`);
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      throw new BadRequestError(`Coupon code '${code}' expired on ${coupon.validUntil.toLocaleDateString()}.`);
    }

    if (coupon.maxUsageLimit && coupon.timesUsed >= coupon.maxUsageLimit) {
      throw new BadRequestError(`Coupon code '${code}' has reached its maximum authorized redemption limit (${coupon.maxUsageLimit} uses).`);
    }

    const minFee = Number(coupon.minServiceFee || 0);
    if (serviceFee < minFee) {
      throw new BadRequestError(
        `Coupon '${code}' requires a minimum service fee of $${minFee.toFixed(2)}. Current fee: $${serviceFee.toFixed(2)}.`
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === CouponDiscountType.FLAT) {
      discountAmount = Math.min(Number(coupon.discountValue), serviceFee);
    } else if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      discountAmount = (serviceFee * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
      discountAmount = Math.min(discountAmount, serviceFee);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalFee = Math.max(0, serviceFee - discountAmount);

    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      originalFee: serviceFee,
      discountAmount,
      finalFee,
      justificationCategory: coupon.justificationCategory,
      justificationNotes: coupon.justificationNotes,
      approvedBy: {
        id: coupon.approvedBy.id,
        name: `${coupon.approvedBy.firstName || ''} ${coupon.approvedBy.lastName || ''}`.trim() || coupon.approvedBy.email || 'Manager',
        email: coupon.approvedBy.email || '',
        role: coupon.approvedBy.role,
      },
    };
  }

  /**
   * Apply and permanently redeem a manager-approved coupon to a Tax Application quotation
   */
  public static async applyCoupon(input: ApplyCouponInput, appliedByUserId: string) {
    const validation = await this.validateCoupon({
      code: input.code,
      serviceFee: input.serviceFee,
      applicationId: input.applicationId,
      customerId: input.customerId,
    });

    const application = await prisma.taxApplication.findUnique({
      where: { id: input.applicationId },
      include: { customer: true },
    });

    if (!application) {
      throw new NotFoundError(`Tax Application with ID ${input.applicationId} not found`);
    }

    const customerId = input.customerId || application.customerId;

    // Create persistent CouponUsage audit entry
    const usage = await prisma.couponUsage.create({
      data: {
        couponId: validation.couponId,
        couponCode: validation.code,
        applicationId: input.applicationId,
        customerId,
        appliedByUserId,
        originalFee: new Prisma.Decimal(validation.originalFee),
        discountAmount: new Prisma.Decimal(validation.discountAmount),
        finalFee: new Prisma.Decimal(validation.finalFee),
        justificationCategory: validation.justificationCategory,
        justificationNotes: validation.justificationNotes,
      },
      include: {
        appliedByUser: {
          select: { id: true, firstName: true, lastName: true, role: true, email: true },
        },
      },
    });

    // Increment timesUsed on coupon and mark depleted if limit reached
    const updatedCoupon = await prisma.discountCoupon.update({
      where: { id: validation.couponId },
      data: {
        timesUsed: { increment: 1 },
      },
    });

    if (updatedCoupon.maxUsageLimit && updatedCoupon.timesUsed >= updatedCoupon.maxUsageLimit) {
      await prisma.discountCoupon.update({
        where: { id: validation.couponId },
        data: { status: CouponStatus.DEPLETED },
      });
    }

    // Update tax application summary
    const currentSummary = (application.taxDraftSummary as any) || {};
    const updatedSummary = {
      ...currentSummary,
      serviceFee: validation.finalFee,
      originalFee: validation.originalFee,
      discountAmount: validation.discountAmount,
      appliedCoupon: {
        code: validation.code,
        discountAmount: validation.discountAmount,
        justificationCategory: validation.justificationCategory,
        justificationNotes: validation.justificationNotes,
        approvedByName: validation.approvedBy.name,
        appliedAt: new Date().toISOString(),
      },
    };

    await prisma.taxApplication.update({
      where: { id: input.applicationId },
      data: {
        taxDraftSummary: updatedSummary,
      },
    });

    // Update or create SalesQuote
    const existingQuote = await prisma.salesQuote.findFirst({
      where: { applicationId: input.applicationId },
    });

    if (existingQuote) {
      await prisma.salesQuote.update({
        where: { id: existingQuote.id },
        data: {
          quoteAmount: new Prisma.Decimal(validation.finalFee),
          discountAmount: new Prisma.Decimal(validation.discountAmount),
          userFeedback: `Applied Manager Approved Coupon: ${validation.code} (${validation.justificationCategory})`,
        },
      });
    }

    return {
      usageId: usage.id,
      applicationId: input.applicationId,
      code: validation.code,
      originalFee: validation.originalFee,
      discountAmount: validation.discountAmount,
      finalFee: validation.finalFee,
      justificationCategory: validation.justificationCategory,
      justificationNotes: validation.justificationNotes,
      approvedBy: validation.approvedBy,
      appliedBy: {
        id: usage.appliedByUser.id,
        name: `${usage.appliedByUser.firstName || ''} ${usage.appliedByUser.lastName || ''}`.trim() || usage.appliedByUser.email,
        role: usage.appliedByUser.role,
      },
      appliedAt: usage.appliedAt.toISOString(),
    };
  }

  /**
   * Toggle status or disable coupon
   */
  public static async toggleCouponStatus(id: string, status?: CouponStatus, isActive?: boolean) {
    const coupon = await prisma.discountCoupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundError(`Coupon with ID ${id} not found`);
    }

    const updated = await prisma.discountCoupon.update({
      where: { id },
      data: {
        status: status || (isActive === false ? CouponStatus.DISABLED : CouponStatus.ACTIVE),
        isActive: isActive !== undefined ? isActive : status === CouponStatus.ACTIVE,
      },
    });

    return updated;
  }

  /**
   * Get coupon redemption audit trail
   */
  public static async getCouponAuditTrail(query: CouponAuditFilterQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CouponUsageWhereInput = {};

    if (query.couponCode) {
      where.couponCode = query.couponCode.toUpperCase().trim();
    }

    if (query.applicationId) {
      where.applicationId = query.applicationId;
    }

    if (query.category && query.category !== 'ALL') {
      where.justificationCategory = query.category as CouponJustificationCategory;
    }

    const [usages, totalCount] = await Promise.all([
      prisma.couponUsage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          coupon: {
            include: {
              approvedBy: {
                select: { id: true, firstName: true, lastName: true, email: true, role: true },
              },
            },
          },
          appliedByUser: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          taxApplication: {
            select: { id: true, taxYear: true, filingType: true, currentStage: true },
          },
        },
      }),
      prisma.couponUsage.count({ where }),
    ]);

    const formattedUsages = usages.map((u: any) => ({
      id: u.id,
      couponCode: u.couponCode,
      originalFee: Number(u.originalFee),
      discountAmount: Number(u.discountAmount),
      finalFee: Number(u.finalFee),
      justificationCategory: u.justificationCategory,
      justificationNotes: u.justificationNotes,
      appliedAt: u.appliedAt.toISOString(),
      appliedBy: {
        id: u.appliedByUser?.id || '',
        name: `${u.appliedByUser?.firstName || ''} ${u.appliedByUser?.lastName || ''}`.trim() || u.appliedByUser?.email || 'Staff',
        role: u.appliedByUser?.role || 'SALES_AGENT',
      },
      approvedBy: {
        id: u.coupon?.approvedBy?.id || '',
        name: `${u.coupon?.approvedBy?.firstName || ''} ${u.coupon?.approvedBy?.lastName || ''}`.trim() || u.coupon?.approvedBy?.email || 'Manager',
        role: u.coupon?.approvedBy?.role || 'ADMIN',
      },
      taxpayer: u.customer ? {
        id: u.customer.id,
        name: `${u.customer.firstName} ${u.customer.lastName}`,
        email: u.customer.email,
      } : undefined,
      application: u.taxApplication ? {
        id: u.taxApplication.id,
        taxYear: u.taxApplication.taxYear,
        filingType: u.taxApplication.filingType,
        stage: u.taxApplication.currentStage,
      } : undefined,
    }));

    return {
      records: formattedUsages,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

}
