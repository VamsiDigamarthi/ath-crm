import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle backend success and error formats
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const backendError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      'Something went wrong';
    return Promise.reject(new Error(backendError));
  }
);

export default apiClient;
