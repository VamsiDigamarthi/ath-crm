import React from 'react';
import { CustomerBillingInvoices } from '../components/CustomerBillingInvoices';

export const CustomerBillingScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <CustomerBillingInvoices />
    </div>
  );
};
