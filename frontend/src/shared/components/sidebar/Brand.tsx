import { ChevronLeft, ChevronRight } from 'lucide-react'
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
      <div className={cn('h-16 flex items-center justify-center border-b shrink-0 px-2 relative', theme.border)}>
        {/* Profile/Brand icon button - click to expand */}
        <button
          type="button"
          onClick={onToggle}
          title="Click profile icon to open sidebar"
          className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-transform hover:scale-105 shadow-2xs',
          )}
          style={{ backgroundColor: accentColor }}
        >
          {brand?.logo ?? (brand?.title?.[0]?.toUpperCase() ?? 'A')}
        </button>

        {/* Dedicated open button on the border */}
        <button
          type="button"
          onClick={onToggle}
          title="Open sidebar"
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 hover:text-[#16A34A] hover:border-emerald-400 shadow-xs flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-30"
        >
          <ChevronRight size={13} className="stroke-[2.5]" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn('h-16 flex items-center border-b shrink-0 px-3 gap-2', theme.border)}>
      {/* Logo */}
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white font-bold text-sm"
        style={{ backgroundColor: accentColor }}
      >
        {brand?.logo ?? (brand?.title?.[0]?.toUpperCase() ?? 'A')}
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col min-w-0 flex-1">
        {brand?.title && (
          <span className={cn('text-[14px] font-bold leading-tight truncate', theme.bg === 'bg-white' ? 'text-black font-extrabold' : 'text-white')}>
            {brand.title}
          </span>
        )}
        {brand?.subtitle && (
          <span className={cn('text-[10px] leading-tight truncate font-semibold mt-0.5', theme.bg === 'bg-white' ? 'text-black/70' : 'text-gray-400')}>
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
          'w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0 cursor-pointer',
          theme.bg === 'bg-white' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
        )}
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  )
}
