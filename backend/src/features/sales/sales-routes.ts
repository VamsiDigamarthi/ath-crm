import { Router } from 'express';
import { SalesController } from './sales-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';

const router = Router();

// Protect all sales endpoints
router.use(requireAuth);

router.get('/leads', SalesController.getPipelineLeads);
router.get('/leads/:id', SalesController.getLeadById);
router.get('/staff', SalesController.getSalesStaff);
router.get('/manager-stats', SalesController.getManagerStats);
router.get('/agent-stats', SalesController.getAgentStats);
router.post('/assign', SalesController.assignLead);
router.post('/auto-round-robin', SalesController.autoRoundRobin);
router.post('/leads/:id/dispatch-filing', SalesController.dispatchToFiling);
router.post('/leads/:id/record-payment', SalesController.recordPayment);
router.post('/leads/:id/record-esign', SalesController.recordEsign);

export { router as salesRouter };
