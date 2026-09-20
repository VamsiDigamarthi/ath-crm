export type DateFilterPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

export interface DateFilterRange {
  preset: DateFilterPreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

/**
 * Returns [startMs, endMs] timestamp bounds for a given filter preset / custom dates.
 * 'WEEK' = actual current calendar week (Monday 00:00:00 to Sunday 23:59:59.999).
 * 'MONTH' = actual current calendar month (1st of month 00:00:00 to last day of month 23:59:59.999).
 * 'TODAY' = actual current day (00:00:00 to 23:59:59.999).
 * 'CUSTOM' = from startDate 00:00:00 to endDate 23:59:59.999.
 */
export function getDateRangeBounds(
  preset: DateFilterPreset,
  customStartDate?: string | null,
  customEndDate?: string | null
): { startMs: number; endMs: number; start: Date; end: Date; label: string; periodSuffix: string } {
  const now = new Date();

  if (preset === 'TODAY') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      startMs: start.getTime(),
      endMs: end.getTime(),
      start,
      end,
      label: 'Today',
      periodSuffix: 'Today',
    };
  }

  if (preset === 'WEEK') {
    const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
    return {
      startMs: start.getTime(),
      endMs: end.getTime(),
      start,
      end,
      label: 'This Week',
      periodSuffix: 'This Week',
    };
  }

  if (preset === 'MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      startMs: start.getTime(),
      endMs: end.getTime(),
      start,
      end,
      label: 'This Month',
      periodSuffix: 'This Month',
    };
  }

  // CUSTOM
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (customStartDate) {
    const parsedStart = new Date(customStartDate + 'T00:00:00');
    if (!isNaN(parsedStart.getTime())) {
      start = parsedStart;
    }
  }
  if (customEndDate) {
    const parsedEnd = new Date(customEndDate + 'T23:59:59.999');
    if (!isNaN(parsedEnd.getTime())) {
      end = parsedEnd;
    }
  }

  const label = customStartDate && customEndDate
    ? `${customStartDate} to ${customEndDate}`
    : customStartDate
    ? `From ${customStartDate}`
    : customEndDate
    ? `Until ${customEndDate}`
    : 'Custom Period';

  return {
    startMs: start.getTime(),
    endMs: end.getTime(),
    start,
    end,
    label,
    periodSuffix: 'in Period',
  };
}

export function isDateInRange(
  dateVal: string | Date | null | undefined,
  preset: DateFilterPreset,
  customStartDate?: string | null,
  customEndDate?: string | null
): boolean {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  const time = d.getTime();
  if (isNaN(time)) return false;

  const { startMs, endMs } = getDateRangeBounds(preset, customStartDate, customEndDate);
  return time >= startMs && time <= endMs;
}

/**
 * Format helper for period labels across cards
 */
export function getPeriodSuffix(
  preset: DateFilterPreset,
  _customStartDate?: string | null,
  _customEndDate?: string | null
): string {
  switch (preset) {
    case 'TODAY':
      return 'Today';
    case 'WEEK':
      return 'This Week';
    case 'MONTH':
      return 'This Month';
    case 'CUSTOM':
      return 'in Selected Period';
    default:
      return '';
  }
}
