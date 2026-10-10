import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Brand } from './sidebar/Brand'
import { NavItem } from './sidebar/NavItem'
import { UserProfile } from './sidebar/UserProfile'
import type { AppSidebarProps, SidebarTheme } from './sidebar/types'

const THEMES: Record<'light' | 'dark', SidebarTheme> = {
  light: {
    bg:           'bg-white',
    border:       'border-slate-200',
    text:         'text-slate-600 font-normal',
    textMuted:    'text-slate-500 font-normal',
    hover:        'hover:bg-slate-100 hover:text-slate-900',
    sectionLabel: 'text-slate-400 font-medium uppercase tracking-wider text-[10px]',
    divider:      'border-slate-200',
    iconBg:       'bg-slate-100',
  },
  dark: {
    bg:           'bg-[#0F172A]',
    border:       'border-slate-800',
    text:         'text-slate-300 font-normal',
    textMuted:    'text-slate-400 font-normal',
    hover:        'hover:bg-slate-800/80 hover:text-white',
    sectionLabel: 'text-slate-400 font-medium uppercase tracking-wider text-[10px]',
    divider:      'border-slate-800/80',
    iconBg:       'bg-slate-800',
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
  showLogoutOnly,
  onLogout,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapseChange,
  width = 240,
  collapsedWidth = 64,
  activeStyle = 'filled',
  accentColor = '#16A34A',
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
  for (const item of items) {
    const sec = item.section ?? ''
    let sectionObj = sections.find((s) => (s.label ?? '') === sec)
    if (!sectionObj) {
      sectionObj = { label: sec || undefined, items: [] }
      sections.push(sectionObj)
    }
    sectionObj.items.push(item)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r transition-all duration-200 relative z-20',
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
                'px-3 pb-1 text-[10px] font-medium tracking-wider',
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

      {(user || showLogoutOnly) && (
        <UserProfile
          user={user}
          collapsed={collapsed}
          theme={theme}
          accentColor={accentColor}
          onUserClick={onUserClick}
          showLogoutOnly={showLogoutOnly}
          onLogout={onLogout}
        />
      )}
    </aside>
  )
}
