import { apiClient } from './client';
import { User } from '../types';

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get('/customer/user/me');
    return data.data;
  },

  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put('/customer/user/me', payload);
    return data.data;
  },

  uploadImage: async (formData: FormData): Promise<User> => {
    // Need a longer timeout for uploads
    const { data } = await apiClient.post('/customer/user/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    return data.data;
  },
};
