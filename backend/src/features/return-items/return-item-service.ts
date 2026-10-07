import { Prisma, ProductStatus, Role } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { NotAllowedError } from "../../errors/not-allowed-error.js";
import { PermissionService } from "../permissions/permission-service.js";

const EDIT_PRICE_PERMISSION = "PREP_EDIT_ITEM_PRICE";

// Sales negotiate fees, so they can always set a return's unit price; prep staff need the admin permission.
// Only the item on this return changes, never the catalog price.
const SALES_PRICE_ROLES: string[] = [Role.SALES_AGENT, Role.SALES_TEAM_LEAD, Role.SALES_MANAGER];

const canEditItemPrice = async (user: CurrentUserLike) =>
  user.role === Role.ADMIN ||
  SALES_PRICE_ROLES.includes(user.role) ||
  (await PermissionService.hasPermission(user.id, EDIT_PRICE_PERMISSION));
const TAX_RATES: Record<string, number> = { NO_TAX: 0, VAT_10: 0.1 };
const LOCKED_STAGE_PREFIXES = ["FILING", "DROPPED"];

const toCents = (v: Prisma.Decimal | number) => Math.round(Number(v) * 100);
const fromCents = (c: number) => c / 100;

type ItemRow = Prisma.TaxApplicationItemGetPayload<object>;

const formatItem = (item: ItemRow) => {
  const unitCents = toCents(item.unitPrice);
  const amountCents = unitCents * item.quantity;
  const itemTaxRate = Number((item as any).taxRate ?? (TAX_RATES[item.taxType] ? TAX_RATES[item.taxType] * 100 : 0));
  const taxCents = Math.round(amountCents * (itemTaxRate / 100));
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    description: item.description,
    unit: item.unit,
    taxRate: itemTaxRate,
    taxType: item.taxType,
    catalogPrice: Number(item.catalogPrice),
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    isPriceOverridden: toCents(item.catalogPrice) !== unitCents,
    amount: fromCents(amountCents),
    tax: fromCents(taxCents),
    total: fromCents(amountCents + taxCents),
    createdAt: item.createdAt,
  };
};

export interface CurrentUserLike {
  id: string;
  role: string;
}

export class ReturnItemService {
  private static async getEditableApplication(applicationId: string) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, currentStage: true },
    });
    if (!app) throw new NotFoundError("Tax application not found");
    if (LOCKED_STAGE_PREFIXES.some((p) => app.currentStage.startsWith(p))) {
      throw new BadRequestError("Items cannot be changed once the return is in filing");
    }
    return app;
  }

  static async list(applicationId: string, user?: CurrentUserLike) {
    const app = await prisma.taxApplication.findUnique({ where: { id: applicationId }, select: { id: true } });
    if (!app) throw new NotFoundError("Tax application not found");

    const rows = await prisma.taxApplicationItem.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
    });
    const items = rows.map(formatItem);
    const subtotal = items.reduce((s, i) => s + toCents(i.amount), 0);
    const tax = items.reduce((s, i) => s + toCents(i.tax), 0);

    const canEditPrice = user
      ? (await canEditItemPrice(user))
      : false;

    return {
      items,
      totals: { subtotal: fromCents(subtotal), tax: fromCents(tax), total: fromCents(subtotal + tax), count: items.length },
      canEditPrice,
    };
  }

  static async add(applicationId: string, productId: string, quantity: number, user: CurrentUserLike) {
    await this.getEditableApplication(applicationId);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError("Item not found in catalog");
    if (product.status !== ProductStatus.ACTIVE) throw new BadRequestError("This item is inactive and cannot be added");

    const existing = await prisma.taxApplicationItem.findFirst({ where: { applicationId, productId } });
    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (nextQty > 999) throw new BadRequestError("Quantity cannot exceed 999");
      await prisma.taxApplicationItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
    } else {
      await prisma.taxApplicationItem.create({
        data: {
          applicationId,
          productId: product.id,
          name: product.name,
          description: product.description,
          unit: product.unit,
          taxRate: (product as any).taxRate ?? new Prisma.Decimal(product.taxType === "VAT_10" ? 10 : 0),
          taxType: product.taxType,
          catalogPrice: product.price,
          unitPrice: product.price,
          quantity,
          addedById: user.id,
        },
      });
    }
    return this.list(applicationId, user);
  }

  static async update(
    applicationId: string,
    itemId: string,
    changes: { quantity?: number; unitPrice?: number },
    user: CurrentUserLike
  ) {
    await this.getEditableApplication(applicationId);
    const item = await prisma.taxApplicationItem.findFirst({ where: { id: itemId, applicationId } });
    if (!item) throw new NotFoundError("Item not found on this return");

    if (changes.unitPrice !== undefined && toCents(changes.unitPrice) !== toCents(item.unitPrice)) {
      const allowed = (await canEditItemPrice(user));
      if (!allowed) throw new NotAllowedError();
    }

    await prisma.taxApplicationItem.update({
      where: { id: itemId },
      data: {
        ...(changes.quantity !== undefined ? { quantity: changes.quantity } : {}),
        ...(changes.unitPrice !== undefined ? { unitPrice: new Prisma.Decimal(changes.unitPrice) } : {}),
      },
    });
    return this.list(applicationId, user);
  }

  static async remove(applicationId: string, itemId: string, user: CurrentUserLike) {
    await this.getEditableApplication(applicationId);
    const item = await prisma.taxApplicationItem.findFirst({ where: { id: itemId, applicationId }, select: { id: true } });
    if (!item) throw new NotFoundError("Item not found on this return");
    await prisma.taxApplicationItem.delete({ where: { id: itemId } });
    return this.list(applicationId, user);
  }
}
