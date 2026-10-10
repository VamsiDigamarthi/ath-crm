import { Request, Response } from "express";
import { SuccessHandler } from "../../utils/success-handler.js";
import { InvoiceService } from "./invoice-service.js";

export const listApplicationInvoices = async (req: Request, res: Response) => {
  const data = await InvoiceService.listForApplication(String(req.params.applicationId));
  return SuccessHandler.handle(res, "Invoices retrieved", data);
};

export const raiseInvoice = async (req: Request, res: Response) => {
  const data = await InvoiceService.raise(String(req.params.applicationId), req.currentUser!.id);
  return SuccessHandler.handle(res, `Invoice ${data.invoiceNumber} raised and sent to the client`, data, 201);
};

export const listMyInvoices = async (req: Request, res: Response) => {
  const data = await InvoiceService.listForCustomerUser({ id: req.currentUser!.id, email: (req.currentUser as any)?.email });
  return SuccessHandler.handle(res, "Invoices retrieved", data);
};
