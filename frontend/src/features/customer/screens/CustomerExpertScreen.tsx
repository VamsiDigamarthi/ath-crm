import React from 'react';
import { CustomerExpertContact } from '../components/CustomerExpertContact';

export const CustomerExpertScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <CustomerExpertContact />
    </div>
  );
};
