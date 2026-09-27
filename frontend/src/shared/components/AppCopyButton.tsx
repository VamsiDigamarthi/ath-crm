import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';

export interface AppCopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const AppCopyButton: React.FC<AppCopyButtonProps> = ({
  text,
  className,
  size = 'md',
}) => {
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering parent clicks (like table rows)
    copy(text);
  };

  const iconSize = size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-md border text-black hover:text-[#16A34A] hover:bg-emerald-50 border-slate-300 bg-white transition-all shadow-xs duration-200 cursor-pointer",
        size === 'sm' ? "p-1.5 h-7 w-7" : "p-2 h-8.5 w-8.5",
        isCopied ? "border-emerald-300 bg-emerald-50 text-[#16A34A] hover:bg-emerald-50 hover:text-[#16A34A]" : "",
        className
      )}
      title="Copy to clipboard"
    >
      {isCopied ? (
        <Check className={cn(iconSize, "animate-in zoom-in duration-200")} />
      ) : (
        <Copy className={cn(iconSize, "animate-in fade-in duration-200")} />
      )}
    </button>
  );
};
