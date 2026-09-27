import { useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface AppTextareaProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  labelSize?: 'xs' | 'sm' | 'md'
  hint?: string
  error?: string
  disabled?: boolean
  rows?: number
  minHeight?: string | number
  maxHeight?: string | number
  width?: string | number
  maxLength?: number
  showCount?: boolean
  autoResize?: boolean
  resize?: 'none' | 'vertical' | 'both'
  accentColor?: string
  className?: string
}

const LABEL_SIZE = {
  xs: 'text-[11px] font-medium text-gray-600',
  sm: 'text-xs font-semibold text-gray-700',
  md: 'text-sm font-semibold text-gray-800',
}

export function AppTextarea({
  value = '',
  onChange,
  placeholder,
  label,
  labelSize = 'sm',
  hint,
  error,
  disabled = false,
  rows = 3,
  minHeight,
  maxHeight,
  width,
  maxLength,
  showCount = false,
  autoResize = false,
  resize = 'none',
  accentColor = '#6366f1',
  className,
}: AppTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = ref.current
    if (!el || !autoResize) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [autoResize])

  useEffect(() => { adjustHeight() }, [value, adjustHeight])

  const count     = value.length
  const atLimit   = maxLength != null && count >= maxLength
  const nearLimit = maxLength != null && count >= maxLength * 0.85

  const resizeClass = { none: 'resize-none', vertical: 'resize-y', both: 'resize' }[resize]

  const px = (v: string | number) => typeof v === 'number' ? `${v}px` : v

  const wrapperStyle: React.CSSProperties = {}
  if (width) wrapperStyle.width = px(width)

  const textareaStyle: React.CSSProperties = {
    minHeight: minHeight ? px(minHeight) : `${rows * 1.5}rem`,
    maxHeight: maxHeight ? px(maxHeight) : autoResize ? '50vh' : undefined,
  }

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)} style={wrapperStyle}>

      {/* Label row */}
      <div className="flex items-center justify-between min-h-4">
        {label && (
          <label className={cn('tracking-tight', LABEL_SIZE[labelSize])}>
            {label}
          </label>
        )}
        {showCount && maxLength && (
          <span className={cn(
            'text-[10px] font-medium tabular-nums ml-auto',
            atLimit ? 'text-red-500' : nearLimit ? 'text-amber-500' : 'text-gray-400',
          )}>
            {count} / {maxLength}
          </span>
        )}
        {showCount && !maxLength && (
          <span className="text-[10px] text-gray-400 ml-auto tabular-nums">{count}</span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={e => { onChange?.(e.target.value); adjustHeight() }}
        className={cn(
          'w-full px-3 py-2 text-xs rounded-md border',
          'bg-white text-black placeholder:text-slate-400 font-semibold',
          'transition-colors duration-150 focus:outline-none border-slate-300',
          'scrollbar-gutter-stable',
          '[&::-webkit-scrollbar]:w-1',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-slate-300',
          'hover:[&::-webkit-scrollbar-thumb]:bg-slate-400',
          resizeClass,
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-slate-400',
          error ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600',
        )}
        style={{
          ...textareaStyle,
          '--ta-accent': accentColor,
        } as React.CSSProperties}
      />

      {/* Footer */}
      {error ? (
        <p className="text-[11px] text-red-500 flex items-center gap-1.5 font-medium">
          <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-gray-400">{hint}</p>
      ) : null}
    </div>
  )
}
