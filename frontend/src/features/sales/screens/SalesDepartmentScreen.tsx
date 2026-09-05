import React from 'react';
import { Navigate } from 'react-router-dom';

export const SalesDepartmentScreen: React.FC = () => {
  return <Navigate to="/sales/manager/queue" replace />;
};
