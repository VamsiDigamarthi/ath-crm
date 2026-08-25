import { Router } from 'express';
import { 
  getPrepReviewStaff, 
  getPrepReviewLeads, 
  assignPrepReviewLeads,
  getPrepReviewDashboardStats 
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

export { router as prepReviewRouter };
