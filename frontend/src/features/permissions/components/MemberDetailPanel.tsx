import React from 'react';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { PermissionSwitch } from './PermissionSwitch';
import type { MemberSummary, PermissionGroup } from '../hooks/usePermissions';
import { ROLE_LABELS } from '../types/permission.types';

interface MemberDetailPanelProps {
  member: MemberSummary;
  groups: PermissionGroup[];
  search: string;
  onSearchChange: (value: string) => void;
  isPending: (key: string, userId: string) => boolean;
  onToggle: (key: string, userId: string, enabled: boolean) => void;
}

export const MemberDetailPanel: React.FC<MemberDetailPanelProps> = ({
  member,
  groups,
  search,
  onSearchChange,
  isPending,
  onToggle,
}) => (
  <div className="bg-white border border-slate-200 rounded-xl flex flex-col min-h-0">
    <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-slate-900 truncate">{member.name}</h3>
        <p className="text-sm text-slate-500 mt-0.5 truncate">
          {member.email} · {ROLE_LABELS[member.role] || member.role}
        </p>
      </div>
      <span className="text-sm text-slate-500 shrink-0">
        {member.enabledCount} of {member.availableCount} enabled
      </span>
    </div>

    <div className="px-5 py-3 border-b border-slate-100">
      <div className="w-full sm:w-64">
        <AppSearchInput value={search} onChange={onSearchChange} placeholder="Search permissions..." debounceMs={150} />
      </div>
    </div>

    <div className="overflow-y-auto max-h-[460px]">
      {groups.length === 0 && <div className="px-5 py-6 text-sm text-slate-400 text-center">No permissions match your search</div>}
      {groups.map((group) => (
        <div key={group.module}>
          <div className="px-5 pt-3 pb-1 text-xs font-medium text-slate-400">{group.module}</div>
          <ul className="divide-y divide-slate-100">
            {group.items.map((p) => {
              const enabled = p.users.find((u) => u.id === member.id)?.enabled || false;
              return (
                <li key={p.key} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">{p.label}</div>
                    <div className="text-xs text-slate-500">{p.description}</div>
                  </div>
                  <PermissionSwitch
                    checked={enabled}
                    disabled={isPending(p.key, member.id)}
                    onChange={(v) => onToggle(p.key, member.id, v)}
                    label={`${p.label} for ${member.name}`}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  </div>
);
