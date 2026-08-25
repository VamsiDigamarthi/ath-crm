import {
  getDocumenterLeads,
  getLeadDetails,
  getDocumenterAgents,
  assignLeadsBulk,
  autoRoundRobinAssign,
  logCallDisposition,
  saveTaxDraft,
  sendToSales,
  downloadDocument,
  verifyDocument,
  uploadLeadDocument,
  deleteLeadDocument,
  saveLeadOrganizer,
} from './documenter-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { authorize } from '../../middlewares/authorize.js';
import { uploadTaxDocument } from '../../middlewares/file-upload-middleware.js';
import { Role } from '../../types/index.js';
import { Router } from 'express';

const router = Router();

const DOCUMENTER_ROLES = [
  Role.ADMIN,
  Role.DOC_MANAGER,
  Role.DOC_TEAM_LEAD,
  Role.DOC_AGENT,
  Role.PREP_MANAGER,
  Role.TAX_REVIEWER,
  Role.TAX_PREPARER,
];

// 1. Get paginated leads with tab stats
router.get(
  '/leads',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  getDocumenterLeads
);

// 1b. Get single lead full 360 details with all historical call logs
router.get(
  '/leads/:id',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  getLeadDetails
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

// 5. Log outreach call outcome / disposition (All Documenter staff)
router.post(
  '/dispositions',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  logCallDisposition
);

// 6. Save draft tax calculation
router.post(
  '/tax-draft',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  saveTaxDraft
);

// 7. Send lead to Sales Pitch Queue (Handoff)
router.post(
  '/send-to-sales',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  sendToSales
);

// 8. Document Download & Preview Stream (All Documenter staff)
router.get(
  '/documents/:id/download',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  downloadDocument
);

// 9. Document Verification Status Update (All Documenter staff)
router.patch(
  '/documents/:id/verify',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  verifyDocument
);

// 10. Agent Upload Document on Behalf of Client
router.post(
  '/leads/:id/documents',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  uploadTaxDocument.single('file'),
  uploadLeadDocument
);

// 11. Agent Delete Document from Vault
router.delete(
  '/documents/:id',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  deleteLeadDocument
);

// 12. Agent Save / Update 9-Module Intake Organizer on Call
router.put(
  '/leads/:id/organizer',
  requireAuth,
  authorize(...DOCUMENTER_ROLES),
  saveLeadOrganizer
);

export { router as documenterRouter };

