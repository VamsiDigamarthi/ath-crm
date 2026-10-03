import { Request, Response } from "express";
import { ProductStatus } from "@prisma/client";
import { SuccessHandler } from "../../utils/success-handler.js";
import { ProductService } from "./product-service.js";

export const listProducts = async (req: Request, res: Response) => {
  const { search, status, page, limit } = req.query;
  const result = await ProductService.list({
    search: typeof search === "string" && search.trim() ? search.trim() : undefined,
    status: typeof status === "string" ? (status as ProductStatus | "ALL") : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  return SuccessHandler.handle(res, "Items retrieved successfully", result);
};

export const listActiveProducts = async (_req: Request, res: Response) => {
  const items = await ProductService.listActive();
  return SuccessHandler.handle(res, "Active items retrieved successfully", items);
};

export const createProduct = async (req: Request, res: Response) => {
  const product = await ProductService.create(req.body, req.currentUser?.id);
  return SuccessHandler.handle(res, "Item created successfully", product, 201);
};

export const updateProduct = async (req: Request, res: Response) => {
  const product = await ProductService.update(String(req.params.id), req.body);
  return SuccessHandler.handle(res, "Item updated successfully", product);
};

export const updateProductStatus = async (req: Request, res: Response) => {
  const product = await ProductService.updateStatus(String(req.params.id), req.body.status);
  return SuccessHandler.handle(res, "Item status updated successfully", product);
};
