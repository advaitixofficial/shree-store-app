import { apiClient } from './client';
import { User } from '../types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOtpResponse {
  isNewUser?: boolean;
  registrationToken?: string;
  tokenPair?: TokenPair;
  user?: User;
}

export const authApi = {
  sendOtp: async (phone: string): Promise<string> => {
    const { data } = await apiClient.post('/customer/auth/send-otp', { phone });
    return data.message;
  },

  verifyOtp: async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    const { data } = await apiClient.post('/customer/auth/verify-otp', { phone, otp });
    return data.data; // contains isNewUser OR { tokenPair, user }
  },

  register: async (payload: {
    firstName: string;
    lastName: string;
    registrationToken: string;
    email?: string;
    preferredLanguage?: 'en' | 'hi';
  }): Promise<{ tokenPair: TokenPair; user: User }> => {
    const { data } = await apiClient.post('/customer/auth/register', payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/customer/auth/logout');
  },
};
