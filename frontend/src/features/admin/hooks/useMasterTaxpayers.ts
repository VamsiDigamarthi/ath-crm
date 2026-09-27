import { useState, useCallback, useEffect } from 'react';
import type { 
  MasterTaxpayerRecord, 
  MasterTaxpayerStats,
} from '../types/master-taxpayers.types';
import { MOCK_MASTER_TAXPAYERS, calculateMasterStats } from '../services/master-taxpayers-mock';
import { 
  MasterTaxpayersApiService, 
  type TaxpayerYearDetailsResponse 
} from '../services/master-taxpayers-service';
import toast from 'react-hot-toast';

export const useMasterTaxpayers = () => {
  const [records, setRecords] = useState<MasterTaxpayerRecord[]>(MOCK_MASTER_TAXPAYERS);
  const [totalCount, setTotalCount] = useState<number>(MOCK_MASTER_TAXPAYERS.length);
  const [stats, setStats] = useState<MasterTaxpayerStats>(() => calculateMasterStats(MOCK_MASTER_TAXPAYERS));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedLifecycle, setSelectedLifecycle] = useState<string>('ALL');
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('ALL');
  const [selectedVisa, setSelectedVisa] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [quickStageTab, setQuickStageTab] = useState<string>('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal state
  const [selectedTaxpayer, setSelectedTaxpayer] = useState<MasterTaxpayerRecord | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [yearDetailsLoading, setYearDetailsLoading] = useState(false);
  const [activeYearDetails, setActiveYearDetails] = useState<TaxpayerYearDetailsResponse['yearDetails'] | null>(null);
  const [selectedYearForDetail, setSelectedYearForDetail] = useState<number | null>(null);

  // Fetch from backend
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);

    let effectiveStage = selectedStage !== 'ALL' ? selectedStage : undefined;
    if (!effectiveStage && quickStageTab !== 'ALL') {
      if (quickStageTab === 'INGEST') effectiveStage = 'RAW_PROSPECT';
      else if (quickStageTab === 'DOC') effectiveStage = 'DOC_OUTREACH';
      else if (quickStageTab === 'PREP') effectiveStage = 'PREP_IN_PROGRESS';
      else if (quickStageTab === 'REVIEW') effectiveStage = 'QA_REVIEW';
      else if (quickStageTab === 'SALES') effectiveStage = 'SALES_PITCH';
      else if (quickStageTab === 'FILING') effectiveStage = 'FILING_READY';
      else if (quickStageTab === 'CONVERTED') effectiveStage = 'IRS_ACCEPTED';
      else if (quickStageTab === 'DROPPED') effectiveStage = 'DROPPED_PRICING';
    }

    try {
      const response = await MasterTaxpayersApiService.getMasterTaxpayers({
        search: searchQuery.trim() || undefined,
        stage: effectiveStage,
        source: selectedSource !== 'ALL' ? selectedSource : undefined,
        lifecycle: selectedLifecycle !== 'ALL' ? selectedLifecycle : undefined,
        taxYear: selectedTaxYear !== 'ALL' ? Number(selectedTaxYear) : undefined,
        visa: selectedVisa !== 'ALL' ? selectedVisa : undefined,
        priority: selectedPriority !== 'ALL' ? selectedPriority : undefined,
        page,
        limit,
      });

      if (response && response.records) {
        let filtered = response.records;
        if (selectedSource !== 'ALL') {
          filtered = filtered.filter((r) => r.acquisitionSource === selectedSource);
        }
        if (selectedLifecycle !== 'ALL') {
          filtered = filtered.filter((r) => r.lifecycleStatus === selectedLifecycle);
        }
        if (quickStageTab !== 'ALL') {
          filtered = filtered.filter((r) => {
            if (quickStageTab === 'INGEST') return r.currentStage === 'RAW_PROSPECT';
            if (quickStageTab === 'DOC') return ['DOC_OUTREACH', 'DOC_COLLECTION'].includes(r.currentStage);
            if (quickStageTab === 'PREP') return ['PREP_IN_PROGRESS', 'DOC_PREP'].includes(r.currentStage);
            if (quickStageTab === 'REVIEW') return ['QA_REVIEW', 'CORRECTION_NEEDED'].includes(r.currentStage);
            if (quickStageTab === 'SALES') return ['SALES_PITCH', 'SALES_PITCH_QUEUE', 'SALES_PITCHING', 'PAYMENT_PENDING'].includes(r.currentStage);
            if (quickStageTab === 'FILING') return ['FILING_READY', 'FILING_QUEUE', 'FILING_IN_PROGRESS', 'E_FILED'].includes(r.currentStage);
            if (quickStageTab === 'CONVERTED') return ['IRS_ACCEPTED', 'FILING_SUCCESS'].includes(r.currentStage);
            if (quickStageTab === 'DROPPED') return ['DROPPED_PRICING', 'DROPPED_UNRESPONSIVE', 'DROPPED_SELF_FILED', 'DROPPED_CANCELLED', 'FILING_FAILED', 'RETURNED_TO_POOL'].includes(r.currentStage);
            return true;
          });
        }
        setRecords(filtered);
        setTotalCount(response.totalCount || filtered.length);
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        // Fall back to client-filtered mock data if database has no records for query
        const fallbackFiltered = MOCK_MASTER_TAXPAYERS.filter((r) => {
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const match = `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
                          r.email.toLowerCase().includes(q) ||
                          r.phone.toLowerCase().includes(q) ||
                          r.ssnMasked.includes(q) ||
                          r.id.toLowerCase().includes(q);
            if (!match) return false;
          }

          // Quick stage tab filter
          if (quickStageTab !== 'ALL') {
            if (quickStageTab === 'INGEST' && r.currentStage !== 'RAW_PROSPECT') return false;
            if (quickStageTab === 'DOC' && !['DOC_OUTREACH', 'DOC_COLLECTION'].includes(r.currentStage)) return false;
            if (quickStageTab === 'PREP' && !['PREP_IN_PROGRESS', 'DOC_PREP'].includes(r.currentStage)) return false;
            if (quickStageTab === 'REVIEW' && !['QA_REVIEW', 'CORRECTION_NEEDED'].includes(r.currentStage)) return false;
            if (quickStageTab === 'SALES' && !['SALES_PITCH', 'SALES_PITCH_QUEUE', 'SALES_PITCHING', 'PAYMENT_PENDING'].includes(r.currentStage)) return false;
            if (quickStageTab === 'FILING' && !['FILING_READY', 'FILING_QUEUE', 'FILING_IN_PROGRESS', 'E_FILED'].includes(r.currentStage)) return false;
            if (quickStageTab === 'CONVERTED' && !['IRS_ACCEPTED', 'FILING_SUCCESS'].includes(r.currentStage)) return false;
            if (quickStageTab === 'DROPPED' && !['DROPPED_PRICING', 'DROPPED_UNRESPONSIVE', 'DROPPED_SELF_FILED', 'DROPPED_CANCELLED', 'FILING_FAILED', 'RETURNED_TO_POOL'].includes(r.currentStage)) return false;
          }

          if (selectedStage !== 'ALL' && r.currentStage !== selectedStage) return false;
          if (selectedSource !== 'ALL' && r.acquisitionSource !== selectedSource) return false;
          if (selectedLifecycle !== 'ALL' && r.lifecycleStatus !== selectedLifecycle) return false;
          if (selectedTaxYear !== 'ALL' && !r.taxYears.some((ty) => ty.year === Number(selectedTaxYear))) return false;
          if (selectedVisa !== 'ALL' && r.visaType !== selectedVisa) return false;
          if (selectedPriority !== 'ALL' && r.priority !== selectedPriority) return false;
          return true;
        });
        setRecords(fallbackFiltered.slice((page - 1) * limit, page * limit));
        setTotalCount(fallbackFiltered.length);
        setStats(calculateMasterStats(MOCK_MASTER_TAXPAYERS));
      }
    } catch {
      // Graceful fallback to mock data on network error
      const fallbackFiltered = MOCK_MASTER_TAXPAYERS.filter((r) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match = `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
                        r.email.toLowerCase().includes(q) ||
                        r.phone.toLowerCase().includes(q) ||
                        r.ssnMasked.includes(q) ||
                        r.id.toLowerCase().includes(q);
          if (!match) return false;
        }

        if (quickStageTab !== 'ALL') {
          if (quickStageTab === 'INGEST' && r.currentStage !== 'RAW_PROSPECT') return false;
          if (quickStageTab === 'DOC' && !['DOC_OUTREACH', 'DOC_COLLECTION'].includes(r.currentStage)) return false;
          if (quickStageTab === 'PREP' && !['PREP_IN_PROGRESS', 'DOC_PREP'].includes(r.currentStage)) return false;
          if (quickStageTab === 'REVIEW' && !['QA_REVIEW', 'CORRECTION_NEEDED'].includes(r.currentStage)) return false;
          if (quickStageTab === 'SALES' && !['SALES_PITCH', 'SALES_PITCH_QUEUE', 'SALES_PITCHING', 'PAYMENT_PENDING'].includes(r.currentStage)) return false;
          if (quickStageTab === 'FILING' && !['FILING_READY', 'FILING_QUEUE', 'FILING_IN_PROGRESS', 'E_FILED'].includes(r.currentStage)) return false;
          if (quickStageTab === 'CONVERTED' && !['IRS_ACCEPTED', 'FILING_SUCCESS'].includes(r.currentStage)) return false;
          if (quickStageTab === 'DROPPED' && !['DROPPED_PRICING', 'DROPPED_UNRESPONSIVE', 'DROPPED_SELF_FILED', 'DROPPED_CANCELLED', 'FILING_FAILED', 'RETURNED_TO_POOL'].includes(r.currentStage)) return false;
        }

        if (selectedStage !== 'ALL' && r.currentStage !== selectedStage) return false;
        if (selectedSource !== 'ALL' && r.acquisitionSource !== selectedSource) return false;
        if (selectedLifecycle !== 'ALL' && r.lifecycleStatus !== selectedLifecycle) return false;
        if (selectedTaxYear !== 'ALL' && !r.taxYears.some((ty) => ty.year === Number(selectedTaxYear))) return false;
        if (selectedVisa !== 'ALL' && r.visaType !== selectedVisa) return false;
        if (selectedPriority !== 'ALL' && r.priority !== selectedPriority) return false;
        return true;
      });
      setRecords(fallbackFiltered.slice((page - 1) * limit, page * limit));
      setTotalCount(fallbackFiltered.length);
      setStats(calculateMasterStats(MOCK_MASTER_TAXPAYERS));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    searchQuery,
    quickStageTab,
    selectedStage,
    selectedSource,
    selectedLifecycle,
    selectedTaxYear,
    selectedVisa,
    selectedPriority,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Load specific year A-Z details when user selects a tax year in the details modal
  const fetchYearDetails = useCallback(async (customerId: string, taxYear: number) => {
    setYearDetailsLoading(true);
    setSelectedYearForDetail(taxYear);
    try {
      const data = await MasterTaxpayersApiService.getTaxpayerYearDetails(customerId, taxYear);
      setActiveYearDetails(data.yearDetails);
    } catch {
      // Fallback synthetic details if not in db
      setActiveYearDetails({
        taxYear,
        currentStage: 'IRS_ACCEPTED',
        priority: 'HIGH',
        filingType: 'INDIVIDUAL',
        taxDraftSummary: {
          formType: 'FORM_1040',
          federalRefund: 4250,
          stateName: 'CA',
          stateRefund: 850,
          filingStatus: 'MARRIED_JOINT',
          irsSubmissionId: 'IRS-2025-CA-998124',
          eFilePin: '88412',
          agi: 148500,
        },
        documents: [
          {
            id: 'doc-1',
            fileName: `Form_W2_Wage_Statement_${taxYear}.pdf`,
            filePath: `/uploads/w2_${taxYear}.pdf`,
            documentCategory: 'INCOME_W2',
            verificationStatus: 'VERIFIED',
            createdAt: '2026-03-15T10:00:00Z',
            uploadedBy: 'Taxpayer',
          },
          {
            id: 'doc-2',
            fileName: `Form_1099B_Stock_Sales_${taxYear}.pdf`,
            filePath: `/uploads/1099b_${taxYear}.pdf`,
            documentCategory: 'INVESTMENT_1099B',
            verificationStatus: 'VERIFIED',
            createdAt: '2026-03-18T14:30:00Z',
            uploadedBy: 'Taxpayer',
          },
          {
            id: 'doc-3',
            fileName: `Form_8879_Signed_eFile_Auth_${taxYear}.pdf`,
            filePath: `/uploads/8879_${taxYear}.pdf`,
            documentCategory: 'FORM_8879',
            verificationStatus: 'VERIFIED',
            createdAt: '2026-04-05T09:15:00Z',
            uploadedBy: 'Priya Sharma (CPA)',
          },
          {
            id: 'doc-4',
            fileName: `Form_1040_Final_Tax_Return_${taxYear}.pdf`,
            filePath: `/uploads/1040_final_${taxYear}.pdf`,
            documentCategory: 'FINAL_TAX_RETURN',
            verificationStatus: 'VERIFIED',
            createdAt: '2026-04-10T16:00:00Z',
            uploadedBy: 'Priya Sharma (CPA)',
          },
        ],
        quotes: [
          {
            id: 'q-1',
            quoteAmount: 450,
            discountAmount: 0,
            status: 'PAID',
            salesAgent: 'Vikram Singh (Closer)',
          },
        ],
        stageHistories: [
          {
            id: 'sh-1',
            toStage: 'IRS_ACCEPTED',
            remarks: 'Federal & State returns successfully accepted by IRS',
            createdAt: '2026-04-10T17:00:00Z',
            movedBy: 'Priya Sharma (CPA)',
          },
          {
            id: 'sh-2',
            toStage: 'FILING_QUEUE',
            remarks: 'Form 8879 e-signature verified. Queued for transmission',
            createdAt: '2026-04-05T10:00:00Z',
            movedBy: 'Vikram Singh',
          },
        ],
        callLogs: [
          {
            id: 'cl-1',
            disposition: 'DOCUMENTS_VERIFIED',
            callSummary: 'Taxpayer confirmed stock vesting dates and CA residency months.',
            createdAt: '2026-03-19T11:00:00Z',
            agent: 'Ramesh Patel',
          },
        ],
        assignedAgents: {
          docAgent: { id: 'a-1', name: 'Ramesh Patel', role: 'DOC_AGENT' },
          prepAgent: { id: 'a-2', name: 'Kavita Rao', role: 'TAX_PREPARER' },
          reviewAgent: { id: 'a-3', name: 'Sunita Mehra', role: 'TAX_REVIEWER' },
          salesAgent: { id: 'a-4', name: 'Vikram Singh', role: 'SALES_CLOSER' },
          fileOp: { id: 'a-5', name: 'Priya Sharma', role: 'FILE_OP_TEAM_LEAD' },
        },
      });
    } finally {
      setYearDetailsLoading(false);
    }
  }, []);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Actions
  const handleInspect = useCallback((taxpayer: MasterTaxpayerRecord) => {
    setSelectedTaxpayer(taxpayer);
    setIsInspectModalOpen(true);
    // Automatically select the latest tax year or default to first available
    const initialYear = taxpayer.taxYears[0]?.year || new Date().getFullYear();
    fetchYearDetails(taxpayer.customerId || taxpayer.id, initialYear);
  }, [fetchYearDetails]);

  const handleCloseInspect = useCallback(() => {
    setIsInspectModalOpen(false);
    setActiveYearDetails(null);
    setSelectedYearForDetail(null);
  }, []);

  const handleSelectYear = useCallback((taxYear: number) => {
    if (!selectedTaxpayer) return;
    fetchYearDetails(selectedTaxpayer.customerId || selectedTaxpayer.id, taxYear);
  }, [selectedTaxpayer, fetchYearDetails]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedStage('ALL');
    setSelectedSource('ALL');
    setSelectedLifecycle('ALL');
    setSelectedTaxYear('ALL');
    setSelectedVisa('ALL');
    setSelectedPriority('ALL');
    setQuickStageTab('ALL');
    setPage(1);
    toast.success('Filters cleared');
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRecords().then(() => toast.success('Master registry refreshed'));
  }, [fetchRecords]);

  const handleExportCsv = useCallback(() => {
    try {
      const headers = ['Record ID,Client/Lead ID,First Name,Last Name,Email,Phone,Masked SSN,Visa Type,Acquisition Source,Batch/Origin,Lifecycle Status,Current Stage,Department,Assigned Staff,Tax Years,Priority,Fee Paid'];
      const rows = records.map((r) => [
        `"${r.id}"`,
        `"${r.customerId || r.leadId || 'N/A'}"`,
        `"${r.firstName}"`,
        `"${r.lastName}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.ssnMasked}"`,
        `"${r.visaType}"`,
        `"${r.acquisitionSource}"`,
        `"${r.batchRef || 'Direct Web'}"`,
        `"${r.lifecycleStatus}"`,
        `"${r.currentStage}"`,
        `"${r.currentDepartment}"`,
        `"${r.assignedAgent?.name || 'Unassigned'}"`,
        `"${r.taxYears.map((t) => t.year).join(';')}"`,
        `"${r.priority}"`,
        `"${r.feePaid || 0}"`,
      ].join(','));

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Master_Taxpayers_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${records.length} taxpayer records to CSV`);
    } catch {
      toast.error('Failed to export CSV');
    }
  }, [records]);

  return {
    // Data & Stats
    records,
    totalItems: totalCount,
    totalPages,
    overallStats: stats,
    isLoading,
    isRefreshing,

    // Filter states
    searchQuery,
    setSearchQuery,
    selectedStage,
    setSelectedStage,
    selectedSource,
    setSelectedSource,
    selectedLifecycle,
    setSelectedLifecycle,
    selectedTaxYear,
    setSelectedTaxYear,
    selectedVisa,
    setSelectedVisa,
    selectedPriority,
    setSelectedPriority,
    quickStageTab,
    setQuickStageTab,

    // Pagination
    page,
    setPage,
    limit,
    setLimit,

    // Modal & Year Details
    selectedTaxpayer,
    isInspectModalOpen,
    activeYearDetails,
    selectedYearForDetail,
    yearDetailsLoading,
    handleInspect,
    handleCloseInspect,
    handleSelectYear,

    // Actions
    handleResetFilters,
    handleRefresh,
    handleExportCsv,
  };
};
