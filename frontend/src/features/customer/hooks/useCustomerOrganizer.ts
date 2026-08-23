import { useState, useEffect, useCallback } from 'react';
import {
  customerApi,
  type OrganizerData,
} from '../services/customer-api';
import { validateModule1, validateModule2, validateModule3, type ValidationErrorMap } from '../components/organizer/utils/organizer-validation';
import toast from 'react-hot-toast';

export const useCustomerOrganizer = (taxYearParam?: string) => {
  const [selectedTaxYear, setSelectedTaxYear] = useState<number>(
    taxYearParam ? parseInt(taxYearParam, 10) : 2025
  );
  const [organizerData, setOrganizerData] = useState<OrganizerData | null>(null);
  const [selectedModId, setSelectedModId] = useState<string>('m1');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorMap>({});

  const fetchOrganizer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerApi.getOrganizer(selectedTaxYear.toString());
      if (res.data) {
        setOrganizerData(res.data.organizer);
        setProgressPercent(res.data.progressPercent);
        setCompletedCount(res.data.completedCount);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load organizer data';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedTaxYear]);

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
    field: keyof OrganizerData[K],
    value: any
  ) => {
    setOrganizerData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [moduleKey]: {
          ...prev[moduleKey],
          [field]: value,
        },
      };
    });
    clearError(field as string);
  };

  // Validate active module
  const validateCurrentModule = (): boolean => {
    if (!organizerData) return false;

    if (selectedModId === 'm1') {
      const errors = validateModule1(organizerData.m1_demographics);
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
      const updatedSubmitted = Array.from(
        new Set([...(organizerData.submittedModules || []), selectedModId])
      );
      const dataToSave: OrganizerData = {
        ...organizerData,
        submittedModules: updatedSubmitted,
      };
      setOrganizerData(dataToSave);

      const res = await customerApi.saveOrganizer(selectedTaxYear, dataToSave);
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

  // Navigation handlers
  const moduleIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'];
  const currentModIndex = moduleIds.indexOf(selectedModId);

  const handleNext = async () => {
    const success = await saveOrganizer(true);
    if (!success) {
      // Stay on current module so user can correct highlighted errors
      return;
    }

    if (currentModIndex < moduleIds.length - 1) {
      setSelectedModId(moduleIds[currentModIndex + 1]);
    } else {
      toast.success('All 9 intake modules reviewed! Ready for CPA return preparation.');
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
    handleNext,
    handlePrev,
    refetch: fetchOrganizer,
  };
};
