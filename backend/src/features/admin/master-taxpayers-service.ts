import { prisma } from "../../config/db.js";
import { ApplicationStage } from "@prisma/client";

export interface MasterTaxpayersQueryOptions {
  search?: string;
  stage?: string;
  source?: string;
  lifecycle?: string;
  taxYear?: number;
  visa?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export class MasterTaxpayersService {
  /**
   * Fetch all taxpayers in the application across all stages (ingested, converted, dropped, etc.)
   */
  public static async getMasterTaxpayers(options: MasterTaxpayersQueryOptions) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    // Search filter
    const searchFilter = options.search && options.search.trim()
      ? {
          OR: [
            { firstName: { contains: options.search.trim(), mode: 'insensitive' as const } },
            { lastName: { contains: options.search.trim(), mode: 'insensitive' as const } },
            { email: { contains: options.search.trim(), mode: 'insensitive' as const } },
            { phone: { contains: options.search.trim(), mode: 'insensitive' as const } },
            { ssnTin: { contains: options.search.trim(), mode: 'insensitive' as const } },
            { city: { contains: options.search.trim(), mode: 'insensitive' as const } },
            { state: { contains: options.search.trim(), mode: 'insensitive' as const } },
          ],
        }
      : null;

    // Tax Year filter
    const taxYearFilter = options.taxYear
      ? { applications: { some: { taxYear: Number(options.taxYear) } } }
      : null;

    // Visa filter
    const visaFilter = options.visa && options.visa !== 'ALL'
      ? { visaType: options.visa }
      : null;

    // Priority filter
    const priorityFilter = options.priority && options.priority !== 'ALL'
      ? { applications: { some: { priority: options.priority as any } } }
      : null;

    // Stage filter
    let stageFilter: any = null;
    if (options.stage && options.stage !== 'ALL') {
      if (options.stage === 'RAW_PROSPECT') {
        stageFilter = { applications: { some: { currentStage: ApplicationStage.RAW_PROSPECT } } };
      } else if (options.stage === 'DOC_OUTREACH' || options.stage === 'DOC_COLLECTION') {
        stageFilter = { applications: { some: { currentStage: ApplicationStage.DOC_OUTREACH } } };
      } else if (options.stage === 'PREP_IN_PROGRESS') {
        stageFilter = { applications: { some: { currentStage: ApplicationStage.DOC_PREP } } };
      } else if (options.stage === 'QA_REVIEW') {
        stageFilter = { applications: { some: { currentStage: ApplicationStage.CORRECTION_NEEDED } } };
      } else if (options.stage === 'SALES_PITCH' || options.stage === 'PAYMENT_PENDING') {
        stageFilter = {
          applications: {
            some: {
              currentStage: { in: [ApplicationStage.SALES_PITCH_QUEUE, ApplicationStage.SALES_PITCHING] },
            },
          },
        };
      } else if (options.stage === 'FILING_READY' || options.stage === 'E_FILED') {
        stageFilter = {
          applications: {
            some: {
              currentStage: { in: [ApplicationStage.FILING_QUEUE, ApplicationStage.FILING_IN_PROGRESS] },
            },
          },
        };
      } else if (options.stage === 'IRS_ACCEPTED') {
        stageFilter = { applications: { some: { currentStage: ApplicationStage.FILING_SUCCESS } } };
      } else if (options.stage.startsWith('DROPPED') || options.stage === 'RETURNED_TO_POOL') {
        stageFilter = {
          applications: {
            some: {
              currentStage: { in: [ApplicationStage.DROPPED_CANCELLED, ApplicationStage.FILING_FAILED] },
            },
          },
        };
      }
    }

    // Lifecycle Status filter
    let lifecycleFilter: any = null;
    if (options.lifecycle && options.lifecycle !== 'ALL') {
      if (options.lifecycle === 'CONVERTED') {
        lifecycleFilter = {
          OR: [
            { isConvertedCustomer: true },
            { applications: { some: { currentStage: ApplicationStage.FILING_SUCCESS } } },
          ],
        };
      } else if (options.lifecycle === 'IN_PIPELINE') {
        lifecycleFilter = {
          isConvertedCustomer: false,
          applications: {
            some: {
              currentStage: {
                in: [
                  ApplicationStage.RAW_PROSPECT,
                  ApplicationStage.DOC_OUTREACH,
                  ApplicationStage.DOC_PREP,
                  ApplicationStage.CORRECTION_NEEDED,
                  ApplicationStage.SALES_PITCH_QUEUE,
                  ApplicationStage.SALES_PITCHING,
                  ApplicationStage.FILING_QUEUE,
                  ApplicationStage.FILING_IN_PROGRESS,
                ],
              },
            },
          },
        };
      } else if (options.lifecycle === 'DROPPED' || options.lifecycle === 'STALLED' || options.lifecycle === 'RETURNED') {
        lifecycleFilter = {
          applications: {
            some: {
              currentStage: { in: [ApplicationStage.DROPPED_CANCELLED, ApplicationStage.FILING_FAILED] },
            },
          },
        };
      }
    }

    const whereClause: any = {
      AND: [
        ...(searchFilter ? [searchFilter] : []),
        ...(taxYearFilter ? [taxYearFilter] : []),
        ...(visaFilter ? [visaFilter] : []),
        ...(priorityFilter ? [priorityFilter] : []),
        ...(stageFilter ? [stageFilter] : []),
        ...(lifecycleFilter ? [lifecycleFilter] : []),
      ],
    };

    const [customers, totalCount] = await Promise.all([
      prisma.customerProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              mobile: true,
              role: true,
              createdAt: true,
            },
          },
          applications: {
            orderBy: { taxYear: 'desc' },
            include: {
              assignedDocAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
              assignedPrepAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
              assignedReviewAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
              assignedSalesAgent: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
              assignedFileOp: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
              documents: {
                select: {
                  id: true,
                  fileName: true,
                  filePath: true,
                  documentCategory: true,
                  verificationStatus: true,
                  createdAt: true,
                },
              },
              quotes: {
                select: {
                  id: true,
                  quoteAmount: true,
                  discountAmount: true,
                  status: true,
                  createdAt: true,
                },
              },
              stageHistories: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                  movedByUser: { select: { id: true, firstName: true, lastName: true, role: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customerProfile.count({ where: whereClause }),
    ]);

    // Compute metrics across entire database
    const allCustomers = await prisma.customerProfile.findMany({
      select: {
        id: true,
        isConvertedCustomer: true,
        createdAt: true,
        applications: {
          select: {
            taxYear: true,
            currentStage: true,
            taxDraftSummary: true,
          },
        },
      },
    });

    let totalConverted = 0;
    let totalInPipeline = 0;
    let totalDroppedOrStalled = 0;
    let totalDirectSignups = 0;
    let totalBulkIngested = 0;
    let totalManualOrReferral = 0;
    const stageCounts: Record<string, number> = {
      RAW_PROSPECT: 0,
      DOC_OUTREACH: 0,
      DOC_COLLECTION: 0,
      PREP_IN_PROGRESS: 0,
      QA_REVIEW: 0,
      SALES_PITCH: 0,
      FILING_READY: 0,
      IRS_ACCEPTED: 0,
      DROPPED_PRICING: 0,
    };

    allCustomers.forEach((c) => {
      const isConverted = c.isConvertedCustomer || c.applications.some((a) => a.currentStage === ApplicationStage.FILING_SUCCESS);
      const isDropped = c.applications.some((a) => a.currentStage === ApplicationStage.DROPPED_CANCELLED || a.currentStage === ApplicationStage.FILING_FAILED);

      if (isConverted) {
        totalConverted++;
      } else if (isDropped) {
        totalDroppedOrStalled++;
      } else {
        totalInPipeline++;
      }

      // Check acquisition source
      let isSelfSignup = false;
      c.applications.forEach((app) => {
        const summary = app.taxDraftSummary as any;
        if (summary?.leadSource === 'SELF_SIGNUP' || summary?.source === 'SELF_SIGNUP' || summary?.isSelfRegistered === true) {
          isSelfSignup = true;
        }

        // Map stage count
        if (app.currentStage === ApplicationStage.RAW_PROSPECT) stageCounts.RAW_PROSPECT++;
        else if (app.currentStage === ApplicationStage.DOC_OUTREACH) stageCounts.DOC_OUTREACH++;
        else if (app.currentStage === ApplicationStage.DOC_PREP) stageCounts.PREP_IN_PROGRESS++;
        else if (app.currentStage === ApplicationStage.CORRECTION_NEEDED) stageCounts.QA_REVIEW++;
        else if (app.currentStage === ApplicationStage.SALES_PITCH_QUEUE || app.currentStage === ApplicationStage.SALES_PITCHING) stageCounts.SALES_PITCH++;
        else if (app.currentStage === ApplicationStage.FILING_QUEUE || app.currentStage === ApplicationStage.FILING_IN_PROGRESS) stageCounts.FILING_READY++;
        else if (app.currentStage === ApplicationStage.FILING_SUCCESS) stageCounts.IRS_ACCEPTED++;
        else if (app.currentStage === ApplicationStage.DROPPED_CANCELLED || app.currentStage === ApplicationStage.FILING_FAILED) stageCounts.DROPPED_PRICING++;
      });

      if (isSelfSignup) totalDirectSignups++;
      else totalBulkIngested++;
    });

    const totalRecords = allCustomers.length;
    const conversionRate = totalRecords > 0 ? Math.round((totalConverted / totalRecords) * 100) : 0;

    // Transform database records into clean MasterTaxpayerRecord format
    const formattedRecords = customers.map((c) => {
      const latestApp = c.applications[0];
      const summary = (latestApp?.taxDraftSummary as any) || {};
      const isSelfSignup = summary.leadSource === 'SELF_SIGNUP' || summary.isSelfRegistered === true;

      // Determine lifecycle status
      let lifecycleStatus = 'IN_PIPELINE';
      if (c.isConvertedCustomer || c.applications.some((a) => a.currentStage === ApplicationStage.FILING_SUCCESS)) {
        lifecycleStatus = 'CONVERTED';
      } else if (c.applications.some((a) => a.currentStage === ApplicationStage.DROPPED_CANCELLED || a.currentStage === ApplicationStage.FILING_FAILED)) {
        lifecycleStatus = 'DROPPED';
      }

      // Map active agent
      const assignedAgent = latestApp?.assignedPrepAgent || latestApp?.assignedDocAgent || latestApp?.assignedSalesAgent || latestApp?.assignedFileOp;

      // Map tax years
      const taxYears = c.applications.map((app) => {
        const appSummary = (app.taxDraftSummary as any) || {};
        let status: 'COMPLETED' | 'IN_PROGRESS' | 'DROPPED' = 'IN_PROGRESS';
        if (app.currentStage === ApplicationStage.FILING_SUCCESS) status = 'COMPLETED';
        else if (app.currentStage === ApplicationStage.DROPPED_CANCELLED || app.currentStage === ApplicationStage.FILING_FAILED) status = 'DROPPED';

        return {
          year: app.taxYear,
          status,
          formType: appSummary.formType || (app.filingType === 'CORPORATE' ? 'FORM_1120' : 'FORM_1040'),
          federalRefund: appSummary.federalRefund || undefined,
          federalTaxDue: appSummary.federalTaxDue || undefined,
          stateName: appSummary.stateName || c.state || undefined,
          stateRefund: appSummary.stateRefund || undefined,
          filingDate: appSummary.filingDate || undefined,
          irsAckId: appSummary.irsAckId || appSummary.irsSubmissionId || undefined,
        };
      });

      // Map timeline
      const timeline: any[] = (latestApp?.stageHistories || []).map((sh) => ({
        id: sh.id,
        timestamp: sh.createdAt.toISOString().slice(0, 16).replace('T', ' '),
        stage: sh.toStage,
        title: `Stage changed to ${sh.toStage}`,
        description: sh.remarks || `Transitioned from ${sh.fromStage || 'INITIAL'} to ${sh.toStage}`,
        actor: sh.movedByUser ? `${sh.movedByUser.firstName || ''} ${sh.movedByUser.lastName || ''}`.trim() : 'System',
        actorRole: sh.movedByUser?.role || 'SYSTEM',
      }));

      // If timeline is empty, provide initial ingest event
      if (timeline.length === 0) {
        timeline.push({
          id: `init-${c.id}`,
          timestamp: c.createdAt.toISOString().slice(0, 16).replace('T', ' '),
          stage: latestApp?.currentStage || 'RAW_PROSPECT',
          title: isSelfSignup ? 'Online Self-Registration' : 'Ingested into CRM',
          description: isSelfSignup ? 'Taxpayer submitted registration on public web portal' : 'Ingested from lead batch',
          actor: isSelfSignup ? `${c.firstName} ${c.lastName}` : 'Admin System',
          actorRole: isSelfSignup ? 'SELF_USER' : 'SYSTEM',
        });
      }

      // SSN Masking
      const rawSsn = c.ssnTin || '987-65-4321';
      const ssnMasked = rawSsn.length >= 4 ? `***-**-${rawSsn.slice(-4)}` : '***-**-****';

      return {
        id: `TX-${c.id.slice(0, 8)}`,
        customerId: c.id,
        leadId: latestApp?.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email || c.user?.email || 'N/A',
        phone: c.phone || c.user?.mobile || 'N/A',
        ssnMasked,
        fullSsn: rawSsn,
        visaType: (c.visaType as any) || 'H1B',
        filingStatus: (c.maritalStatus as any) || 'SINGLE',
        acquisitionSource: isSelfSignup ? 'DIRECT_SIGNUP' : 'BULK_IMPORT',
        batchRef: isSelfSignup ? 'Self-Signup Public Portal' : 'Bulk Ingest Batch',
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        lifecycleStatus: lifecycleStatus as any,
        currentStage: (latestApp?.currentStage as any) || 'RAW_PROSPECT',
        currentDepartment: latestApp?.assignedPrepAgent ? 'PREP_REVIEW' : latestApp?.assignedDocAgent ? 'DOCUMENTER' : latestApp?.assignedSalesAgent ? 'SALES' : latestApp?.assignedFileOp ? 'FILE_OPERATOR' : 'UNASSIGNED',
        assignedAgent: assignedAgent ? {
          id: assignedAgent.id,
          name: `${assignedAgent.firstName || ''} ${assignedAgent.lastName || ''}`.trim() || assignedAgent.email || 'Agent',
          role: assignedAgent.role,
          email: assignedAgent.email || '',
          department: 'Operations',
        } : undefined,
        taxYears,
        priority: (latestApp?.priority as any) || 'MEDIUM',
        estimatedFee: summary.serviceFee || summary.quoteAmount || 350,
        feePaid: summary.feePaid || (lifecycleStatus === 'CONVERTED' ? 350 : 0),
        dropReason: summary.dropReason || undefined,
        lastActivity: 'Active',
        city: c.city || undefined,
        state: c.state || undefined,
        timeline,
      };
    });

    let finalRecords = formattedRecords;
    if (options.source && options.source !== 'ALL') {
      finalRecords = finalRecords.filter((r) => r.acquisitionSource === options.source);
    }
    if (options.lifecycle && options.lifecycle !== 'ALL') {
      finalRecords = finalRecords.filter((r) => r.lifecycleStatus === options.lifecycle);
    }

    const totalMatchingCount = finalRecords.length;
    const totalPages = Math.ceil(totalMatchingCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedRecords = finalRecords.slice(startIndex, startIndex + limit);

    return {
      records: paginatedRecords,
      totalCount: totalMatchingCount,
      page,
      limit,
      totalPages,
      stats: {
        totalRecords,
        totalConverted,
        totalInPipeline,
        totalDroppedOrStalled,
        totalDirectSignups,
        totalBulkIngested,
        totalManualOrReferral,
        conversionRate,
        stageCounts,
        departmentCounts: {
          DOCUMENTER: stageCounts.DOC_OUTREACH + stageCounts.DOC_COLLECTION,
          PREP_REVIEW: stageCounts.PREP_IN_PROGRESS + stageCounts.QA_REVIEW,
          SALES: stageCounts.SALES_PITCH,
          FILE_OPERATOR: stageCounts.FILING_READY,
          COMPLETED: stageCounts.IRS_ACCEPTED,
        },
      },
    };
  }

  /**
   * Get A-to-Z comprehensive details for a specific taxpayer and tax year
   */
  public static async getTaxpayerYearDetails(customerId: string, taxYear: number) {
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      include: {
        user: true,
        applications: {
          where: { taxYear: Number(taxYear) },
          include: {
            assignedDocAgent: true,
            assignedPrepAgent: true,
            assignedReviewAgent: true,
            assignedSalesAgent: true,
            assignedFileOp: true,
            documents: {
              include: {
                uploadedByUser: { select: { id: true, firstName: true, lastName: true, role: true } },
              },
            },
            quotes: {
              include: {
                salesAgent: { select: { id: true, firstName: true, lastName: true, role: true } },
              },
            },
            stageHistories: {
              orderBy: { createdAt: 'desc' },
              include: {
                movedByUser: { select: { id: true, firstName: true, lastName: true, role: true } },
              },
            },
            callLogs: {
              orderBy: { createdAt: 'desc' },
              include: {
                agent: { select: { id: true, firstName: true, lastName: true, role: true } },
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new Error(`Taxpayer profile with ID ${customerId} not found`);
    }

    const application = customer.applications[0];
    const summary = (application?.taxDraftSummary as any) || {};

    return {
      taxpayer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email || customer.user?.email,
        phone: customer.phone || customer.user?.mobile,
        ssnTin: customer.ssnTin,
        visaType: customer.visaType,
        maritalStatus: customer.maritalStatus,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
      },
      yearDetails: {
        taxYear: Number(taxYear),
        applicationId: application?.id,
        currentStage: application?.currentStage || 'RAW_PROSPECT',
        priority: application?.priority || 'MEDIUM',
        filingType: application?.filingType || 'INDIVIDUAL',
        taxDraftSummary: summary,
        documents: (application?.documents || []).map((d) => ({
          id: d.id,
          fileName: d.fileName,
          filePath: d.filePath,
          documentCategory: d.documentCategory,
          verificationStatus: d.verificationStatus,
          createdAt: d.createdAt.toISOString(),
          uploadedBy: d.uploadedByUser ? `${d.uploadedByUser.firstName || ''} ${d.uploadedByUser.lastName || ''}`.trim() : 'User',
        })),
        quotes: (application?.quotes || []).map((q) => ({
          id: q.id,
          quoteAmount: Number(q.quoteAmount),
          discountAmount: Number(q.discountAmount),
          status: q.status,
          salesAgent: q.salesAgent ? `${q.salesAgent.firstName || ''} ${q.salesAgent.lastName || ''}`.trim() : 'Agent',
        })),
        stageHistories: (application?.stageHistories || []).map((sh) => ({
          id: sh.id,
          fromStage: sh.fromStage,
          toStage: sh.toStage,
          remarks: sh.remarks,
          createdAt: sh.createdAt.toISOString(),
          movedBy: sh.movedByUser ? `${sh.movedByUser.firstName || ''} ${sh.movedByUser.lastName || ''}`.trim() : 'System',
        })),
        callLogs: (application?.callLogs || []).map((cl) => ({
          id: cl.id,
          disposition: cl.disposition,
          subDisposition: cl.subDisposition,
          callSummary: cl.callSummary,
          createdAt: cl.createdAt.toISOString(),
          agent: cl.agent ? `${cl.agent.firstName || ''} ${cl.agent.lastName || ''}`.trim() : 'Agent',
        })),
        assignedAgents: {
          docAgent: application?.assignedDocAgent ? {
            id: application.assignedDocAgent.id,
            name: `${application.assignedDocAgent.firstName || ''} ${application.assignedDocAgent.lastName || ''}`.trim(),
            role: application.assignedDocAgent.role,
          } : undefined,
          prepAgent: application?.assignedPrepAgent ? {
            id: application.assignedPrepAgent.id,
            name: `${application.assignedPrepAgent.firstName || ''} ${application.assignedPrepAgent.lastName || ''}`.trim(),
            role: application.assignedPrepAgent.role,
          } : undefined,
          reviewAgent: application?.assignedReviewAgent ? {
            id: application.assignedReviewAgent.id,
            name: `${application.assignedReviewAgent.firstName || ''} ${application.assignedReviewAgent.lastName || ''}`.trim(),
            role: application.assignedReviewAgent.role,
          } : undefined,
          salesAgent: application?.assignedSalesAgent ? {
            id: application.assignedSalesAgent.id,
            name: `${application.assignedSalesAgent.firstName || ''} ${application.assignedSalesAgent.lastName || ''}`.trim(),
            role: application.assignedSalesAgent.role,
          } : undefined,
          fileOp: application?.assignedFileOp ? {
            id: application.assignedFileOp.id,
            name: `${application.assignedFileOp.firstName || ''} ${application.assignedFileOp.lastName || ''}`.trim(),
            role: application.assignedFileOp.role,
          } : undefined,
        },
      },
    };
  }
}
