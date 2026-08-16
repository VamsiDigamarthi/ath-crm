import React from 'react';
import { CustomerOrganizerWizard } from '../components/CustomerOrganizerWizard';

export const CustomerOrganizerScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <CustomerOrganizerWizard />
    </div>
  );
};
