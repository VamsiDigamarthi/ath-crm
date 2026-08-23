import { Router } from 'express';
import { CustomerController } from './customer-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { uploadTaxDocument } from '../../middlewares/file-upload-middleware.js';

import { validateRequest } from '../../middlewares/validate-request.js';
import { saveOrganizerSchema } from './customer-validator.js';

const router = Router();

// Protect all customer routes with auth session
router.use(requireAuth);

/**
 * GET /api/v1/customer/dashboard
 * Return live customer return lifecycle status, stats, refund, and assigned team
 */
router.get('/dashboard', CustomerController.getDashboard);

/**
 * Documents Vault Routes
 */
router.get('/documents', CustomerController.getDocuments);
router.post('/documents/upload', uploadTaxDocument.single('file'), CustomerController.uploadDocument);
router.delete('/documents/:id', CustomerController.deleteDocument);
router.get('/documents/:id/download', CustomerController.downloadDocument);

/**
 * 9-Module Intake Organizer Routes
 */
router.get('/organizer', CustomerController.getOrganizer);
router.put('/organizer', validateRequest(saveOrganizerSchema), CustomerController.saveOrganizer);

export { router as customerRouter };
