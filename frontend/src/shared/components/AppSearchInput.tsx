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
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    setLocal(value)
  }, [value])

  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    const t = setTimeout(() => {
      onChangeRef.current(local)
    }, debounceMs)
    return () => clearTimeout(t)
  }, [local, debounceMs])

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

  const clear = () => {
    setLocal('')
    onChangeRef.current('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative flex flex-col gap-1', className)}>
      {label && (
        <label className={cn(LABEL_SIZE[labelSize], labelColor || 'text-gray-700')}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-9 pr-14 py-2 text-xs rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 font-medium',
            'border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all',
            error && 'border-rose-400 focus:ring-rose-200'
          )}
        />
        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
          {local && !isLoading && (
            <button
              type="button"
              onClick={clear}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {enableShortcut && !local && !isLoading && (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 border border-gray-200 rounded">
              /
            </kbd>
          )}
        </div>
      </div>
      {error && <span className="text-[11px] text-rose-500 font-medium">{error}</span>}
    </div>
  )
}
