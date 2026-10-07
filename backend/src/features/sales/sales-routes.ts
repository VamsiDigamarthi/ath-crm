import { Router } from 'express';
import { SalesController } from './sales-controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { uploadTaxDocument } from '../../middlewares/file-upload-middleware.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { sendForm8879Schema } from './sales-validator.js';

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
router.post('/leads/:id/pitch-negotiation', SalesController.updatePitchNegotiation);
router.post('/leads/:id/notes', SalesController.saveCloserNotes);
router.post('/leads/:id/fee-breakdown', SalesController.updateFeeBreakdown);
router.post('/leads/:id/record-payment', SalesController.recordPayment);
router.post('/leads/:id/record-esign', SalesController.recordEsign);
router.post('/leads/:id/send-payment-link', SalesController.sendPaymentLink);
router.post('/leads/:id/send-form-8879', validateRequest(sendForm8879Schema), SalesController.sendForm8879);
router.post('/leads/:id/return-to-admin', SalesController.returnLeadToAdmin);
router.patch('/leads/:id/priority', SalesController.updateLeadPriority);
router.post('/return-to-admin', SalesController.returnLeadsBulkToAdmin);

// Sales Draft Editing, Deliverables & Client Dispatch
router.post('/leads/:id/update-draft-values', SalesController.updateDraftValues);
router.post('/leads/:id/deliverable-document', uploadTaxDocument.single('file'), SalesController.uploadDeliverableDocument);
router.delete('/leads/:id/deliverable-document/:docId', SalesController.deleteDeliverableDocument);
router.patch('/leads/:id/deliverable-document/:docId', SalesController.toggleDeliverableEsign);
router.post('/leads/:id/send-draft-to-client', SalesController.sendDraftToClient);
router.post('/leads/:id/reopen-draft-version', SalesController.reopenDraftVersion);

export { router as salesRouter };
