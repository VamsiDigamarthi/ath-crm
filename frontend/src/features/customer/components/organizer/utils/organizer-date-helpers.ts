// Helper to convert string "MM/DD/YYYY" or "YYYY-MM-DD" to Date
export const parseUsDate = (str?: string): Date | undefined => {
  if (!str) return undefined;
  const parts = str.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return isNaN(d.getTime()) ? undefined : d;
    } else {
      // MM/DD/YYYY
      const d = new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      return isNaN(d.getTime()) ? undefined : d;
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? undefined : d;
};

// Helper to format Date to "MM/dd/yyyy"
export const formatUsDate = (date?: Date | null): string => {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};
