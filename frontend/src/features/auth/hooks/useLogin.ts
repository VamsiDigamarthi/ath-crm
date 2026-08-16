import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema, otpSchema, type LoginInput, type OtpInput } from '../validations/auth-schema';
import { useAuthStore } from '../store/auth-store';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verify } = useAuthStore();
  const navigate = useNavigate();

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '' },
  });

  const otpForm = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onLoginSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      await login(data.identifier);
      setIdentifier(data.identifier);
      setIsOtpSent(true);
      toast.success('OTP sent to your email/phone');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpInput) => {
    try {
      setLoading(true);
      await verify(identifier, data.otp);
      toast.success('Login successful!');
      
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (currentUser?.role === 'DOC_MANAGER') {
        navigate('/documenter/manager');
      } else if (currentUser?.role === 'DOC_TEAM_LEAD' || currentUser?.role === 'DOC_AGENT') {
        navigate('/documenter/agent');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsOtpSent(false);
    otpForm.reset();
  };

  return {
    isOtpSent,
    identifier,
    loading,
    loginForm,
    otpForm,
    onLoginSubmit,
    onOtpSubmit,
    handleBackToLogin,
  };
};
