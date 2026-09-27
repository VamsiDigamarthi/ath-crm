import React, { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionContextType {
  openIndices: number[];
  toggleIndex: (index: number) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

export interface AppAccordionProps {
  children: React.ReactNode;
  defaultOpenIndex?: number;
  defaultOpenIndices?: number[];
  allowMultiple?: boolean;
  className?: string;
  onChange?: (openIndices: number[]) => void;
}

export const AppAccordion: React.FC<AppAccordionProps> = ({
  children,
  defaultOpenIndex = 0,
  defaultOpenIndices,
  allowMultiple = true,
  className = 'space-y-3.5',
  onChange,
}) => {
  const initialOpen = defaultOpenIndices ?? (defaultOpenIndex !== undefined ? [defaultOpenIndex] : [0]);
  const [openIndices, setOpenIndices] = useState<number[]>(initialOpen);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      let next: number[];
      if (prev.includes(index)) {
        next = prev.filter((i) => i !== index);
      } else {
        next = allowMultiple ? [...prev, index] : [index];
      }
      onChange?.(next);
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openIndices, toggleIndex }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
};

export interface AppAccordionItemProps {
  index?: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export const AppAccordionItem: React.FC<AppAccordionItemProps> = ({
  index,
  title,
  subtitle,
  icon,
  badge,
  isOpen: propIsOpen,
  defaultOpen = false,
  onToggle: propOnToggle,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  disabled = false,
}) => {
  const context = useContext(AccordionContext);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isControlled = propIsOpen !== undefined;
  const isContextManaged = context !== null && index !== undefined;

  const isOpen = isControlled
    ? propIsOpen
    : isContextManaged
      ? context.openIndices.includes(index)
      : uncontrolledOpen;

  const handleToggle = () => {
    if (disabled) return;
    if (propOnToggle) {
      propOnToggle();
    } else if (isContextManaged) {
      context.toggleIndex(index);
    } else {
      setUncontrolledOpen((prev) => !prev);
    }
  };

  return (
    <div
      className={`bg-white rounded-md border border-slate-300 shadow-2xs overflow-hidden transition-all duration-150 ${isOpen ? 'ring-1 ring-[#16A34A]/25' : ''
        } ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer select-none bg-white hover:bg-slate-50/80 ${isOpen ? 'border-b border-slate-200' : ''
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${headerClassName}`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {icon && (
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border transition-colors ${isOpen
                  ? 'bg-emerald-50 text-[#16A34A] border-emerald-300'
                  : 'bg-slate-100 text-black border-slate-300'
                }`}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-black tracking-tight">{title}</span>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs text-black/70 mt-0.5 font-medium truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-black transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#16A34A]' : ''
              }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className={`p-4 sm:p-5 bg-white space-y-4 animate-in fade-in duration-150 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};
