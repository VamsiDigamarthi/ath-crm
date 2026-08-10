import React, { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem as NavItemType, NavSubItem, SidebarTheme, ActiveStyle, LinkRenderer } from './types'

interface Props {
  item: NavItemType
  isActive: boolean
  activeSubId?: string
  collapsed: boolean
  theme: SidebarTheme
  activeStyle: ActiveStyle
  accentColor: string
  renderLink?: LinkRenderer
  onItemClick: (id: string) => void
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241'
}

export function NavItem({ item, isActive, activeSubId, collapsed, theme, activeStyle, accentColor, renderLink, onItemClick }: Props) {
  const [expanded, setExpanded]   = useState(false)
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef                = useRef<HTMLButtonElement>(null)
  const closeTimer                = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasChildren               = !!(item.children && item.children.length > 0)

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setFlyoutPos(null), 250)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const activeRgb = hexToRgb(accentColor)

  const activeClasses: Record<ActiveStyle, string> = {
    pill:   'rounded-xl',
    bar:    'rounded-r-xl border-l-[3px]',
    filled: 'rounded-xl',
    ghost:  'rounded-xl',
    glow:   'rounded-xl',
  }

  const activeStyleMap: Record<ActiveStyle, React.CSSProperties> = {
    pill:   { backgroundColor: `rgba(${activeRgb}, 0.11)`, color: accentColor },
    bar:    { backgroundColor: `rgba(${activeRgb}, 0.07)`, color: accentColor, borderLeftColor: accentColor },
    filled: { backgroundColor: accentColor, color: '#ffffff' },
    ghost:  { color: accentColor },
    glow:   { backgroundColor: `rgba(${activeRgb}, 0.13)`, color: accentColor, boxShadow: `0 0 0 1px rgba(${activeRgb},0.25), 0 4px 14px rgba(${activeRgb},0.22)` },
  }

  const itemStyle = isActive ? activeStyleMap[activeStyle] : {}

  const itemClassName = cn(
    'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer',
    activeStyle === 'bar' ? 'pl-3 border-l-[3px] border-transparent' : '',
    isActive ? activeClasses[activeStyle] : cn('border-transparent', theme.hover, theme.text),
    collapsed ? 'justify-center px-0' : '',
  )

  function handleClick() {
    if (hasChildren && !collapsed) setExpanded(v => !v)
    item.onClick?.()
    onItemClick(item.id)
  }

  function handleMouseEnter() {
    cancelClose()
    if (!collapsed || !hasChildren) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) setFlyoutPos({ top: rect.top, left: rect.right + 6 })
  }

  const itemInner = (
    <>
      <item.icon
        size={18}
        className={cn('shrink-0', isActive ? '' : theme.text)}
        style={isActive ? { color: activeStyle === 'filled' ? '#fff' : accentColor } : undefined}
      />
      {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
      {!collapsed && item.badge != null && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
          style={{ backgroundColor: item.badgeColor ?? accentColor }}
        >
          {item.badge}
        </span>
      )}
      {!collapsed && hasChildren && (
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', expanded ? 'rotate-180' : '', theme.textMuted)}
        />
      )}
    </>
  )

  // Render as link when href provided + no children (links don't expand accordions)
  const useLink = !!item.href && !hasChildren

  function renderTrigger() {
    if (useLink && renderLink) {
      return renderLink({
        href: item.href!,
        className: itemClassName,
        style: isActive ? itemStyle : undefined,
        onClick: () => { item.onClick?.(); onItemClick(item.id) },
        children: itemInner,
      }) as React.ReactElement
    }
    if (useLink) {
      return (
        <a
          href={item.href}
          onClick={() => { item.onClick?.(); onItemClick(item.id) }}
          className={itemClassName}
          style={isActive ? itemStyle : undefined}
        >
          {itemInner}
        </a>
      )
    }
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={scheduleClose}
        title={collapsed && !hasChildren ? item.label : undefined}
        className={itemClassName}
        style={isActive ? itemStyle : undefined}
      >
        {itemInner}
      </button>
    )
  }

  // Sub-item renderer (shared between accordion + flyout)
  function renderSubItem(sub: NavSubItem, closeFlyout?: () => void) {
    const subActive = sub.id === activeSubId
    const subClass = 'w-full flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors'
    const subStyle: React.CSSProperties = subActive ? { color: accentColor } : { color: '#374151' }
    const subContent = (
      <>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: subActive ? accentColor : '#d1d5db' }} />
        {sub.label}
      </>
    )
    const subClick = () => { sub.onClick?.(); onItemClick(sub.id); closeFlyout?.() }

    if (sub.href && renderLink) {
      return renderLink({ href: sub.href, className: subClass, style: subStyle, onClick: subClick, children: subContent }) as React.ReactElement
    }
    if (sub.href) {
      return <a key={sub.id} href={sub.href} onClick={subClick} className={subClass} style={subStyle}>{subContent}</a>
    }
    return (
      <button key={sub.id} type="button" onClick={subClick} className={cn(subClass, 'hover:bg-gray-50')} style={subStyle}>
        {subContent}
      </button>
    )
  }

  return (
    <div>
      {renderTrigger()}

      {/* Accordion sub-items (expanded, not collapsed) */}
      {hasChildren && !collapsed && (
        <div className={cn('grid transition-all duration-200 overflow-hidden', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
          <div className="min-h-0">
            {item.children!.map((sub: NavSubItem) => {
              const subActive = sub.id === activeSubId
              return (
                <div key={sub.id}>
                  {sub.href && renderLink
                    ? renderLink({ href: sub.href, className: cn('w-full flex items-center gap-2 pl-10 pr-3 py-2 text-sm transition-colors cursor-pointer rounded-xl', subActive ? '' : cn(theme.hover, theme.textMuted)), style: subActive ? { color: accentColor, backgroundColor: `rgba(${activeRgb}, 0.08)` } : undefined, onClick: () => { sub.onClick?.(); onItemClick(sub.id) }, children: <><span className="w-1 h-1 rounded-full bg-current shrink-0 opacity-50" />{sub.label}</> }) as React.ReactElement
                    : sub.href
                    ? <a href={sub.href} onClick={() => { sub.onClick?.(); onItemClick(sub.id) }} className={cn('w-full flex items-center gap-2 pl-10 pr-3 py-2 text-sm transition-colors cursor-pointer rounded-xl', subActive ? '' : cn(theme.hover, theme.textMuted))} style={subActive ? { color: accentColor, backgroundColor: `rgba(${activeRgb}, 0.08)` } : undefined}><span className="w-1 h-1 rounded-full bg-current shrink-0 opacity-50" />{sub.label}</a>
                    : <button type="button" onClick={() => { sub.onClick?.(); onItemClick(sub.id) }} className={cn('w-full flex items-center gap-2 pl-10 pr-3 py-2 text-sm transition-colors cursor-pointer rounded-xl', subActive ? '' : cn(theme.hover, theme.textMuted))} style={subActive ? { color: accentColor, backgroundColor: `rgba(${activeRgb}, 0.08)` } : undefined}><span className="w-1 h-1 rounded-full bg-current shrink-0 opacity-50" />{sub.label}</button>
                  }
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Flyout popover when collapsed + has children */}
      {collapsed && hasChildren && flyoutPos && createPortal(
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{ position: 'fixed', top: flyoutPos.top, left: flyoutPos.left, zIndex: 9999, minWidth: 176 }}
          className="bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 overflow-hidden"
        >
          <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100 mb-1">
            <item.icon size={14} className="text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-500">{item.label}</span>
          </div>
          {item.children!.map((sub: NavSubItem) => renderSubItem(sub, () => setFlyoutPos(null)))}
        </div>,
        document.body,
      )}
    </div>
  )
}
