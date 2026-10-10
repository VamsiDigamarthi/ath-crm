import { Router } from 'express';
import { 
  getPrepReviewStaff, 
  getPrepReviewLeads, 
  assignPrepReviewLeads,
  getPrepReviewDashboardStats,
  getPrepReviewWorkspaceDetails,
  savePrepReviewWorkspaceDraft,
  submitPrepReviewWorkspaceToQA,
  revertPrepReviewWorkspace,
  uploadDrakeTaxFile,
  deleteDrakeTaxFile,
  viewPrepReviewDocument,
  downloadPrepReviewDocument,
  signOffPrepReviewQAReturn,
  requestRevisionPrepReviewQAReturn,
  uploadDeliverableDocument,
  deleteDeliverableDocument,
  toggleDeliverableEsign,
} from './prep-review-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { authorize } from '../../middlewares/authorize.js';
import { uploadTaxDocument } from '../../middlewares/file-upload-middleware.js';
import { Role } from '../../types/index.js';

const router = Router();

const PREP_ROLES = [
  Role.ADMIN,
  Role.PREP_MANAGER,
  Role.TAX_REVIEWER,
  Role.TAX_PREPARER,
];

// Return draft & e-sign documents (E-Sign & Tax Returns tab): sales closers add Form 8879 etc. too
const DRAFT_FILE_ROLES = [...PREP_ROLES, Role.SALES_MANAGER, Role.SALES_AGENT];

// 1. Get staff matrix & caseload capacity for Tax Prep & Review Department
router.get('/staff', requireAuth, authorize(...PREP_ROLES), getPrepReviewStaff);

// 2. Get active pipeline returns
router.get('/leads', requireAuth, authorize(...PREP_ROLES), getPrepReviewLeads);

// 3. Get Operations Command Center Dashboard live KPIs & Analytics
router.get('/dashboard-stats', requireAuth, authorize(...PREP_ROLES), getPrepReviewDashboardStats);

// 4. Assign returns to Preparer & QA Reviewer Pair
router.post('/assign', requireAuth, authorize(Role.ADMIN, Role.PREP_MANAGER), assignPrepReviewLeads);

// 5. Form 1040 Workspace endpoints
router.get('/workspace/:id', requireAuth, authorize(...PREP_ROLES), getPrepReviewWorkspaceDetails);
router.post('/workspace/:id/save-draft', requireAuth, authorize(...PREP_ROLES), savePrepReviewWorkspaceDraft);
router.post('/workspace/:id/submit-qa', requireAuth, authorize(...PREP_ROLES), submitPrepReviewWorkspaceToQA);
router.post('/workspace/:id/revert', requireAuth, authorize(...PREP_ROLES), revertPrepReviewWorkspace);
router.post('/workspace/:id/upload-drake-file', requireAuth, authorize(...DRAFT_FILE_ROLES), uploadTaxDocument.single('file'), uploadDrakeTaxFile);
router.delete('/workspace/:id/drake-file/:docId', requireAuth, authorize(...DRAFT_FILE_ROLES), deleteDrakeTaxFile);
router.post('/workspace/:id/deliverable-document', requireAuth, authorize(...DRAFT_FILE_ROLES), uploadTaxDocument.single('file'), uploadDeliverableDocument);
router.delete('/workspace/:id/deliverable-document/:docId', requireAuth, authorize(...DRAFT_FILE_ROLES), deleteDeliverableDocument);
router.patch('/workspace/:id/deliverable-document/:docId', requireAuth, authorize(...DRAFT_FILE_ROLES), toggleDeliverableEsign);

// 6. Document View & Download
router.get('/documents/:id/view', requireAuth, authorize(...PREP_ROLES), viewPrepReviewDocument);
router.get('/documents/:id/download', requireAuth, authorize(...PREP_ROLES), downloadPrepReviewDocument);

// 7. QA Reviewer Audit Sign-Off & Revision
router.post('/reviewer/audit/:id/sign-off', requireAuth, authorize(...PREP_ROLES), signOffPrepReviewQAReturn);
router.post('/reviewer/audit/:id/request-revision', requireAuth, authorize(...PREP_ROLES), requestRevisionPrepReviewQAReturn);

export { router as prepReviewRouter };

