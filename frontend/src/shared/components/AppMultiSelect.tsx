import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, X, Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  label: string
  value: string
}

export interface AppMultiSelectProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  labelColor?: string
  labelSize?: 'xs' | 'sm' | 'md'
  error?: string
  className?: string
}

const LABEL_SIZE = { xs: 'text-xs', sm: 'text-sm', md: 'text-base' }

export function AppMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  label,
  labelColor,
  labelSize = 'sm',
  error,
  className,
}: AppMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [rect, setRect] = useState<DOMRect | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef   = useRef<HTMLDivElement>(null)
  const dropdownRef  = useRef<HTMLDivElement>(null)

  const open = () => {
    if (!isOpen && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
    setIsOpen((v) => !v)
  }

  const close = () => setIsOpen(false)

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

  const toggle = (val: string) => {
    onChange(selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val])
  }

  const remove = (val: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedValues.filter((v) => v !== val))
  }

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
  const selected = options.filter((o) => selectedValues.includes(o.value))

  const dropdownTop = rect ? rect.bottom + 4 : 0

  return (
    <div className={cn('w-full flex flex-col gap-1', className)} ref={containerRef}>
      {label && (
        <label className={cn('font-semibold tracking-wide', LABEL_SIZE[labelSize])} style={{ color: labelColor || '#374151' }}>
          {label}
        </label>
      )}

      <div
        ref={triggerRef}
        onClick={open}
        className={cn(
          'min-h-[2.75rem] w-full flex items-center justify-between gap-2 px-3.5 py-1.5 bg-white border-[1.5px] rounded-xl cursor-pointer transition-all duration-200',
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200 hover:border-gray-300',
          error && 'border-rose-400',
        )}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selected.length === 0 ? (
            <span className="text-gray-400 text-sm select-none">{placeholder}</span>
          ) : selected.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-lg transition-all hover:bg-indigo-100"
            >
              {opt.label}
              <button onClick={(e) => remove(opt.value, e)} className="hover:text-indigo-900 rounded-full hover:bg-indigo-200/50 p-0.5 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-gray-400 shrink-0">
          {selected.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onChange([]) }}
              className="hover:text-gray-600 rounded-full p-0.5 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180 text-indigo-500')} />
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {isOpen && rect && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownTop, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="flex items-center border-b border-gray-100 px-3.5 py-2.5 bg-gray-50/50">
            <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">No results found</div>
            ) : filtered.map((opt) => {
              const checked = selectedValues.includes(opt.value)
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer select-none transition-colors',
                    checked ? 'bg-indigo-50/50 text-indigo-900 font-medium' : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-4 h-4 rounded-md border flex items-center justify-center transition-all',
                      checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white',
                    )}>
                      {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                    {opt.label}
                  </div>
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
