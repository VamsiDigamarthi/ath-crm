import apiClient from '@/lib/api-client';

export const authService = {
  requestOtp: async (identifier: string) => {
    const isEmail = identifier.includes('@');
    const payload = isEmail ? { email: identifier } : { mobile: identifier };
    return apiClient.post('/auth/request-otp', payload);
  },

  verifyOtp: async (identifier: string, otp: string) => {
    const isEmail = identifier.includes('@');
    const payload = isEmail ? { email: identifier, otp } : { mobile: identifier, otp };
    return apiClient.post('/auth/verify-otp', payload);
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/current-user');
  },
};
