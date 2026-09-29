import React from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';

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
  const { user } = useAuthStore();
  const customerProfile = user?.customerProfile;

  const displayName = name || (
    customerProfile?.firstName
      ? `${customerProfile.firstName} ${customerProfile.lastName || ''}`.trim()
      : user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user?.email?.split('@')[0] || 'User'
  );

  const displayEmail = email || customerProfile?.email || user?.email || user?.mobile || '';

  return (
    <div className={`flex items-center gap-2.5 px-2 py-1 select-none ${className}`}>
      <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-2 ring-emerald-500/20 shadow-2xs">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayEmail || 'user'}`} 
          alt={displayName} 
          className="w-full h-full object-cover rounded-full" 
        />
      </div>
      <div className="hidden sm:flex flex-col min-w-0 text-left">
        <span className="text-xs font-bold text-black leading-tight truncate">
          {displayName}
        </span>
        <span className="text-[10px] text-black/70 leading-tight truncate max-w-[160px] font-semibold">
          {displayEmail}
        </span>
      </div>
    </div>
  );
};
