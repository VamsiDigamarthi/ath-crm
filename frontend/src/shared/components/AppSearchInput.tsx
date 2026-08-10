import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AppSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  labelColor?: string
  labelSize?: 'xs' | 'sm' | 'md'
  error?: string
  isLoading?: boolean
  enableShortcut?: boolean
  debounceMs?: number
  className?: string
}

const LABEL_SIZE = {
  xs: 'text-[11px] font-medium text-gray-600',
  sm: 'text-xs font-semibold text-gray-700',
  md: 'text-sm font-semibold text-gray-800',
}

export function AppSearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  label,
  labelColor,
  labelSize = 'sm',
  error,
  isLoading = false,
  enableShortcut = true,
  debounceMs = 300,
  className,
}: AppSearchInputProps) {
  const [local, setLocal] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setLocal(value) }, [value])

  useEffect(() => {
    const t = setTimeout(() => { onChange(local) }, debounceMs)
    return () => clearTimeout(t)
  }, [local, onChange, debounceMs])

  useEffect(() => {
    if (!enableShortcut) return
    const onKey = (e: KeyboardEvent) => {
      const isShortcut = e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      const el = document.activeElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.getAttribute('contenteditable') === 'true')
      if (isShortcut && !typing) { e.preventDefault(); inputRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enableShortcut])

  const clear = () => { setLocal(''); onChange(''); inputRef.current?.focus() }

  return (
    <div className={cn('w-full flex flex-col gap-1', className)}>
      {label && (
        <label className={cn('tracking-tight', LABEL_SIZE[labelSize])} style={labelColor ? { color: labelColor } : undefined}>
          {label}
        </label>
      )}

      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none z-10">
          {isLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            : <Search className="w-3.5 h-3.5 stroke-[1.8]" />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-10 w-full pl-10 pr-11 bg-white border-[1.5px] rounded-xl text-xs text-gray-900',
            'placeholder-gray-400 transition-all duration-200 outline-none',
            'hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15',
            !error && 'border-gray-200',
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
          {local ? (
            <button type="button" onClick={clear} className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          ) : enableShortcut ? (
            <kbd className="hidden sm:inline-flex h-4 select-none items-center rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[9px] font-bold text-gray-400 shadow-sm">
              /
            </kbd>
          ) : null}
        </div>
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  )
}
