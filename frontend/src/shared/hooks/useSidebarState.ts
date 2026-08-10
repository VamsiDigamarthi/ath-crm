import { useState } from 'react'
import type { ActiveStyle, SidebarVariant } from '@/shared/components/sidebar/types'

export function useSidebarState() {
  const [activeId, setActiveId]       = useState('dashboard')
  const [collapsed, setCollapsed]     = useState(false) // expanded by default
  const [variant, setVariant]         = useState<SidebarVariant>('light')
  const [activeStyle, setActiveStyle] = useState<ActiveStyle>('pill')
  const [accentColor, setAccentColor] = useState('#6366f1')
  const [showUser, setShowUser]       = useState(true)
  const [showBrand, setShowBrand]     = useState(true)

  return {
    activeId, setActiveId,
    collapsed, setCollapsed,
    variant, setVariant,
    activeStyle, setActiveStyle,
    accentColor, setAccentColor,
    showUser, setShowUser,
    showBrand, setShowBrand,
  }
}

export type SidebarState = ReturnType<typeof useSidebarState>
