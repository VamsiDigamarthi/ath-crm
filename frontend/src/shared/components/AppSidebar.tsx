import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Brand } from './sidebar/Brand'
import { NavItem } from './sidebar/NavItem'
import { UserProfile } from './sidebar/UserProfile'
import type { AppSidebarProps, SidebarTheme } from './sidebar/types'

const THEMES: Record<'light' | 'dark', SidebarTheme> = {
  light: {
    bg:           'bg-white',
    border:       'border-gray-200',
    text:         'text-gray-700',
    textMuted:    'text-gray-400',
    hover:        'hover:bg-gray-100',
    sectionLabel: 'text-gray-400',
    divider:      'border-gray-100',
    iconBg:       'bg-gray-100',
  },
  dark: {
    bg:           'bg-gray-900',
    border:       'border-gray-700/60',
    text:         'text-gray-200',
    textMuted:    'text-gray-500',
    hover:        'hover:bg-white/8',
    sectionLabel: 'text-gray-600',
    divider:      'border-gray-700/60',
    iconBg:       'bg-white/10',
  },
}

const SCROLLBAR_LIGHT = [
  '[&::-webkit-scrollbar]:w-1',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-transparent',
  'hover:[&::-webkit-scrollbar-thumb]:bg-gray-300',
].join(' ')

const SCROLLBAR_DARK = [
  '[&::-webkit-scrollbar]:w-1',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-transparent',
  'hover:[&::-webkit-scrollbar-thumb]:bg-gray-600',
].join(' ')

export function AppSidebar({
  items,
  activeId,
  onItemClick,
  brand,
  user,
  onUserClick,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapseChange,
  width = 240,
  collapsedWidth = 64,
  activeStyle = 'pill',
  accentColor = '#6366f1',
  variant = 'light',
  renderLink,
  className,
}: AppSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const collapsed = controlledCollapsed ?? internalCollapsed

  function toggle() {
    const next = !collapsed
    setInternalCollapsed(next)
    onCollapseChange?.(next)
  }

  const theme = THEMES[variant]

  const sections: { label?: string; items: typeof items }[] = []
  const seen = new Set<string>()
  for (const item of items) {
    const sec = item.section ?? ''
    if (!seen.has(sec)) {
      seen.add(sec)
      sections.push({ label: sec || undefined, items: [] })
    }
    sections[sections.length - 1].items.push(item)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r transition-all duration-200 overflow-hidden',
        theme.bg,
        theme.border,
        className,
      )}
      style={{ width: collapsed ? collapsedWidth : width, minWidth: collapsed ? collapsedWidth : width }}
    >
      <Brand
        brand={brand}
        collapsed={collapsed}
        onToggle={toggle}
        theme={theme}
        accentColor={accentColor}
      />

      <nav className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5',
        variant === 'dark' ? SCROLLBAR_DARK : SCROLLBAR_LIGHT,
      )}>
        {sections.map((sec, si) => (
          <div key={si} className={si > 0 ? 'pt-3' : ''}>
            {sec.label && !collapsed && (
              <div className={cn(
                'px-3 pb-1 text-[10px] font-semibold tracking-widest',
                theme.sectionLabel,
              )}>
                {sec.label}
              </div>
            )}
            {si > 0 && collapsed && (
              <div className={cn('mx-3 mb-2 border-t', theme.divider)} />
            )}
            {sec.items.map(item => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                activeSubId={activeId}
                collapsed={collapsed}
                theme={theme}
                activeStyle={activeStyle}
                accentColor={accentColor}
                renderLink={renderLink}
                onItemClick={(id) => onItemClick?.(id)}
              />
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <UserProfile
          user={user}
          collapsed={collapsed}
          theme={theme}
          accentColor={accentColor}
          onUserClick={onUserClick}
        />
      )}
    </aside>
  )
}
