import { Request, Response } from 'express';
import { CustomerService } from './customer-service.js';
import { SuccessHandler } from '../../utils/success-handler.js';
import { NotAuthorizedError } from '../../errors/not-authorized-error.js';

export class CustomerController {
  /**
   * GET /api/v1/customer/dashboard
   * Fetch complete real-time dashboard data for logged-in taxpayer user
   */
  static async getDashboard(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const taxYear = req.query.taxYear as string | undefined;
    const dashboardData = await CustomerService.getDashboard(req.currentUser.id, taxYear);

    return SuccessHandler.handle(res, 'Customer dashboard data fetched successfully', dashboardData);
  }

  /**
   * GET /api/v1/customer/documents
   * List all documents for the selected tax year
   */
  static async getDocuments(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const taxYear = req.query.taxYear as string | undefined;
    const documentsData = await CustomerService.getDocuments(req.currentUser.id, taxYear);

    return SuccessHandler.handle(res, 'Documents fetched successfully', documentsData);
  }

  /**
   * POST /api/v1/customer/documents/upload
   * Upload a tax document (W-2, 1099, Visa, etc.)
   */
  static async uploadDocument(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded' });
    }

    const { documentCategory, taxYear } = req.body;
    const uploadedDoc = await CustomerService.uploadDocument(
      req.currentUser.id,
      file,
      documentCategory,
      taxYear
    );

    return SuccessHandler.handle(res, 'Document uploaded successfully', uploadedDoc, 201);
  }

  /**
   * DELETE /api/v1/customer/documents/:id
   * Delete an uploaded document
   */
  static async deleteDocument(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await CustomerService.deleteDocument(req.currentUser.id, id);

    return SuccessHandler.handle(res, 'Document deleted successfully', result);
  }

  /**
   * GET /api/v1/customer/documents/:id/download
   * Stream secure document download
   */
  static async downloadDocument(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const downloadInfo = await CustomerService.getDocumentDownloadInfo(req.currentUser.id, id);

    return res.download(downloadInfo.absolutePath, downloadInfo.fileName);
  }
}
