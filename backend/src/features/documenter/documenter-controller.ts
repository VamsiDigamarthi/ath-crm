import { Request, Response, NextFunction } from 'express';
import { DocumenterService, DocumenterLeadQuery } from './documenter-service.js';

export const getDocumenterLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, tab, search, agentId, visaType, taxYear, priority, timeRange } = req.query;

    const query: DocumenterLeadQuery = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      tab: (tab as any) || 'ALL',
      search: (search as string) || undefined,
      agentId: (agentId as string) || undefined,
      visaType: (visaType as string) || undefined,
      taxYear: taxYear ? Number(taxYear) : undefined,
      priority: (priority as string) || undefined,
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

export const returnLeadsToPool = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationIds, reason } = req.body;

    const result = await DocumenterService.returnLeadsToPool({
      applicationIds,
      returnedByUserId: req.currentUser?.id || 'SYSTEM',
      reason,
    });

    res.status(200).json({
      success: true,
      message: `Successfully returned ${result.returnedCount} lead${result.returnedCount > 1 ? 's' : ''} to Admin unassigned pool`,
      data: result,
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
    const { applicationIds, disposition, subDisposition, callSummary, callbackDate, callbackTimezone } = req.body;

    const result = await DocumenterService.logCallDisposition({
      applicationIds,
      disposition,
      subDisposition,
      callSummary,
      callbackDate,
      callbackTimezone,
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

export const moveToTaxPrep = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { remarks } = req.body;

    const result = await DocumenterService.moveToTaxPrep({
      applicationId: id,
      remarks,
      agentUserId: req.currentUser?.id || 'SYSTEM',
    });

    res.status(200).json({
      success: true,
      message: 'Taxpayer return transferred to Tax Prep Manager Queue successfully',
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

    if (downloadInfo.isExternalLink && downloadInfo.url) {
      res.redirect(downloadInfo.url);
      return;
    }

    res.download(downloadInfo.absolutePath!, downloadInfo.fileName);
  } catch (error) {
    next(error);
  }
};

export const uploadDriveLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const document = await DocumenterService.uploadDriveLink(
      id,
      req.currentUser!.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Drive link attached to document vault successfully',
      data: document,
    });
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
    
    // Extract all uploaded files (from req.files or req.file)
    let files: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === 'object') {
      files = Object.values(req.files).flat() as Express.Multer.File[];
    } else if (req.file) {
      files = [req.file];
    }

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'Please attach at least one document file to upload' });
      return;
    }

    // Parse categories for each file
    let parsedCategories: string[] = [];
    let fileCategoryMap: Record<string, string> = {};

    if (req.body.fileCategories) {
      try {
        if (typeof req.body.fileCategories === 'string') {
          const parsed = JSON.parse(req.body.fileCategories);
          if (Array.isArray(parsed)) {
            parsed.forEach((item, index) => {
              if (typeof item === 'string') {
                parsedCategories[index] = item;
              } else if (item && typeof item === 'object') {
                if (item.fileName && item.category) {
                  fileCategoryMap[item.fileName] = item.category;
                }
                if (item.category) {
                  parsedCategories[index] = item.category;
                }
              }
            });
          }
        } else if (Array.isArray(req.body.fileCategories)) {
          parsedCategories = req.body.fileCategories;
        }
      } catch {
        // Not JSON formatted, treat as fallback
      }
    }

    const defaultCategory = req.body.documentCategory || 'W2_WAGES';

    const fileItems = files.map((file, idx) => {
      const category =
        fileCategoryMap[file.originalname] ||
        parsedCategories[idx] ||
        defaultCategory;
      return { file, category };
    });

    const result = await DocumenterService.uploadLeadDocuments(
      id,
      req.currentUser!.id,
      fileItems
    );

    res.status(201).json({
      success: true,
      message: `${result.length} document${result.length > 1 ? 's' : ''} uploaded and verified in vault successfully by agent`,
      data: result.length === 1 ? result[0] : result,
      documents: result,
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

export const updateLeadPriority = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { priority } = req.body;
    const result = await DocumenterService.updateLeadPriority(
      id,
      priority,
      req.currentUser!.id
    );

    res.status(200).json({
      success: true,
      message: `Lead priority updated to ${priority} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


