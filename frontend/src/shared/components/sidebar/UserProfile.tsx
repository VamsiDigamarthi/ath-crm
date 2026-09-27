import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarUser, SidebarTheme } from './types'

interface Props {
  user?: SidebarUser
  collapsed: boolean
  theme: SidebarTheme
  accentColor: string
  onUserClick?: () => void
  showLogoutOnly?: boolean
  onLogout?: () => void
}

export function UserProfile({ user, collapsed, theme, accentColor, onUserClick, showLogoutOnly, onLogout }: Props) {
  if (showLogoutOnly) {
    return (
      <div className={cn('shrink-0 border-t p-2.5', theme.border)}>
        <button
          type="button"
          onClick={onLogout || onUserClick}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-black hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer text-xs font-medium border border-transparent hover:border-red-200',
            collapsed ? 'justify-center px-0 py-2' : '',
          )}
          title="Logout"
        >
          <LogOut size={16} className="shrink-0 text-black group-hover:text-red-600" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    )
  }

  if (!user) return null;

  return (
    <div className={cn('shrink-0 border-t p-3', theme.border)}>
      <button
        type="button"
        onClick={onUserClick}
        className={cn(
          'w-full flex items-center gap-2.5 rounded-md p-2 transition-colors cursor-pointer',
          theme.hover,
          collapsed ? 'justify-center' : '',
        )}
        title={collapsed ? user.name : undefined}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white text-xs font-bold"
          style={{ backgroundColor: accentColor }}
        >
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-md object-cover" />
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
