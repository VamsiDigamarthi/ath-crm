import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { permissionService } from '../services/permission-service';
import type { PermissionItem, PermissionUser } from '../types/permission.types';
import { ROLE_LABELS } from '../types/permission.types';

export type PermissionViewMode = 'PERMISSION' | 'MEMBER' | 'REQUESTS';

const initialViewMode = (): PermissionViewMode => {
  const tab = new URLSearchParams(window.location.search).get('tab')?.toUpperCase();
  return tab === 'MEMBER' || tab === 'REQUESTS' ? tab : 'PERMISSION';
};

export interface PermissionGroup {
  module: string;
  items: PermissionItem[];
}

export interface MemberSummary extends Omit<PermissionUser, 'enabled'> {
  enabledCount: number;
  availableCount: number;
}

const matches = (query: string, ...values: (string | null | undefined)[]) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((v) => (v || '').toLowerCase().includes(q));
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const [viewMode, setViewMode] = useState<PermissionViewMode>(initialViewMode);
  const [listSearch, setListSearch] = useState('');
  const [detailSearch, setDetailSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await permissionService.list();
      setPermissions(res.data);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const members: MemberSummary[] = useMemo(() => {
    const map = new Map<string, MemberSummary>();
    permissions.forEach((p) =>
      p.users.forEach((u) => {
        const existing = map.get(u.id);
        if (existing) {
          existing.availableCount += 1;
          existing.enabledCount += u.enabled ? 1 : 0;
        } else {
          map.set(u.id, {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            availableCount: 1,
            enabledCount: u.enabled ? 1 : 0,
          });
        }
      })
    );
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [permissions]);

  const groupedPermissions: PermissionGroup[] = useMemo(() => {
    const filtered = permissions.filter((p) => matches(listSearch, p.label, p.description, p.module));
    const groups = new Map<string, PermissionItem[]>();
    filtered.forEach((p) => groups.set(p.module, [...(groups.get(p.module) || []), p]));
    return Array.from(groups.entries()).map(([module, items]) => ({ module, items }));
  }, [permissions, listSearch]);

  const filteredMembers = useMemo(
    () => members.filter((m) => matches(listSearch, m.name, m.email, ROLE_LABELS[m.role] || m.role)),
    [members, listSearch]
  );

  const activeKey = selectedKey ?? permissions[0]?.key ?? null;
  const activeUserId = selectedUserId ?? members[0]?.id ?? null;
  const selectedPermission = permissions.find((p) => p.key === activeKey) || null;
  const selectedMember = members.find((m) => m.id === activeUserId) || null;

  const selectedPermissionUsers = useMemo(
    () =>
      (selectedPermission?.users || []).filter((u) =>
        matches(detailSearch, u.name, u.email, ROLE_LABELS[u.role] || u.role)
      ),
    [selectedPermission, detailSearch]
  );

  const selectedMemberPermissions: PermissionGroup[] = useMemo(() => {
    if (!activeUserId) return [];
    const groups = new Map<string, PermissionItem[]>();
    permissions
      .filter((p) => p.users.some((u) => u.id === activeUserId))
      .filter((p) => matches(detailSearch, p.label, p.description, p.module))
      .forEach((p) => groups.set(p.module, [...(groups.get(p.module) || []), p]));
    return Array.from(groups.entries()).map(([module, items]) => ({ module, items }));
  }, [permissions, activeUserId, detailSearch]);

  const applyLocal = (key: string, userIds: string[], enabled: boolean) =>
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const ids = new Set(userIds);
        const users = p.users.map((u) => (ids.has(u.id) ? { ...u, enabled } : u));
        return { ...p, users, enabledCount: users.filter((u) => u.enabled).length };
      })
    );

  const markPending = (keys: string[], on: boolean) =>
    setPending((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
      return next;
    });

  const isPending = (key: string, userId: string) => pending.has(`${key}:${userId}`);

  const toggleUser = async (key: string, userId: string, enabled: boolean) => {
    const id = `${key}:${userId}`;
    markPending([id], true);
    applyLocal(key, [userId], enabled);
    try {
      await permissionService.setUserPermission(key, userId, enabled);
    } catch (err) {
      applyLocal(key, [userId], !enabled);
      toast.error((err as Error).message || 'Failed to update permission');
    } finally {
      markPending([id], false);
    }
  };

  const setAllForSelected = async (enabled: boolean) => {
    if (!selectedPermission) return;
    const targets = selectedPermissionUsers.filter((u) => u.enabled !== enabled);
    if (targets.length === 0) return;
    const key = selectedPermission.key;
    const ids = targets.map((u) => u.id);
    const pendingIds = ids.map((uid) => `${key}:${uid}`);
    markPending(pendingIds, true);
    applyLocal(key, ids, enabled);
    try {
      await permissionService.setBulk(key, ids, enabled);
      toast.success(`${enabled ? 'Enabled' : 'Disabled'} for ${ids.length} ${ids.length === 1 ? 'member' : 'members'}`);
    } catch (err) {
      applyLocal(key, ids, !enabled);
      toast.error((err as Error).message || 'Failed to update permissions');
    } finally {
      markPending(pendingIds, false);
    }
  };

  const changeViewMode = (mode: PermissionViewMode) => {
    setViewMode(mode);
    setListSearch('');
    setDetailSearch('');
  };

  const selectPermission = (key: string) => {
    setSelectedKey(key);
    setDetailSearch('');
  };

  const selectMember = (userId: string) => {
    setSelectedUserId(userId);
    setDetailSearch('');
  };

  return {
    isLoading,
    viewMode,
    changeViewMode,
    listSearch,
    setListSearch,
    detailSearch,
    setDetailSearch,
    groupedPermissions,
    filteredMembers,
    totalPermissions: permissions.length,
    totalMembers: members.length,
    selectedPermission,
    selectedPermissionUsers,
    selectedMember,
    selectedMemberPermissions,
    selectPermission,
    selectMember,
    isPending,
    toggleUser,
    setAllForSelected,
  };
};
