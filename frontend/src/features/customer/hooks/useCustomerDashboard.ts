import { useState, useEffect, useCallback } from 'react';
import { customerApi, type CustomerDashboardResponse } from '../services/customer-api';

export const useCustomerDashboard = (taxYear?: string) => {
  const [dashboardData, setDashboardData] = useState<CustomerDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerApi.getDashboard(taxYear);
      if (res.data) {
        setDashboardData(res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load customer dashboard data';
      setError(msg);
      // Fallback silently if offline or initial load
    } finally {
      setLoading(false);
    }
  }, [taxYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboard,
  };
};
