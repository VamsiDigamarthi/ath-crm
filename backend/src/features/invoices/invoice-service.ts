import { NotificationCategory, NotificationPriority, Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { EmailService } from "../../utils/email-service.js";
import { isApplicationPaid } from "../../utils/client-history.js";
import { ReturnItemService } from "../return-items/return-item-service.js";

type InvoiceRow = Prisma.InvoiceGetPayload<{
  include: { application: { select: { taxYear: true; filingType: true; currentStage: true; taxDraftSummary: true } } };
}>;

const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Paid / unpaid comes from the return's payment, so it updates by itself once payment is collected */
const formatInvoice = (inv: InvoiceRow) => ({
  id: inv.id,
  invoiceNumber: inv.invoiceNumber,
  applicationId: inv.applicationId,
  taxYear: inv.application.taxYear,
  filingType: inv.application.filingType,
  items: inv.items,
  subtotal: Number(inv.subtotal),
  tax: Number(inv.tax),
  total: Number(inv.total),
  emailedTo: inv.emailedTo,
  status: inv.voidedAt ? "VOID" : isApplicationPaid(inv.application) ? "PAID" : "UNPAID",
  createdAt: inv.createdAt,
});

const includeApp = {
  application: { select: { taxYear: true, filingType: true, currentStage: true, taxDraftSummary: true } },
} as const;

/** INV-2026-0001 style number, unique per year */
const nextInvoiceNumber = async (year: number) => {
  const prefix = `INV-${year}-`;
  const count = await prisma.invoice.count({ where: { invoiceNumber: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

export class InvoiceService {
  static async listForApplication(applicationId: string) {
    const rows = await prisma.invoice.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
      include: includeApp,
    });
    return rows.map(formatInvoice);
  }

  static async listForCustomerUser(user: { id: string; email?: string | null }) {
    const profile =
      (await prisma.customerProfile.findFirst({ where: { userId: user.id }, select: { id: true } })) ||
      (user.email ? await prisma.customerProfile.findFirst({ where: { email: user.email }, select: { id: true } }) : null);
    if (!profile) return [];
    const rows = await prisma.invoice.findMany({
      where: { customerId: profile.id, voidedAt: null },
      orderBy: { createdAt: "desc" },
      include: includeApp,
    });
    return rows.map(formatInvoice);
  }

  /** Builds the invoice from Services & Pricing, voids any earlier invoice for the return, and emails the client */
  static async raise(applicationId: string, userId: string) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });
    if (!app) throw new NotFoundError("Tax application not found");

    const { items, totals } = await ReturnItemService.list(applicationId);
    if (items.length === 0) {
      throw new BadRequestError("Add services in Services & Pricing before raising an invoice.");
    }

    const snapshot = items.map((i) => ({
      name: i.name,
      description: i.description,
      unit: i.unit,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      amount: i.amount,
      tax: i.tax,
      total: i.total,
    }));

    const created = await prisma.$transaction(async (tx) => {
      await tx.invoice.updateMany({ where: { applicationId, voidedAt: null }, data: { voidedAt: new Date() } });
      return tx.invoice.create({
        data: {
          invoiceNumber: await nextInvoiceNumber(new Date().getFullYear()),
          applicationId,
          customerId: app.customerId,
          items: snapshot,
          subtotal: new Prisma.Decimal(totals.subtotal),
          tax: new Prisma.Decimal(totals.tax),
          total: new Prisma.Decimal(totals.total),
          issuedById: userId || null,
          emailedTo: app.customer?.email || null,
        },
        include: includeApp,
      });
    });

    const clientName = `${app.customer?.firstName || ""} ${app.customer?.lastName || ""}`.trim() || "Client";
    const billingUrl = `${process.env.APP_URL || "http://localhost:5173"}/customer/billing`;

    if (app.customer?.email) {
      const lines = snapshot.map((i) => `- ${i.name} × ${i.quantity}: ${money(i.total)}`).join("\n");
      await EmailService.sendEmail({
        to: app.customer.email,
        subject: `Invoice ${created.invoiceNumber} for tax year ${app.taxYear}`,
        text:
          `Dear ${clientName},\n\nPlease find your invoice ${created.invoiceNumber} for tax year ${app.taxYear}.\n\n` +
          `${lines}\n\nTotal: ${money(totals.total)}\n\nView it in your portal: ${billingUrl}\n\nThank you,\nATH Tax Services`,
        html:
          `<p>Dear ${clientName},</p><p>Please find your invoice <strong>${created.invoiceNumber}</strong> for tax year ${app.taxYear}.</p>` +
          `<ul>${snapshot.map((i) => `<li>${i.name} × ${i.quantity}: ${money(i.total)}</li>`).join("")}</ul>` +
          `<p><strong>Total: ${money(totals.total)}</strong></p>` +
          `<p><a href="${billingUrl}">View invoice in your portal</a></p><p>Thank you,<br/>ATH Tax Services</p>`,
      });
    }

    if (app.customer?.userId) {
      await prisma.notification
        .create({
          data: {
            recipientUserId: app.customer.userId,
            applicationId,
            category: NotificationCategory.SALES,
            priority: NotificationPriority.NORMAL,
            title: `Invoice ${created.invoiceNumber} (TY ${app.taxYear})`,
            message: `A new invoice of ${money(totals.total)} is ready for your tax year ${app.taxYear} return.`,
            actionUrl: "/customer/billing",
            actionLabel: "View invoice",
            relatedLeadName: clientName,
          },
        })
        .catch((err) => console.error("Failed to notify client about invoice:", err));
    }

    return formatInvoice(created);
  }
}
