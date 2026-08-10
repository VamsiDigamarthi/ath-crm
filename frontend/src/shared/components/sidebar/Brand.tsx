import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarBrand, SidebarTheme } from './types'

interface Props {
  brand?: SidebarBrand
  collapsed: boolean
  onToggle: () => void
  theme: SidebarTheme
  accentColor: string
}

export function Brand({ brand, collapsed, onToggle, theme, accentColor }: Props) {
  if (collapsed) {
    return (
      <div className={cn('h-16 flex items-center justify-center border-b shrink-0', theme.border)}>
        <button
          type="button"
          onClick={onToggle}
          title="Expand sidebar"
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-opacity hover:opacity-80',
          )}
          style={{ backgroundColor: accentColor }}
        >
          {brand?.logo ?? (brand?.title?.[0]?.toUpperCase() ?? 'A')}
        </button>
      </div>
    )
  }

  return (
    <div className={cn('h-16 flex items-center border-b shrink-0 px-3 gap-2', theme.border)}>
      {/* Logo */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
        style={{ backgroundColor: accentColor }}
      >
        {brand?.logo ?? (brand?.title?.[0]?.toUpperCase() ?? 'A')}
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col min-w-0 flex-1">
        {brand?.title && (
          <span className={cn('text-[15px] font-bold leading-tight truncate', theme.text === 'text-gray-700' ? 'text-gray-900' : 'text-white')}>
            {brand.title}
          </span>
        )}
        {brand?.subtitle && (
          <span className={cn('text-[10px] leading-tight truncate', theme.textMuted)}>
            {brand.subtitle}
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        title="Collapse sidebar"
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer',
          theme.hover,
          theme.textMuted,
        )}
      >
        <ChevronLeft size={14} />
      </button>
    </div>
  )
}
