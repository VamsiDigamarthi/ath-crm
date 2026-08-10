import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface AppSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  labelColor?: string
  labelSize?: 'xs' | 'sm' | 'md'
  error?: string
  searchable?: boolean
  disabled?: boolean
  className?: string
}

const LABEL_SIZE = {
  xs: 'text-[11px] font-medium text-gray-600',
  sm: 'text-xs font-semibold text-gray-700',
  md: 'text-sm font-semibold text-gray-800',
}

export function AppSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  labelColor,
  labelSize = 'sm',
  error,
  searchable = false,
  disabled = false,
  className,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [rect, setRect] = useState<DOMRect | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef   = useRef<HTMLButtonElement>(null)
  const dropdownRef  = useRef<HTMLDivElement>(null)

  const open = () => {
    if (disabled) return
    if (!isOpen && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
    setIsOpen((v) => !v)
  }

  const close = () => { setIsOpen(false); setSearch('') }

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      const t = e.target as Node
      if (!containerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) close()
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const update = () => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [isOpen])

  const selected = options.find((o) => o.value === value)
  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const dropdownTop = rect ? rect.bottom + 4 : 0

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)} ref={containerRef}>
      {label && (
        <label className={cn('tracking-tight', LABEL_SIZE[labelSize])} style={labelColor ? { color: labelColor } : undefined}>
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        disabled={disabled}
        className={cn(
          'w-full h-10 flex items-center justify-between gap-2 px-3.5 bg-white border-[1.5px] rounded-xl text-xs transition-all duration-200',
          'hover:border-gray-300',
          isOpen && 'border-indigo-500 ring-2 ring-indigo-500/15',
          !isOpen && !error && 'border-gray-200',
          error && 'border-rose-400',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
        )}
      >
        <span className={cn('flex-1 truncate text-left', selected ? 'text-gray-900 font-medium' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 text-gray-400 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="p-0.5 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} className={cn('transition-transform duration-200', isOpen && 'rotate-180 text-indigo-500')} />
        </div>
      </button>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}

      {isOpen && rect && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownTop, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
        >
          {searchable && (
            <div className="flex items-center border-b border-gray-100 px-3 py-2 bg-gray-50/50">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          )}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-5 text-center text-xs text-gray-400">No results found</div>
            ) : filtered.map((opt) => {
              const active = opt.value === value
              return (
                <div
                  key={opt.value}
                  onClick={() => { if (!opt.disabled) { onChange(opt.value); close() } }}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer select-none transition-colors',
                    active ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-gray-700 hover:bg-gray-50',
                    opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                  )}
                >
                  {opt.label}
                  {active && <Check size={13} className="text-indigo-600 shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
