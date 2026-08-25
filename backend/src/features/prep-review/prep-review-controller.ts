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
