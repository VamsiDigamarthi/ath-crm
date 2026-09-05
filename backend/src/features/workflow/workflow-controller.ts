import { Request, Response } from 'express';
import { WorkflowRevertService } from './workflow-revert-service.js';
import { SuccessHandler } from '../../utils/success-handler.js';

export const revertLeadWorkflow = async (req: Request, res: Response) => {
  const {
    applicationId,
    sourceDepartment,
    targetDepartment,
    reasonCategory,
    missingDocumentTypes,
    revertNotes,
  } = req.body;

  const userId = req.currentUser?.id || 'SYSTEM';

  const result = await WorkflowRevertService.revertLead({
    applicationId,
    sourceDepartment,
    targetDepartment,
    reasonCategory,
    missingDocumentTypes,
    revertNotes,
    userId,
  });

  return SuccessHandler.handle(res, `Lead successfully returned to ${targetDepartment}`, result, 200);
};
