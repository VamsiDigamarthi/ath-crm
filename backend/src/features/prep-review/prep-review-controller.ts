import { Request, Response } from 'express';
import { PrepReviewService } from './prep-review-service.js';
import { SuccessHandler } from '../../utils/success-handler.js';

export const getPrepReviewStaff = async (req: Request, res: Response) => {
  const staff = await PrepReviewService.listStaffMembers();
  return SuccessHandler.handle(res, 'Tax Prep & Review staff retrieved successfully', staff, 200);
};

export const getPrepReviewLeads = async (req: Request, res: Response) => {
  const result = await PrepReviewService.listPipelineLeads(req.query);
  return SuccessHandler.handle(res, 'Tax Prep & Review pipeline leads retrieved successfully', result, 200);
};

export const assignPrepReviewLeads = async (req: Request, res: Response) => {
  const { applicationIds, preparerId, reviewerId, targetDueDate, prepNotes } = req.body;
  const result = await PrepReviewService.assignLeadPair({
    applicationIds,
    preparerId,
    reviewerId,
    targetDueDate,
    prepNotes,
    assignedByUserId: req.currentUser?.id || 'SYSTEM',
  });
  return SuccessHandler.handle(res, 'Tax returns assigned to Preparer & QA Reviewer successfully', result, 200);
};

export const getPrepReviewDashboardStats = async (req: Request, res: Response) => {
  const stats = await PrepReviewService.getDashboardStats();
  return SuccessHandler.handle(res, 'Prep & Review dashboard stats retrieved successfully', stats, 200);
};

export const getPrepReviewWorkspaceDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await PrepReviewService.getWorkspaceDetails(id);
  return SuccessHandler.handle(res, 'Workspace details retrieved successfully', data, 200);
};

export const savePrepReviewWorkspaceDraft = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await PrepReviewService.saveWorkspaceDraft(id, req.body);
  return SuccessHandler.handle(res, 'Form 1040 draft saved successfully', data, 200);
};

export const submitPrepReviewWorkspaceToQA = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.currentUser?.id || 'SYSTEM';
  const data = await PrepReviewService.submitWorkspaceToQA(id, req.body, userId);
  return SuccessHandler.handle(res, 'Form 1040 submitted for QA review successfully', data, 200);
};

export const viewPrepReviewDocument = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const downloadInfo = await PrepReviewService.getDocumentDownloadInfo(id);

    res.setHeader('Content-Type', downloadInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${downloadInfo.fileName}"`);
    return res.sendFile(downloadInfo.absolutePath);
  } catch (error) {
    next(error);
  }
};

export const downloadPrepReviewDocument = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const downloadInfo = await PrepReviewService.getDocumentDownloadInfo(id);
    return res.download(downloadInfo.absolutePath, downloadInfo.fileName);
  } catch (error) {
    next(error);
  }
};

export const signOffPrepReviewQAReturn = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const userId = req.currentUser?.id || 'SYSTEM';
  const data = await PrepReviewService.signOffQAReturn(id, remarks, userId);
  return SuccessHandler.handle(res, 'Return approved and transferred to Sales pitch queue', data, 200);
};

export const requestRevisionPrepReviewQAReturn = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { discrepancyCategory, revisionNotes } = req.body;
  const userId = req.currentUser?.id || 'SYSTEM';
  const data = await PrepReviewService.requestRevisionQAReturn(id, { discrepancyCategory, revisionNotes }, userId);
  return SuccessHandler.handle(res, 'Revision requested and dispatched to preparer', data, 200);
};


