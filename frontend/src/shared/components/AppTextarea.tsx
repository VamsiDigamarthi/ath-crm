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
          'w-full px-3 py-2 text-xs rounded-xl border-[1.5px]',
          'bg-white text-gray-800 placeholder:text-gray-400',
          'transition-colors duration-150 focus:outline-none',
          'scrollbar-gutter-stable',
          '[&::-webkit-scrollbar]:w-1',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-gray-200',
          'hover:[&::-webkit-scrollbar-thumb]:bg-gray-300',
          resizeClass,
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-300',
          error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[--ta-accent]',
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
