import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Button } from './Button';

interface StatsToggleButtonProps {
  visible: boolean;
  onToggle: () => void;
}

/** Toolbar button next to Filters: hides / shows the page's stat cards */
export const StatsToggleButton: React.FC<StatsToggleButtonProps> = ({ visible, onToggle }) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onToggle}
    className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
    title={visible ? 'Hide the summary cards' : 'Show the summary cards'}
  >
    <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
    <span>{visible ? 'Hide stats' : 'Show stats'}</span>
  </Button>
);
