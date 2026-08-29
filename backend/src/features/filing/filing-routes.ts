import { Router } from 'express';
import { FilingController } from './filing-controller.js';

const router = Router();

// Filing Queue & Lead Details
router.get('/queue', FilingController.getQueue);
router.get('/leads/:id', FilingController.getLeadById);

// Staff Matrix & Manager Stats
router.get('/staff', FilingController.getStaff);
router.get('/manager-stats', FilingController.getManagerStats);

// MeF XML & Transmission Engine
router.get('/leads/:id/mef-xml', FilingController.getMeFXML);
router.post('/leads/:id/transmit', FilingController.transmit);

// Rebalancing & Assignment
router.post('/assign', FilingController.assign);
router.post('/auto-balance', FilingController.autoRoundRobin);

export { router as filingRouter };
