import React from 'react';
import { Lock } from 'lucide-react';

export const AuthSecurityFooter: React.FC = () => {
  return (
    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-center text-xs text-gray-400 select-none">
      <Lock className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
      <span>Encrypted 256-bit SSL Connection • Authorized Tax Platform</span>
    </div>
  );
};
