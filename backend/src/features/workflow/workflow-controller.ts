import { Request, Response } from 'express';
import { WorkflowRevertService } from './workflow-revert-service.js';
import { SuccessHandler } from '../../utils/success-handler.js';

export const revertLeadWorkflow = async (req: Request, res: Response) => {
  let {
    applicationId,
    sourceDepartment,
    targetDepartment,
    reasonCategory,
    missingDocumentTypes,
    revertNotes,
  } = req.body;

  if (typeof missingDocumentTypes === 'string') {
    try {
      missingDocumentTypes = JSON.parse(missingDocumentTypes);
    } catch {
      missingDocumentTypes = missingDocumentTypes ? [missingDocumentTypes] : [];
    }
  }

  const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
  const userId = req.currentUser?.id || 'SYSTEM';

  const result = await WorkflowRevertService.revertLead({
    applicationId,
    sourceDepartment,
    targetDepartment,
    reasonCategory,
    missingDocumentTypes,
    revertNotes,
    userId,
    files,
  });

  return SuccessHandler.handle(res, `Lead successfully returned to ${targetDepartment}`, result, 200);
};
