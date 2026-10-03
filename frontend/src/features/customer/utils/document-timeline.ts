const GAP_MS = 30 * 60 * 1000;

export interface TimelineGroup<T> {
  key: string;
  label: string;
  items: T[];
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const formatTimelineLabel = (date: Date, now: Date = new Date()): string => {
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, now)) return `Today, ${time}`;
  if (sameDay(date, yesterday)) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${time}`;
};

/**
 * Groups items newest-first; a new group starts when the gap to the previous upload exceeds 30 minutes.
 */
export const groupByUploadTime = <T extends { id: string; createdAt: string }>(items: T[]): TimelineGroup<T>[] => {
  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const groups: TimelineGroup<T>[] = [];
  let lastTime: number | null = null;

  for (const item of sorted) {
    const t = new Date(item.createdAt).getTime();
    if (lastTime === null || isNaN(t) || lastTime - t > GAP_MS) {
      groups.push({ key: item.id, label: isNaN(t) ? 'Unknown date' : formatTimelineLabel(new Date(t)), items: [] });
    }
    groups[groups.length - 1].items.push(item);
    if (!isNaN(t)) lastTime = t;
  }
  return groups;
};
