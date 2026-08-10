import type React from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface NavSubItem {
  id: string
  label: string
  href?: string
  onClick?: () => void
}

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  section?: string
  badge?: string | number
  badgeColor?: string
  href?: string
  onClick?: () => void
  children?: NavSubItem[]
}

export interface SidebarBrand {
  logo?: ReactNode
  title?: string
  subtitle?: string
}

export interface SidebarUser {
  name: string
  email?: string
  avatar?: string
}

export type ActiveStyle = 'pill' | 'bar' | 'filled' | 'ghost' | 'glow'
export type SidebarVariant = 'light' | 'dark'

export interface SidebarTheme {
  bg: string
  border: string
  text: string
  textMuted: string
  hover: string
  sectionLabel: string
  divider: string
  iconBg: string
}

export type LinkRenderer = (props: {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) => React.ReactNode

export interface AppSidebarProps {
  items: NavItem[]
  activeId?: string
  onItemClick?: (id: string) => void
  brand?: SidebarBrand
  user?: SidebarUser
  onUserClick?: () => void
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapseChange?: (v: boolean) => void
  width?: number
  collapsedWidth?: number
  activeStyle?: ActiveStyle
  accentColor?: string
  variant?: SidebarVariant
  renderLink?: LinkRenderer
  className?: string
}
