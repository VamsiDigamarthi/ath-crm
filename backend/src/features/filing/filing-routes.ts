import { Router } from 'express';
import { FilingController } from './filing-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { Role } from '../../types/index.js';
import { filingHoldSchema, irsRejectSchema } from './filing-validator.js';
import { uploadTaxDocument } from '../../middlewares/file-upload-middleware.js';

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
router.post(
  '/leads/:id/irs-reject',
  requireAuth,
  authorize(Role.ADMIN, Role.FILE_OP_MANAGER, Role.FILE_OP_AGENT),
  validateRequest(irsRejectSchema),
  FilingController.markRejected
);
router.post(
  '/leads/:id/hold',
  requireAuth,
  authorize(Role.ADMIN, Role.FILE_OP_MANAGER, Role.FILE_OP_AGENT),
  validateRequest(filingHoldSchema),
  FilingController.setHold
);

// Filed return copy (after IRS acceptance), shown to the client
router.post(
  '/leads/:id/filed-copy',
  requireAuth,
  authorize(Role.ADMIN, Role.FILE_OP_MANAGER, Role.FILE_OP_AGENT),
  uploadTaxDocument.single('file'),
  FilingController.uploadFiledCopy
);

// Rebalancing & Assignment
router.post('/assign', FilingController.assign);
router.post('/auto-balance', FilingController.autoRoundRobin);

export { router as filingRouter };
