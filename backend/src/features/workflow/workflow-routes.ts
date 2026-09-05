import { Router } from 'express';
import { revertLeadWorkflow } from './workflow-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { authorize } from '../../middlewares/authorize.js';
import { Role } from '../../types/index.js';

const router = Router();

// Any active staff member with appropriate roles can trigger stage revert / send back
router.post(
  '/revert',
  requireAuth,
  authorize(
    Role.ADMIN,
    Role.PREP_MANAGER,
    Role.TAX_REVIEWER,
    Role.TAX_PREPARER,
    Role.SALES_MANAGER,
    Role.SALES_TEAM_LEAD,
    Role.SALES_AGENT,
    Role.DOC_MANAGER,
    Role.DOC_TEAM_LEAD,
    Role.DOC_AGENT,
    Role.FILE_OP_MANAGER,
    Role.FILE_OP_TEAM_LEAD,
    Role.FILE_OP_AGENT
  ),
  revertLeadWorkflow
);

export { router as workflowRouter };
