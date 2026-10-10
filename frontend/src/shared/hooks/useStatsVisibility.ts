import { useState } from 'react';

/**
 * Show / hide the stat cards on a page. Cards are shown by default;
 * the choice is remembered per page in this browser.
 */
export const useStatsVisibility = (pageKey: string) => {
  const storageKey = `stats_visible_${pageKey}`;
  const [showStats, setShowStats] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) !== 'false';
    } catch {
      return true;
    }
  });

  const toggleStats = () => {
    setShowStats((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // storage blocked: still toggles for this visit
      }
      return next;
    });
  };

  return { showStats, toggleStats };
};
