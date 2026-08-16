import { Request, Response, NextFunction } from 'express';
import { DocumenterService, DocumenterLeadQuery } from './documenter-service.js';

export const getDocumenterLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, tab, search, agentId, visaType, taxYear } = req.query;

    const query: DocumenterLeadQuery = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      tab: (tab as any) || 'ALL',
      search: (search as string) || undefined,
      agentId: (agentId as string) || undefined,
      visaType: (visaType as string) || undefined,
      taxYear: taxYear ? Number(taxYear) : undefined,
      currentUserId: req.currentUser?.id,
      currentUserRole: req.currentUser?.role,
    };

    const data = await DocumenterService.listLeads(query);

    res.status(200).json({
      success: true,
      message: 'Documenter leads fetched successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumenterAgents = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const agents = await DocumenterService.listDocumenterAgents();

    res.status(200).json({
      success: true,
      message: 'Documenter agents fetched successfully',
      data: agents,
    });
  } catch (error) {
    next(error);
  }
};

export const assignLeadsBulk = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationIds, targetAgentId } = req.body;

    const result = await DocumenterService.assignLeadsBulk({
      applicationIds,
      targetAgentId,
      assignedByUserId: req.currentUser?.id || 'SYSTEM',
    });

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${result.assignedCount} leads to ${result.targetAgent.email}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const autoRoundRobinAssign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationIds } = req.body;

    const result = await DocumenterService.autoRoundRobinAssign({
      applicationIds,
      assignedByUserId: req.currentUser?.id || 'SYSTEM',
    });

    res.status(200).json({
      success: true,
      message: `Successfully distributed ${result.totalDistributed} leads evenly across ${result.agentsCount} agents`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logCallDisposition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationIds, disposition, callSummary, callbackDate } = req.body;

    const result = await DocumenterService.logCallDisposition({
      applicationIds,
      disposition,
      callSummary,
      callbackDate,
      agentUserId: req.currentUser?.id || 'SYSTEM',
    });

    res.status(200).json({
      success: true,
      message: 'Call outcome logged successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const saveTaxDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationId, taxDraftSummary } = req.body;

    const result = await DocumenterService.saveTaxDraft({
      applicationId,
      taxDraftSummary,
      agentUserId: req.currentUser?.id || 'SYSTEM',
    });

    res.status(200).json({
      success: true,
      message: 'Draft tax computation saved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const sendToSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationId, taxDraftSummary, remarks } = req.body;

    const result = await DocumenterService.sendToSales({
      applicationId,
      taxDraftSummary,
      remarks,
      agentUserId: req.currentUser?.id || 'SYSTEM',
    });

    res.status(200).json({
      success: true,
      message: 'Tax application submitted to Sales Pitch Queue successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
