import { Request, Response, NextFunction } from 'express';
import { DocumenterService, DocumenterLeadQuery } from './documenter-service.js';

export const getDocumenterLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, tab, search, agentId, visaType, taxYear, timeRange } = req.query;

    const query: DocumenterLeadQuery = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      tab: (tab as any) || 'ALL',
      search: (search as string) || undefined,
      agentId: (agentId as string) || undefined,
      visaType: (visaType as string) || undefined,
      taxYear: taxYear ? Number(taxYear) : undefined,
      timeRange: (timeRange as any) || 'TODAY',
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { timeRange } = req.query;
    const agents = await DocumenterService.listDocumenterAgents(timeRange as any);

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

export const downloadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const downloadInfo = await DocumenterService.getDocumentDownloadInfo(id);

    res.download(downloadInfo.absolutePath, downloadInfo.fileName);
  } catch (error) {
    next(error);
  }
};

export const getLeadDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await DocumenterService.getLeadDetails(id);

    res.status(200).json({
      success: true,
      message: 'Lead details with full call history fetched successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;

    const result = await DocumenterService.verifyDocument(id, status || 'VERIFIED', req.currentUser?.id);

    res.status(200).json({
      success: true,
      message: `Document marked as ${status || 'VERIFIED'} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadLeadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please attach a document file to upload' });
      return;
    }
    const documentCategory = req.body.documentCategory || 'W2_WAGES';
    const result = await DocumenterService.uploadLeadDocument(
      id,
      req.currentUser!.id,
      req.file,
      documentCategory
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded and verified in vault successfully by agent',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLeadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await DocumenterService.deleteLeadDocument(id, req.currentUser!.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully by agent',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const saveLeadOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await DocumenterService.saveLeadOrganizer(
      id,
      req.currentUser!.id,
      req.body,
      req.body.taxYear
    );

    res.status(200).json({
      success: true,
      message: 'Intake organizer saved and synced to database successfully by agent',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

