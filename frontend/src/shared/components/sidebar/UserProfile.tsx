import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarUser, SidebarTheme } from './types'

interface Props {
  user: SidebarUser
  collapsed: boolean
  theme: SidebarTheme
  accentColor: string
  onUserClick?: () => void
}

export function UserProfile({ user, collapsed, theme, accentColor, onUserClick }: Props) {
  return (
    <div className={cn('shrink-0 border-t p-3', theme.border)}>
      <button
        type="button"
        onClick={onUserClick}
        className={cn(
          'w-full flex items-center gap-2.5 rounded-xl p-2 transition-colors cursor-pointer',
          theme.hover,
          collapsed ? 'justify-center' : '',
        )}
        title={collapsed ? user.name : undefined}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
          style={{ backgroundColor: accentColor }}
        >
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
            : user.name[0]?.toUpperCase()
          }
        </div>

        {/* Name + email */}
        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <div className={cn('text-sm font-semibold truncate', theme.text)}>{user.name}</div>
            {user.email && (
              <div className={cn('text-[11px] truncate', theme.textMuted)}>{user.email}</div>
            )}
          </div>
        )}

        {/* Log out icon */}
        {!collapsed && (
          <LogOut size={14} className={cn('shrink-0', theme.textMuted)} />
        )}
      </button>
    </div>
  )
}
