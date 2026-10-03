import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { paginate } from "../../utils/pagination.js";
import type { ProductInput } from "./product-validator.js";

export interface ListProductsOptions {
  search?: string;
  status?: ProductStatus | "ALL";
  page?: number;
  limit?: number;
}

const toResponse = (p: Prisma.ProductGetPayload<object>) => ({
  ...p,
  price: Number(p.price),
});

export class ProductService {
  private static async ensureUniqueName(name: string, excludeId?: string) {
    const existing = await prisma.product.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestError(`An item named "${name.trim()}" already exists`);
    }
  }

  static async list(options: ListProductsOptions) {
    const where: Prisma.ProductWhereInput = {};
    if (options.status && options.status !== "ALL") where.status = options.status;
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [result, activeCount, totalCount] = await Promise.all([
      paginate<Prisma.ProductGetPayload<object>>(prisma.product, { where, orderBy: { createdAt: "desc" } }, options),
      prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      prisma.product.count(),
    ]);

    return {
      data: result.data.map(toResponse),
      meta: result.meta,
      stats: { total: totalCount, active: activeCount, inactive: totalCount - activeCount },
    };
  }

  static async listActive() {
    const items = await prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      orderBy: { name: "asc" },
    });
    return items.map(toResponse);
  }

  static async create(input: ProductInput, userId?: string) {
    await this.ensureUniqueName(input.name);
    const product = await prisma.product.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        price: new Prisma.Decimal(input.price),
        unit: input.unit,
        taxType: input.taxType,
        status: input.status,
        createdById: userId || null,
      },
    });
    return toResponse(product);
  }

  static async update(id: string, input: ProductInput) {
    const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundError("Item not found");
    await this.ensureUniqueName(input.name, id);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        price: new Prisma.Decimal(input.price),
        unit: input.unit,
        taxType: input.taxType,
        status: input.status,
      },
    });
    return toResponse(product);
  }

  static async updateStatus(id: string, status: ProductStatus) {
    const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundError("Item not found");
    const product = await prisma.product.update({ where: { id }, data: { status } });
    return toResponse(product);
  }
}
