import { Router } from 'express';
import {
  getDocumenterLeads,
  getDocumenterAgents,
  assignLeadsBulk,
  autoRoundRobinAssign,
} from './documenter-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { authorize } from '../../middlewares/authorize.js';
import { Role } from '../../types/index.js';

const router = Router();

const DOCUMENTER_ROLES = [
  Role.ADMIN,
  Role.DOC_MANAGER,
  Role.DOC_TEAM_LEAD,
  Role.DOC_AGENT,
];

// 1. Get paginated leads with tab stats
router.get(
  '/leads',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  getDocumenterLeads
);

// 2. Get active agents list with workloads
router.get(
  '/agents',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  getDocumenterAgents
);

// 3. Bulk assign to target agent (Admin, Manager, Team Lead)
router.post(
  '/assign-bulk',
  requireAuth,
  authorize(Role.ADMIN, Role.DOC_MANAGER, Role.DOC_TEAM_LEAD),
  assignLeadsBulk
);

// 4. 1-Click Auto Round-Robin (Admin, Manager, Team Lead)
router.post(
  '/assign-round-robin',
  requireAuth,
  authorize(Role.ADMIN, Role.DOC_MANAGER, Role.DOC_TEAM_LEAD),
  autoRoundRobinAssign
);

export { router as documenterRouter };
