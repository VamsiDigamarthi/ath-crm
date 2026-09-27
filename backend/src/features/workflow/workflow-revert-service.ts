import { prisma } from '../../config/db.js';
import { ApplicationStage, Role, NotificationCategory, NotificationPriority, AuditActorType, AuditActionType } from '@prisma/client';
import { StorageService } from '../../utils/storage-service.js';
import { NotFoundError } from '../../errors/not-found-error.js';
import { BadRequestError } from '../../errors/bad-request-error.js';

export interface RevertLeadPayload {
  applicationId: string;
  sourceDepartment?: 'DOCUMENTER' | 'PREPARATION' | 'QA_REVIEW' | 'SALES' | 'FILING';
  targetDepartment: 'DOCUMENTER' | 'PREPARATION' | 'SALES';
  targetStage?: ApplicationStage;
  reasonCategory: string;
  missingDocumentTypes?: string[];
  revertNotes: string;
  userId: string;
  files?: Express.Multer.File[];
}

export class WorkflowRevertService {
  /**
   * Revert a lead back to a preceding department (e.g., Preparer -> Documenter, Sales -> Preparer)
   * with complete StageHistory transition, AuditLog, and targeted in-app Notification.
   */
  public static async revertLead(payload: RevertLeadPayload) {
    const {
      applicationId,
      sourceDepartment = 'PREPARATION',
      targetDepartment,
      reasonCategory,
      missingDocumentTypes = [],
      revertNotes,
      userId,
      files = [],
    } = payload;

    if (!applicationId) {
      throw new BadRequestError('Application ID is required');
    }
    if (!targetDepartment) {
      throw new BadRequestError('Target department is required');
    }
    if (!revertNotes || revertNotes.trim().length < 3) {
      throw new BadRequestError('Detailed revert instructions or notes are required');
    }

    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: {
        customer: true,
        assignedDocAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedPrepAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedReviewAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedSalesAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedFileOp: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const filingStages: ApplicationStage[] = [
      ApplicationStage.FILING_QUEUE,
      ApplicationStage.FILING_IN_PROGRESS,
      ApplicationStage.FILING_SUCCESS,
    ];
    if (sourceDepartment === 'SALES' && filingStages.includes(app.currentStage)) {
      throw new BadRequestError('Cannot revert return: It has already been authorized and dispatched to IRS Filing Operations.');
    }

    if (sourceDepartment === 'FILING' && app.currentStage === ApplicationStage.FILING_SUCCESS) {
      throw new BadRequestError('Cannot revert return: It has already been accepted by the IRS Gateway (0000_ACCEPTED).');
    }

    // Determine acting user
    let actorUser = (userId && userId !== 'SYSTEM')
      ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, firstName: true, lastName: true, email: true, role: true } })
      : null;

    if (!actorUser) {
      if (sourceDepartment === 'PREPARATION' && app.assignedPrepAgent) {
        actorUser = app.assignedPrepAgent;
      } else if (sourceDepartment === 'QA_REVIEW' && app.assignedReviewAgent) {
        actorUser = app.assignedReviewAgent;
      } else if (sourceDepartment === 'SALES' && app.assignedSalesAgent) {
        actorUser = app.assignedSalesAgent;
      } else if (sourceDepartment === 'FILING' && app.assignedFileOp) {
        actorUser = app.assignedFileOp;
      } else {
        const fallback = await prisma.user.findFirst({
          where: { role: { in: [Role.TAX_PREPARER, Role.PREP_MANAGER, Role.SALES_AGENT, Role.FILE_OP_AGENT, Role.FILE_OP_MANAGER, Role.ADMIN] } },
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        });
        actorUser = fallback || { id: 'SYSTEM', firstName: 'System', lastName: 'User', email: 'system@taxcrm.com', role: Role.ADMIN };
      }
    }

    const actorName = actorUser
      ? `${actorUser.firstName || ''} ${actorUser.lastName || ''}`.trim() || actorUser.email?.split('@')[0] || 'Staff'
      : 'Staff Agent';

    // Compute target stage and primary notification recipient
    let toStage: ApplicationStage = ApplicationStage.DOC_OUTREACH;
    let targetRecipientId: string | null = null;

    if (targetDepartment === 'DOCUMENTER') {
      toStage = ApplicationStage.DOC_OUTREACH;
      targetRecipientId = app.assignedDocAgentId || null;
    } else if (targetDepartment === 'PREPARATION') {
      toStage = ApplicationStage.CORRECTION_NEEDED;
      targetRecipientId = app.assignedPrepAgentId || null;
    } else if (targetDepartment === 'SALES') {
      toStage = ApplicationStage.SALES_PITCH_QUEUE;
      targetRecipientId = app.assignedSalesAgentId || null;
    }

    // Fallback recipient if individual agent not yet assigned
    if (!targetRecipientId) {
      const managerRole = targetDepartment === 'DOCUMENTER'
        ? Role.DOC_MANAGER
        : targetDepartment === 'PREPARATION'
          ? Role.PREP_MANAGER
          : Role.SALES_MANAGER;

      const deptManager = await prisma.user.findFirst({
        where: { role: managerRole, isActive: true },
        select: { id: true },
      });
      if (deptManager) {
        targetRecipientId = deptManager.id;
      }
    }

    const missingDocsStr = missingDocumentTypes.length > 0
      ? ` Missing Document(s): ${missingDocumentTypes.join(', ')}.`
      : '';

    // Process and persist any uploaded documents directly from Sales or reverting agent
    const attachedDocuments: Array<{
      id: string;
      fileName: string;
      filePath: string;
      fileSize?: number;
      mimeType?: string;
      documentCategory?: string;
      uploadedAt: string;
    }> = [];

    if (files && files.length > 0) {
      // Determine valid user ID for TaxDocument foreign key relation
      let docUploaderId = actorUser.id;
      if (!docUploaderId || docUploaderId === 'SYSTEM') {
        const fallbackUser = await prisma.user.findFirst({ select: { id: true } });
        docUploaderId = app.assignedSalesAgentId || app.assignedPrepAgentId || app.assignedDocAgentId || fallbackUser?.id || '';
      }

      for (const file of files) {
        try {
          const storageResult = await StorageService.saveFile(
            file,
            `taxpayer_${app.customerId || app.id}_revert_ty${app.taxYear}`
          );

          let docCategory = 'CLIENT_ADDITIONAL_DOC';
          const lowerName = file.originalname.toLowerCase();
          if (lowerName.includes('w-2') || lowerName.includes('w2')) docCategory = 'W2_WAGES';
          else if (lowerName.includes('1099')) docCategory = 'FORM_1099';
          else if (lowerName.includes('1098')) docCategory = 'FORM_1098_MORTGAGE';
          else if (lowerName.includes('1095')) docCategory = 'FORM_1095_HEALTH';
          else if (lowerName.includes('passport') || lowerName.includes('visa')) docCategory = 'PASSPORT_VISA';

          const newDoc = await prisma.taxDocument.create({
            data: {
              applicationId: app.id,
              uploadedByUserId: docUploaderId,
              fileName: file.originalname,
              filePath: storageResult.filePath,
              documentCategory: docCategory,
              verificationStatus: 'PENDING',
            },
          });

          attachedDocuments.push({
            id: newDoc.id,
            fileName: newDoc.fileName,
            filePath: newDoc.filePath,
            fileSize: file.size,
            mimeType: file.mimetype,
            documentCategory: docCategory,
            uploadedAt: newDoc.createdAt.toISOString(),
          });
        } catch (fileErr) {
          console.error('Failed to store revert attachment document:', fileErr);
        }
      }
    }

    const currentDraft: any = (app.taxDraftSummary as any) || {};
    const existingHistory: any[] = Array.isArray(currentDraft.revertHistory)
      ? currentDraft.revertHistory
      : (currentDraft.lastRevert ? [currentDraft.lastRevert] : []);
    const existingRevertsByTarget: Record<string, any> = currentDraft.revertsByTarget || {};

    const newRevertRecord = {
      sourceDepartment,
      targetDepartment,
      fromStage: app.currentStage,
      toStage,
      reasonCategory,
      missingDocumentTypes,
      revertNotes,
      attachedDocuments,
      revertedAt: new Date().toISOString(),
      revertedByUserId: actorUser.id,
      revertedByName: actorName,
      revertedByRole: actorUser.role,
      resolved: false,
    };

    const updatedSummary = {
      ...currentDraft,
      status: targetDepartment === 'DOCUMENTER'
        ? 'REVERTED_TO_DOCUMENTER'
        : targetDepartment === 'SALES'
          ? 'REVERTED_TO_SALES'
          : 'REVISION_REQUESTED',
      lastRevert: newRevertRecord,
      revertsByTarget: {
        ...existingRevertsByTarget,
        [targetDepartment]: newRevertRecord,
        [`${sourceDepartment}_TO_${targetDepartment}`]: newRevertRecord,
      },
      revertHistory: [
        ...existingHistory,
        newRevertRecord,
      ],
    };

    const updated = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        currentStage: toStage,
        taxDraftSummary: updatedSummary,
      },
    });

    const customerName = `${app.customer.firstName} ${app.customer.lastName}`;

    const docsNote = attachedDocuments.length > 0
      ? ` [Attached ${attachedDocuments.length} Document(s): ${attachedDocuments.map(d => d.fileName).join(', ')}]`
      : '';

    // 1. Stage History Record
    const stageHistoryRemarks = `[Workflow Revert: ${sourceDepartment} → ${targetDepartment}] Reason: ${reasonCategory.replace(/_/g, ' ')}.${missingDocsStr}${docsNote} Revert Instructions: "${revertNotes}"`;

    if (actorUser.id && actorUser.id !== 'SYSTEM') {
      try {
        await prisma.stageHistory.create({
          data: {
            applicationId: app.id,
            fromStage: app.currentStage,
            toStage,
            movedByUserId: actorUser.id,
            remarks: stageHistoryRemarks,
          },
        });
      } catch (e) {
        console.error('Failed to create stage history for revert:', e);
      }
    }

    // 2. Audit Log Record
    try {
      await prisma.auditLog.create({
        data: {
          applicationId: app.id,
          actorId: actorUser.id !== 'SYSTEM' ? actorUser.id : null,
          actorType: AuditActorType.AGENT,
          actorName,
          actorRole: actorUser.role,
          action: AuditActionType.STAGE_CHANGE,
          moduleKey: 'WORKFLOW_REVERT',
          details: {
            action: 'WORKFLOW_REVERT',
            sourceDepartment,
            targetDepartment,
            fromStage: app.currentStage,
            toStage,
            reasonCategory,
            missingDocumentTypes,
            revertNotes,
            attachedDocumentsCount: attachedDocuments.length,
            attachedDocuments: attachedDocuments.map(d => ({ id: d.id, fileName: d.fileName })),
          },
        },
      });
    } catch (auditErr) {
      console.error('Failed to create audit log for revert:', auditErr);
    }

    // 3. Real-time In-App Notification
    if (targetRecipientId) {
      try {
        const notifCategory = targetDepartment === 'DOCUMENTER'
          ? NotificationCategory.DOCUMENTER
          : targetDepartment === 'SALES'
            ? NotificationCategory.SALES
            : NotificationCategory.PREP_REVIEW;

        await prisma.notification.create({
          data: {
            recipientUserId: targetRecipientId,
            applicationId: app.id,
            category: notifCategory,
            priority: NotificationPriority.HIGH,
            title: `Lead Reverted from ${sourceDepartment}: ${customerName}`,
            message: `${actorName} (${actorUser.role}) returned ${customerName} to ${targetDepartment} [${reasonCategory.replace(/_/g, ' ')}]. "${revertNotes}"${missingDocsStr}${attachedDocuments.length > 0 ? ` (${attachedDocuments.length} document(s) attached)` : ''}`,
            actionUrl: targetDepartment === 'DOCUMENTER'
              ? `/documenter/leads`
              : targetDepartment === 'PREPARATION'
                ? `/prep-review/preparer/workspace/${app.id}`
                : `/sales/agent/pitch/${app.id}`,
            actionLabel: 'Open & Resolve',
            relatedLeadName: customerName,
          },
        });
      } catch (notifErr) {
        console.error('Failed to create revert notification:', notifErr);
      }
    }

    return {
      applicationId: updated.id,
      currentStage: updated.currentStage,
      targetDepartment,
      status: (updated.taxDraftSummary as any)?.status,
      lastRevert: (updated.taxDraftSummary as any)?.lastRevert,
    };
  }
}
