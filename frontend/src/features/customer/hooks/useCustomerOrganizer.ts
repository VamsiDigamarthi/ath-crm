import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  customerApi,
  type OrganizerData,
} from '../services/customer-api';
import { 
  validateModule1, 
  validateModule2, 
  validateModule3, 
  validateModule4, 
  validateModule5, 
  validateModule10Retirement,
  validateModule6, 
  validateModule7, 
  validateModule8, 
  validateModule9,
  validateBusinessCompanyInfo,
  validateBusinessIncome,
  validateBusinessExpenses,
  validateEntireOrganizer,
  type ValidationErrorMap 
} from '../components/organizer/utils/organizer-validation';
import toast from 'react-hot-toast';

export const useCustomerOrganizer = (
  taxYearParam?: string,
  filingTypeParam?: string,
  leadIdParam?: string
) => {
  const isBusiness = filingTypeParam?.toUpperCase() === 'BUSINESS';
  const defaultModId = isBusiness ? 'b1_companyInfo' : 'm1';

  const [selectedTaxYear, setSelectedTaxYear] = useState<number>(
    taxYearParam ? parseInt(taxYearParam, 10) : new Date().getFullYear()
  );
  const [organizerData, setOrganizerData] = useState<OrganizerData | null>(null);
  const [selectedModId, setSelectedModId] = useState<string>(defaultModId);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorMap>({});

  const moduleIds = useMemo(() => {
    return isBusiness
      ? ['b1_companyInfo', 'b2_businessIncome', 'b3_businessExpenses', 'm7', 'm_vault', 'm_review_draft']
      : ['m1', 'm_income', 'm_expenses', 'm7', 'm_vault', 'm_review_draft'];
  }, [isBusiness]);

  const currentModIndex = moduleIds.indexOf(selectedModId);

  // Sync selectedModId when filingType changes
  useEffect(() => {
    if (isBusiness && !moduleIds.includes(selectedModId)) {
      setSelectedModId('b1_companyInfo');
    } else if (!isBusiness && !moduleIds.includes(selectedModId)) {
      setSelectedModId('m1');
    }
  }, [isBusiness, moduleIds, selectedModId]);

  const fetchOrganizer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerApi.getOrganizer(selectedTaxYear.toString(), isBusiness ? 'BUSINESS' : 'INDIVIDUAL', leadIdParam);
      if (res.data) {
        const org = res.data.organizer;
        if (org && org.m3_presence) {
          const userState = org.m1_demographics?.state || '';
          if (!org.m3_presence.statesResidedHistory || org.m3_presence.statesResidedHistory.length === 0) {
            org.m3_presence.statesResidedHistory = [
              {
                taxYear: selectedTaxYear,
                state: userState,
                fromDate: '',
                toDate: '',
                spouseState: userState,
                spouseFromDate: '',
                spouseToDate: '',
              },
            ];
          }
        }
        setOrganizerData(org);
        setProgressPercent(res.data.progressPercent);
        setCompletedCount(res.data.completedCount);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load organizer data';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedTaxYear, isBusiness, leadIdParam]);

  useEffect(() => {
    if (taxYearParam) {
      const yr = parseInt(taxYearParam, 10);
      if (!isNaN(yr) && yr !== selectedTaxYear) {
        setSelectedTaxYear(yr);
      }
    }
  }, [taxYearParam, selectedTaxYear]);

  useEffect(() => {
    fetchOrganizer();
  }, [fetchOrganizer]);

  // Clear specific validation error on field edit
  const clearError = (field: string) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  // Update a specific module field
  const updateModuleField = <K extends keyof OrganizerData>(
    moduleKey: K,
    field: keyof NonNullable<OrganizerData[K]>,
    value: any
  ) => {
    setOrganizerData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [moduleKey]: {
          ...(prev[moduleKey] as any),
          [field]: value,
        },
      };
    });
    clearError(field as string);
  };

  // Validate active module
  const validateCurrentModule = (): boolean => {
    if (!organizerData) return false;

    // Business Modules
    if (selectedModId === 'b1_companyInfo') {
      const errors = validateBusinessCompanyInfo(organizerData.b1_companyInfo);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix company details: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'b2_businessIncome') {
      const errors = validateBusinessIncome(organizerData.b2_businessIncome);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix business income: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'b3_businessExpenses') {
      const errors = validateBusinessExpenses(organizerData.b3_businessExpenses);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix business expenses: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    // Individual Modules
    if (selectedModId === 'm1') {
      const e1 = validateModule1(organizerData.m1_demographics);
      const e2 = validateModule2(
        organizerData.m2_dependents,
        organizerData.m1_demographics?.maritalStatus
      );
      const e3 = validateModule3(organizerData.m3_presence, selectedTaxYear);
      const e9 = validateModule9(organizerData.m9_directDeposit, selectedTaxYear);
      const errors = { ...e1, ...e2, ...e3, ...e9 };
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fill out required fields: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm2') {
      const errors = validateModule2(
        organizerData.m2_dependents,
        organizerData.m1_demographics?.maritalStatus
      );
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix validation errors: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm3') {
      const errors = validateModule3(organizerData.m3_presence, selectedTaxYear);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix validation errors: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm4') {
      const errors = validateModule4(organizerData.m4_wages, selectedTaxYear);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix validation errors: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm5') {
      const errors = validateModule5(organizerData.m5_interest, selectedTaxYear);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix validation errors: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm6') {
      const errors = validateModule6(organizerData.m6_stocks, selectedTaxYear);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix validation errors: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm7') {
      const errors = validateModule7(organizerData.m7_foreign, selectedTaxYear);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix validation errors: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm9') {
      const errors = validateModule9(organizerData.m9_directDeposit, selectedTaxYear);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorFieldNames = Object.keys(errors);
        toast.error(`Please fix validation errors: ${errors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (
      selectedModId === 'm_income' ||
      selectedModId === 'm4' ||
      selectedModId === 'm5' ||
      selectedModId === 'm10' ||
      selectedModId === 'm6'
    ) {
      const e4 = validateModule4(organizerData.m4_wages, selectedTaxYear);
      const e5 = validateModule5(organizerData.m5_interest, selectedTaxYear);
      const e10 = validateModule10Retirement(organizerData.m10_retirement, selectedTaxYear);
      const e6 = validateModule6(organizerData.m6_stocks, selectedTaxYear);
      const allErrors = { ...e4, ...e5, ...e10, ...e6 };
      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors);
        const errorFieldNames = Object.keys(allErrors);
        toast.error(`Please fix validation errors: ${allErrors[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm_expenses' || selectedModId === 'm8') {
      const e8 = validateModule8(organizerData.m8_deductions, selectedTaxYear);
      if (Object.keys(e8).length > 0) {
        setValidationErrors(e8);
        const errorFieldNames = Object.keys(e8);
        toast.error(`Please fix validation errors: ${e8[errorFieldNames[0]]}`);
        return false;
      }
    }

    if (selectedModId === 'm_income_expenses') {
      const e4 = validateModule4(organizerData.m4_wages, selectedTaxYear);
      const e5 = validateModule5(organizerData.m5_interest, selectedTaxYear);
      const e10 = validateModule10Retirement(organizerData.m10_retirement, selectedTaxYear);
      const e6 = validateModule6(organizerData.m6_stocks, selectedTaxYear);
      const e8 = validateModule8(organizerData.m8_deductions, selectedTaxYear);
      const allErrors = { ...e4, ...e5, ...e10, ...e6, ...e8 };
      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors);
        const errorFieldNames = Object.keys(allErrors);
        toast.error(`Please fix validation errors: ${allErrors[errorFieldNames[0]]}`);
        return false;
      }
    }

    setValidationErrors({});
    return true;
  };

  // Save current organizer data to PostgreSQL
  const saveOrganizer = async (silent: boolean = false): Promise<boolean> => {
    if (!organizerData) return false;

    // Run strict validation before persisting
    const isValid = validateCurrentModule();
    if (!isValid) {
      return false;
    }

    try {
      setSaving(true);
      const extraKeys = selectedModId === 'm_income' 
        ? ['m4', 'm5', 'm10', 'm6', 'm_income'] 
        : selectedModId === 'm_expenses'
          ? ['m8', 'm_expenses']
          : selectedModId === 'm_income_expenses'
            ? ['m4', 'm5', 'm10', 'm6', 'm8', 'm_income', 'm_expenses', 'm_income_expenses']
            : selectedModId === 'm1'
              ? ['m1', 'm2', 'm3', 'm9']
              : [selectedModId];
      const updatedSubmitted = Array.from(
        new Set([...(organizerData.submittedModules || []), ...extraKeys])
      );
      // Prior-year presence days left blank are recorded as 0
      const m3 = organizerData.m3_presence;
      const dataToSave: OrganizerData = {
        ...organizerData,
        ...(m3 && {
          m3_presence: {
            ...m3,
            days2024: m3.days2024 ?? 0,
            days2023: m3.days2023 ?? 0,
          },
        }),
        submittedModules: updatedSubmitted,
      };
      setOrganizerData(dataToSave);

      const res = await customerApi.saveOrganizer(selectedTaxYear, dataToSave, leadIdParam, isBusiness ? 'BUSINESS' : 'INDIVIDUAL');
      if (res.data) {
        setProgressPercent(res.data.progressPercent);
        setCompletedCount(res.data.completedCount);
        setValidationErrors({});
        if (!silent) {
          toast.success('Organizer saved successfully! 🚀');
        }
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save organizer';
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save work-in-progress without validation (does not mark the section as completed)
  const saveDraft = async (): Promise<boolean> => {
    if (!organizerData) return false;
    try {
      setSaving(true);
      const res = await customerApi.saveOrganizer(selectedTaxYear, organizerData, leadIdParam, isBusiness ? 'BUSINESS' : 'INDIVIDUAL');
      if (res.data) {
        setProgressPercent(res.data.progressPercent);
        setCompletedCount(res.data.completedCount);
        setValidationErrors({});
        toast.success('Draft saved');
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save draft';
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    const isFinalTab = currentModIndex === moduleIds.length - 1;

    if (isFinalTab) {
      // Final step: validate ALL modules across the entire organizer!
      const validation = validateEntireOrganizer(
        organizerData,
        selectedTaxYear,
        isBusiness ? 'BUSINESS' : 'INDIVIDUAL'
      );
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        if (validation.firstFailedModuleId && validation.firstFailedModuleId !== selectedModId) {
          setSelectedModId(validation.firstFailedModuleId);
        }
        toast.error(validation.firstErrorMessage || 'Please complete all required fields before finishing.');
        return;
      }

      // All modules valid! Save with all modules marked as submitted
      try {
        setSaving(true);
        const allModuleIds = isBusiness
          ? ['b1_companyInfo', 'b2_businessIncome', 'b3_businessExpenses', 'm7', 'm_vault']
          : ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm_income', 'm_expenses', 'm_vault'];
        const updatedSubmitted = Array.from(
          new Set([...(organizerData?.submittedModules || []), ...allModuleIds])
        );
        const m3 = organizerData?.m3_presence;
        const dataToSave: OrganizerData = {
          ...organizerData!,
          ...(m3 && {
            m3_presence: {
              ...m3,
              days2024: m3.days2024 ?? 0,
              days2023: m3.days2023 ?? 0,
            },
          }),
          submittedModules: updatedSubmitted,
        };
        setOrganizerData(dataToSave);
        const res = await customerApi.saveOrganizer(selectedTaxYear, dataToSave, leadIdParam);
        if (res.data) {
          setProgressPercent(res.data.progressPercent);
          setCompletedCount(res.data.completedCount);
          setValidationErrors({});
          toast.success('All intake sections validated & saved! Ready for CPA return preparation.');
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to save organizer');
      } finally {
        setSaving(false);
      }
    } else {
      // Intermediate tab: validate current module only
      const success = await saveOrganizer(true);
      if (!success) {
        // Stay on current module so user can correct highlighted errors
        return;
      }

      if (currentModIndex >= 0 && currentModIndex < moduleIds.length - 1) {
        setSelectedModId(moduleIds[currentModIndex + 1]);
      }
    }
  };

  const handlePrev = () => {
    if (currentModIndex > 0) {
      setValidationErrors({});
      setSelectedModId(moduleIds[currentModIndex - 1]);
    }
  };

  return {
    organizerData,
    selectedTaxYear,
    setSelectedTaxYear,
    selectedModId,
    setSelectedModId,
    currentModIndex,
    loading,
    saving,
    progressPercent,
    completedCount,
    validationErrors,
    clearError,
    updateModuleField,
    saveOrganizer,
    saveDraft,
    handleNext,
    handlePrev,
    refetch: fetchOrganizer,
    filingType: isBusiness ? 'BUSINESS' : 'INDIVIDUAL',
    moduleIds,
  };
};
