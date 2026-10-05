import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { AppTabs } from '@/shared/components/AppTabs';
import { usePermissions, type PermissionViewMode } from '../hooks/usePermissions';
import { PermissionSidebarList } from '../components/PermissionSidebarList';
import { PermissionDetailPanel } from '../components/PermissionDetailPanel';
import { MemberDetailPanel } from '../components/MemberDetailPanel';
import { useEditAccessRequests } from '@/features/edit-access/hooks/useEditAccessRequests';
import { EditAccessRequestsPanel } from '@/features/edit-access/components/EditAccessRequestsPanel';
import {
  ApproveEditAccessModal,
  RejectEditAccessModal,
} from '@/features/edit-access/components/EditAccessDecisionModals';

export const AdminPermissionsScreen: React.FC = () => {
  const {
    isLoading,
    viewMode,
    changeViewMode,
    listSearch,
    setListSearch,
    detailSearch,
    setDetailSearch,
    groupedPermissions,
    filteredMembers,
    totalPermissions,
    totalMembers,
    selectedPermission,
    selectedPermissionUsers,
    selectedMember,
    selectedMemberPermissions,
    selectPermission,
    selectMember,
    isPending,
    toggleUser,
    setAllForSelected,
  } = usePermissions();

  const access = useEditAccessRequests(viewMode === 'REQUESTS');

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Permissions</h2>
        <p className="text-sm text-slate-500 mt-1">Turn features on or off for individual team members.</p>
      </div>

      <AppTabs
        tabs={[
          { id: 'PERMISSION', label: 'By permission', count: totalPermissions },
          { id: 'MEMBER', label: 'By member', count: totalMembers },
          { id: 'REQUESTS', label: 'Edit requests', count: access.pendingCount || undefined },
        ]}
        activeTab={viewMode}
        onChange={(id) => changeViewMode(id as PermissionViewMode)}
        size="sm"
      />

      {viewMode === 'REQUESTS' ? (
        <>
          <EditAccessRequestsPanel
            isLoading={access.isLoading}
            filter={access.filter}
            onFilterChange={access.setFilter}
            pendingCount={access.pendingCount}
            requests={access.visibleRequests}
            busyId={access.busyId}
            onApprove={access.openApprove}
            onReject={access.openReject}
            onRevoke={access.revoke}
          />
          <ApproveEditAccessModal
            request={access.approving}
            onClose={access.closeApprove}
            preset={access.preset}
            onPresetChange={access.setPreset}
            customDate={access.customDate}
            onCustomDateChange={access.setCustomDate}
            customTime={access.customTime}
            onCustomTimeChange={access.setCustomTime}
            note={access.approveNote}
            onNoteChange={access.setApproveNote}
            error={access.approveError}
            accessUntilPreview={access.accessUntilPreview}
            isSaving={Boolean(access.approving && access.busyId === access.approving.id)}
            onConfirm={access.confirmApprove}
          />
          <RejectEditAccessModal
            request={access.rejecting}
            onClose={access.closeReject}
            note={access.rejectNote}
            onNoteChange={access.setRejectNote}
            isSaving={Boolean(access.rejecting && access.busyId === access.rejecting.id)}
            onConfirm={access.confirmReject}
          />
        </>
      ) : isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 animate-pulse">
          <div className="h-72 bg-white border border-slate-200 rounded-xl" />
          <div className="h-72 bg-white border border-slate-200 rounded-xl" />
        </div>
      ) : totalPermissions === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl">
          <AppEmptyState icon={ShieldCheck} title="No permissions" description="No configurable permissions yet." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
          <PermissionSidebarList
            viewMode={viewMode}
            search={listSearch}
            onSearchChange={setListSearch}
            groups={groupedPermissions}
            members={filteredMembers}
            selectedKey={selectedPermission?.key || null}
            selectedUserId={selectedMember?.id || null}
            onSelectPermission={selectPermission}
            onSelectMember={selectMember}
          />

          {viewMode === 'PERMISSION' && selectedPermission && (
            <PermissionDetailPanel
              permission={selectedPermission}
              users={selectedPermissionUsers}
              search={detailSearch}
              onSearchChange={setDetailSearch}
              isPending={isPending}
              onToggle={toggleUser}
              onSetAll={setAllForSelected}
            />
          )}

          {viewMode === 'MEMBER' &&
            (selectedMember ? (
              <MemberDetailPanel
                member={selectedMember}
                groups={selectedMemberPermissions}
                search={detailSearch}
                onSearchChange={setDetailSearch}
                isPending={isPending}
                onToggle={toggleUser}
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-sm text-slate-400 text-center">
                No team members have configurable permissions yet.
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
