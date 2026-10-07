import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type AssignedOrgRole } from '@/features/auth/store/auth-store';
import { ChevronDown, Check, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export interface HeaderUserProfileProps {
  name?: string;
  email?: string;
  className?: string;
}

export const HeaderUserProfile: React.FC<HeaderUserProfileProps> = ({
  name,
  email,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user, activeOrgRole, assignedOrgRoles, switchActiveRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const customerProfile = user?.customerProfile;

  const displayName = name || (
    customerProfile?.firstName
      ? `${customerProfile.firstName} ${customerProfile.lastName || ''}`.trim()
      : user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user?.email?.split('@')[0] || 'User'
  );

  const displayEmail = email || customerProfile?.email || user?.email || user?.mobile || '';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = async (role: AssignedOrgRole) => {
    if (role.id === activeOrgRole?.id) {
      setIsOpen(false);
      return;
    }

    try {
      setIsSwitching(true);
      const defaultRoute = await switchActiveRole(role.id);
      toast.success(`Switched role to ${role.name}`);
      setIsOpen(false);
      if (defaultRoute) {
        navigate(defaultRoute);
      }
    } catch {
      toast.error('Failed to switch role');
    } finally {
      setIsSwitching(false);
    }
  };

  const hasMultipleRoles = assignedOrgRoles.length > 1;

  const getDepartmentColor = (dept?: string) => {
    switch (dept) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DOC':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PREP_REVIEW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SALES':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'FILE_OP':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => hasMultipleRoles && setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-2 py-1 rounded-xl transition-all select-none ${
          hasMultipleRoles
            ? 'cursor-pointer hover:bg-slate-100/80 active:bg-slate-200/60'
            : 'cursor-default'
        }`}
        title={hasMultipleRoles ? 'Click to switch active role' : undefined}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-2 ring-emerald-500/20 shadow-2xs">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayEmail || 'user'}`} 
            alt={displayName} 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>

        {/* User Info & Active Role Badge */}
        <div className="hidden sm:flex flex-col min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-900 leading-tight truncate">
              {displayName}
            </span>

            {/* Chevron if multiple roles */}
            {hasMultipleRoles && (
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            )}
          </div>

          <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[160px] font-normal mt-0.5">
            {displayEmail}
          </span>
        </div>
      </button>

      {/* Switcher Dropdown Menu */}
      {isOpen && hasMultipleRoles && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white shadow-xl border border-slate-200 ring-1 ring-black/5 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <p className="text-xs font-bold text-slate-900">Switch Active Role</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select an assigned role to update sidebar items and access.
            </p>
          </div>

          <div className="py-1.5 max-h-72 overflow-y-auto">
            {assignedOrgRoles.map((role) => {
              const isActive = role.id === activeOrgRole?.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  disabled={isSwitching}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{role.name}</span>
                      {role.department && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getDepartmentColor(
                            role.department
                          )}`}
                        >
                          {role.department}
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {role.description}
                      </p>
                    )}
                  </div>

                  {isActive ? (
                    <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 bg-slate-50/60 rounded-b-2xl flex items-center justify-between text-[11px] text-slate-400">
            <span>{assignedOrgRoles.length} roles assigned</span>
            <span className="font-semibold text-slate-500">Auto-routes to dashboard</span>
          </div>
        </div>
      )}
    </div>
  );
};
