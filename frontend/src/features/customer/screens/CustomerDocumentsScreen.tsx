import React from 'react';
import { CustomerDocumentVault } from '../components/CustomerDocumentVault';

export const CustomerDocumentsScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <CustomerDocumentVault />
    </div>
  );
};
