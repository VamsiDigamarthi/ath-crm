import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { documenterService } from '../services/documenter-service';
export const generateTaxYears = (futureYears = 2, pastYears = 6): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + futureYears; y >= currentYear - pastYears; y--) {
    years.push(y);
  }
  return years;
};

interface YearLike {
  id: string;
  taxYear: number;
}

export const useChangeTaxYear = (
  applicationId: string | undefined,
  currentYear: number | undefined,
  existingYears: YearLike[],
  onChanged: () => void | Promise<void>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const yearOptions = useMemo(() => {
    const taken = new Set(existingYears.filter((y) => y.id !== applicationId).map((y) => y.taxYear));
    return generateTaxYears(2, 6).map((yr) => ({
      value: String(yr),
      label: taken.has(yr) ? `TY ${yr} · already has a return` : `TY ${yr}`,
      disabled: taken.has(yr),
    }));
  }, [existingYears, applicationId]);

  const open = () => {
    setSelectedYear(currentYear ? String(currentYear) : '');
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const save = async () => {
    const year = Number(selectedYear);
    if (!applicationId || !year) return;
    if (year === currentYear) {
      close();
      return;
    }
    if (yearOptions.find((o) => o.value === selectedYear)?.disabled) {
      toast.error(`This taxpayer already has a TY ${year} return`);
      return;
    }
    setIsSaving(true);
    try {
      await documenterService.changeTaxYear(applicationId, year);
      toast.success(`Tax year updated to TY ${year}`);
      close();
      await onChanged();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update tax year');
    } finally {
      setIsSaving(false);
    }
  };

  return { isOpen, open, close, selectedYear, setSelectedYear, yearOptions, isSaving, save };
};
