import React from 'react';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { PermissionSwitch } from './PermissionSwitch';
import type { PermissionItem, PermissionUser } from '../types/permission.types';
import { ROLE_LABELS } from '../types/permission.types';

interface PermissionDetailPanelProps {
  permission: PermissionItem;
  users: PermissionUser[];
  search: string;
  onSearchChange: (value: string) => void;
  isPending: (key: string, userId: string) => boolean;
  onToggle: (key: string, userId: string, enabled: boolean) => void;
  onSetAll: (enabled: boolean) => void;
}

export const PermissionDetailPanel: React.FC<PermissionDetailPanelProps> = ({
  permission,
  users,
  search,
  onSearchChange,
  isPending,
  onToggle,
  onSetAll,
}) => {
  const roles = permission.roles.map((r) => ROLE_LABELS[r] || r).join(', ');
  const allOn = users.length > 0 && users.every((u) => u.enabled);
  const allOff = users.every((u) => !u.enabled);

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col min-h-0">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">{permission.label}</h3>
            <p className="text-sm text-slate-500 mt-1">{permission.description}</p>
            <p className="text-xs text-slate-400 mt-2">
              {permission.module} · Available to {roles}
            </p>
          </div>
          <span className="text-sm text-slate-500 shrink-0">
            {permission.enabledCount} of {permission.users.length} enabled
          </span>
        </div>
      </div>

      {permission.users.length === 0 ? (
        <div className="px-5 py-10 text-sm text-slate-400 text-center">No active {roles} members yet.</div>
      ) : (
        <>
          <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="w-full sm:w-64">
              <AppSearchInput value={search} onChange={onSearchChange} placeholder="Search members..." debounceMs={150} />
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Button variant="outline" size="sm" disabled={allOff} onClick={() => onSetAll(false)} className="cursor-pointer">
                Disable all
              </Button>
              <Button
                size="sm"
                disabled={allOn}
                onClick={() => onSetAll(true)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer"
              >
                Enable all
              </Button>
            </div>
          </div>

          <ul className="divide-y divide-slate-100 overflow-y-auto max-h-[460px]">
            {users.length === 0 && <li className="px-5 py-6 text-sm text-slate-400 text-center">No members match your search</li>}
            {users.map((user) => (
              <li key={user.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {user.email} · {ROLE_LABELS[user.role] || user.role}
                  </div>
                </div>
                <PermissionSwitch
                  checked={user.enabled}
                  disabled={isPending(permission.key, user.id)}
                  onChange={(v) => onToggle(permission.key, user.id, v)}
                  label={`${permission.label} for ${user.name}`}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
