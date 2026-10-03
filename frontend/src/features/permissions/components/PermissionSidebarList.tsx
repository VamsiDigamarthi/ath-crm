import React from 'react';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import type { PermissionGroup, MemberSummary, PermissionViewMode } from '../hooks/usePermissions';
import { ROLE_LABELS } from '../types/permission.types';

interface PermissionSidebarListProps {
  viewMode: PermissionViewMode;
  search: string;
  onSearchChange: (value: string) => void;
  groups: PermissionGroup[];
  members: MemberSummary[];
  selectedKey: string | null;
  selectedUserId: string | null;
  onSelectPermission: (key: string) => void;
  onSelectMember: (userId: string) => void;
}

const rowClass = (active: boolean) =>
  `w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors cursor-pointer ${
    active ? 'bg-emerald-50 text-[#15803D]' : 'hover:bg-slate-50 text-slate-800'
  }`;

export const PermissionSidebarList: React.FC<PermissionSidebarListProps> = ({
  viewMode,
  search,
  onSearchChange,
  groups,
  members,
  selectedKey,
  selectedUserId,
  onSelectPermission,
  onSelectMember,
}) => {
  const isEmpty = viewMode === 'PERMISSION' ? groups.length === 0 : members.length === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col min-h-0">
      <div className="p-3 border-b border-slate-100">
        <AppSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={viewMode === 'PERMISSION' ? 'Search permissions...' : 'Search members...'}
          debounceMs={150}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 max-h-[560px]">
        {isEmpty && <div className="px-3 py-6 text-sm text-slate-400 text-center">Nothing found</div>}

        {viewMode === 'PERMISSION' &&
          groups.map((group) => (
            <div key={group.module} className="mb-2 last:mb-0">
              <div className="px-3 pt-2 pb-1 text-xs font-medium text-slate-400">{group.module}</div>
              {group.items.map((p) => (
                <button key={p.key} type="button" onClick={() => onSelectPermission(p.key)} className={rowClass(p.key === selectedKey)}>
                  <span className="text-sm font-medium truncate">{p.label}</span>
                  <span className="text-xs text-slate-500 shrink-0">
                    {p.enabledCount}/{p.users.length}
                  </span>
                </button>
              ))}
            </div>
          ))}

        {viewMode === 'MEMBER' &&
          members.map((m) => (
            <button key={m.id} type="button" onClick={() => onSelectMember(m.id)} className={rowClass(m.id === selectedUserId)}>
              <span className="min-w-0">
                <span className="block text-sm font-medium truncate">{m.name}</span>
                <span className="block text-xs text-slate-500 truncate">{ROLE_LABELS[m.role] || m.role}</span>
              </span>
              <span className="text-xs text-slate-500 shrink-0">
                {m.enabledCount}/{m.availableCount}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};
