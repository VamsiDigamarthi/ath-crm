import { Router } from 'express';
import { 
  getPrepReviewStaff, 
  getPrepReviewLeads, 
  assignPrepReviewLeads,
  getPrepReviewDashboardStats,
  getPrepReviewWorkspaceDetails,
  savePrepReviewWorkspaceDraft,
  submitPrepReviewWorkspaceToQA,
  viewPrepReviewDocument,
  downloadPrepReviewDocument,
  signOffPrepReviewQAReturn,
  requestRevisionPrepReviewQAReturn,
} from './prep-review-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { authorize } from '../../middlewares/authorize.js';
import { Role } from '../../types/index.js';

const router = Router();

const PREP_ROLES = [
  Role.ADMIN,
  Role.PREP_MANAGER,
  Role.TAX_REVIEWER,
  Role.TAX_PREPARER,
];

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

// 6. Document View & Download
router.get('/documents/:id/view', requireAuth, authorize(...PREP_ROLES), viewPrepReviewDocument);
router.get('/documents/:id/download', requireAuth, authorize(...PREP_ROLES), downloadPrepReviewDocument);

// 7. QA Reviewer Audit Sign-Off & Revision
router.post('/reviewer/audit/:id/sign-off', requireAuth, authorize(...PREP_ROLES), signOffPrepReviewQAReturn);
router.post('/reviewer/audit/:id/request-revision', requireAuth, authorize(...PREP_ROLES), requestRevisionPrepReviewQAReturn);

export { router as prepReviewRouter };
