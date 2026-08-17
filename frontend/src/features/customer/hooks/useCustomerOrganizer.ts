import { useState, useEffect, useCallback } from 'react';
import {
  customerApi,
  type OrganizerData,
} from '../services/customer-api';
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
  };

  // Save current organizer data to PostgreSQL
  const saveOrganizer = async (silent: boolean = false) => {
    if (!organizerData) return;

    try {
      setSaving(true);
      const res = await customerApi.saveOrganizer(selectedTaxYear, organizerData);
      if (res.data) {
        setProgressPercent(res.data.progressPercent);
        setCompletedCount(res.data.completedCount);
        if (!silent) {
          toast.success('Organizer saved successfully! 🚀');
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save organizer';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Navigation handlers
  const moduleIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'];
  const currentModIndex = moduleIds.indexOf(selectedModId);

  const handleNext = async () => {
    await saveOrganizer(true);
    if (currentModIndex < moduleIds.length - 1) {
      setSelectedModId(moduleIds[currentModIndex + 1]);
    } else {
      toast.success('All 9 intake modules reviewed! Ready for CPA return preparation.');
    }
  };

  const handlePrev = () => {
    if (currentModIndex > 0) {
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
    updateModuleField,
    saveOrganizer,
    handleNext,
    handlePrev,
    refetch: fetchOrganizer,
  };
};
