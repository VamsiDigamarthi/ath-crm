import { Request, Response } from "express";
import { SuccessHandler } from "../../utils/success-handler.js";
import { ReturnItemService } from "./return-item-service.js";

const userOf = (req: Request) => ({ id: req.currentUser!.id, role: req.currentUser!.role });

export const listReturnItems = async (req: Request, res: Response) => {
  const data = await ReturnItemService.list(String(req.params.applicationId), userOf(req));
  return SuccessHandler.handle(res, "Return items retrieved successfully", data);
};

export const addReturnItem = async (req: Request, res: Response) => {
  const data = await ReturnItemService.add(
    String(req.params.applicationId),
    req.body.productId,
    req.body.quantity ? Number(req.body.quantity) : 1,
    userOf(req)
  );
  return SuccessHandler.handle(res, "Item added to return", data, 201);
};

export const updateReturnItem = async (req: Request, res: Response) => {
  const data = await ReturnItemService.update(
    String(req.params.applicationId),
    String(req.params.itemId),
    {
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : undefined,
      unitPrice: req.body.unitPrice !== undefined ? Number(req.body.unitPrice) : undefined,
    },
    userOf(req)
  );
  return SuccessHandler.handle(res, "Item updated", data);
};

export const deleteReturnItem = async (req: Request, res: Response) => {
  const data = await ReturnItemService.remove(String(req.params.applicationId), String(req.params.itemId), userOf(req));
  return SuccessHandler.handle(res, "Item removed from return", data);
};
