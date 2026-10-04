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
    const leadId = (req.query.leadId || req.query.applicationId || req.query.customerId) as string | undefined;
    const dashboardData = await CustomerService.getDashboard(req.currentUser.id, taxYear, leadId, req.currentUser);

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
    const leadId = (req.query.leadId || req.query.applicationId || req.query.customerId) as string | undefined;
    const documentsData = await CustomerService.getDocuments(req.currentUser.id, taxYear, leadId, req.currentUser);

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

    const { documentCategory, taxYear, leadId: bodyLeadId, applicationId, customerId } = req.body;
    const leadId = (bodyLeadId || applicationId || customerId || req.query.leadId || req.query.applicationId) as string | undefined;
    const uploadedDoc = await CustomerService.uploadDocument(
      req.currentUser.id,
      file,
      documentCategory,
      taxYear,
      leadId,
      req.currentUser
    );

    return SuccessHandler.handle(res, 'Document uploaded successfully', uploadedDoc, 201);
  }

  /**
   * POST /api/v1/customer/documents/drive-links
   * Attach an external Google Drive / Cloud Link
   */
  static async uploadDriveLink(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const { linkUrl, title, documentCategory, remarks, taxYear, leadId: bodyLeadId, applicationId, customerId } = req.body;
    const leadId = (bodyLeadId || applicationId || customerId || req.query.leadId || req.query.applicationId) as string | undefined;
    const document = await CustomerService.uploadDriveLink(req.currentUser.id, {
      linkUrl,
      title,
      documentCategory,
      remarks,
      taxYear,
      leadId,
    }, req.currentUser);

    return SuccessHandler.handle(res, 'Drive link attached successfully', document, 201);
  }

  /**
   * POST /api/v1/customer/documents/upload-multiple
   * Upload multiple tax documents simultaneously
   */
  static async uploadMultipleDocuments(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded' });
    }

    const { categories, taxYear, leadId: bodyLeadId, applicationId, customerId } = req.body;
    const leadId = (bodyLeadId || applicationId || customerId || req.query.leadId || req.query.applicationId) as string | undefined;
    const uploadedDocs = await CustomerService.uploadMultipleDocuments(
      req.currentUser.id,
      files,
      categories,
      taxYear,
      leadId,
      req.currentUser
    );

    return SuccessHandler.handle(res, 'Documents uploaded successfully', uploadedDocs, 201);
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
    const result = await CustomerService.deleteDocument(req.currentUser.id, id, req.currentUser);

    return SuccessHandler.handle(res, 'Document deleted successfully', result);
  }

  /**
   * GET /api/v1/customer/documents/:id/download
   * Stream secure document download or redirect to external drive link
   */
  static async downloadDocument(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const downloadInfo = await CustomerService.getDocumentDownloadInfo(req.currentUser.id, id, req.currentUser);

    if (downloadInfo.isExternalLink && (downloadInfo as any).url) {
      return res.redirect((downloadInfo as any).url);
    }

    return res.download(downloadInfo.absolutePath!, downloadInfo.fileName);
  }

  /**
   * GET /api/v1/customer/organizer
   * Fetch 9-module organizer intake JSON
   */
  static async getOrganizer(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const taxYear = req.query.taxYear as string | undefined;
    const leadId = (req.query.leadId || req.query.applicationId || req.query.customerId) as string | undefined;
    const filingType = (req.query.type || req.query.filingType) as string | undefined;
    const organizerData = await CustomerService.getOrganizer(req.currentUser.id, taxYear, leadId, req.currentUser, filingType);

    return SuccessHandler.handle(res, 'Organizer data fetched successfully', organizerData);
  }

  /**
   * PUT /api/v1/customer/organizer
   * Save 9-module organizer intake JSON
   */
  static async saveOrganizer(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const leadId = (req.body.leadId || req.body.applicationId || req.query.leadId || req.query.applicationId) as string | undefined;
    const filingType = (req.body.type || req.body.filingType || req.query.type || req.query.filingType) as string | undefined;
    const result = await CustomerService.saveOrganizer(req.currentUser.id, req.body, req.body.taxYear, leadId, req.currentUser, filingType);

    return SuccessHandler.handle(res, 'Organizer saved successfully', result);
  }

  /**
   * POST /api/v1/customer/tax-years
   * Start a new tax year return directly from client portal
   */
  static async startTaxYearReturn(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const { taxYear, filingType } = req.body;
    const result = await CustomerService.startTaxYearReturn(req.currentUser.id, taxYear, filingType);

    return SuccessHandler.handle(res, result.message, result, 201);
  }

  /**
   * GET /api/v1/customer/draft-review
   * Fetch draft return summary & deliverables for customer review
   */
  static async getDraftReview(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const taxYear = req.query.taxYear as string | undefined;
    const leadId = (req.query.leadId || req.query.applicationId || req.query.customerId) as string | undefined;
    const filingType = (req.query.type || req.query.filingType) as string | undefined;

    const data = await CustomerService.getDraftReview(
      req.currentUser.id,
      taxYear,
      leadId,
      req.currentUser,
      filingType
    );

    return SuccessHandler.handle(res, 'Tax draft review details fetched successfully', data);
  }

  /**
   * POST /api/v1/customer/draft-review/approve
   * Customer approves Form 1040 draft return & signatures
   */
  static async approveDraft(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const applicationId = (req.body.applicationId || req.body.leadId || req.query.applicationId || req.query.leadId) as string | undefined;
    const taxYear = (req.body.taxYear || req.query.taxYear) as string | undefined;
    const notes = req.body.notes || req.body.reason || '';
    const result = await CustomerService.approveDraft(req.currentUser.id, applicationId, notes, taxYear);

    return SuccessHandler.handle(res, 'Tax return draft approved successfully', result);
  }

  /**
   * POST /api/v1/customer/draft-review/reject
   * Customer requests changes / revisions on return draft
   */
  static async rejectDraft(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const applicationId = (req.body.applicationId || req.body.leadId || req.query.applicationId || req.query.leadId) as string | undefined;
    const taxYear = (req.body.taxYear || req.query.taxYear) as string | undefined;
    const revisionNotes = req.body.revisionNotes || req.body.reason || req.body.notes || '';
    const result = await CustomerService.rejectDraft(req.currentUser.id, applicationId, revisionNotes, taxYear);

    return SuccessHandler.handle(res, 'Revision request submitted to your tax advisor', result);
  }

  /**
   * POST /api/v1/customer/draft-review/upload-signed/:docId
   * Customer uploads signed deliverable document
   */
  static async uploadSignedDeliverable(req: Request, res: Response) {
    if (!req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    const docId = String(req.params.docId);
    const applicationId = (req.body.applicationId || req.query.applicationId || req.body.leadId || req.query.leadId) as string | undefined;
    const taxYear = (req.body.taxYear || req.query.taxYear) as string | undefined;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file was uploaded' });
    }

    const result = await CustomerService.uploadSignedDeliverable(
      req.currentUser.id,
      applicationId,
      docId,
      file,
      taxYear
    );

    return SuccessHandler.handle(res, 'Signed document uploaded successfully', result, 201);
  }
}

