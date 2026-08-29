import { Router } from 'express';
import { SalesController } from './sales-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';

const router = Router();

// Protect all sales endpoints
router.use(requireAuth);

router.get('/leads', SalesController.getPipelineLeads);
router.get('/staff', SalesController.getSalesStaff);
router.get('/manager-stats', SalesController.getManagerStats);
router.post('/assign', SalesController.assignLead);
router.post('/auto-round-robin', SalesController.autoRoundRobin);

export { router as salesRouter };
