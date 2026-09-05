import { apiClient } from './client';
import { Banner, StoreSettings } from '../types';

export const publicApi = {
  getBanners: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get('/customer/public/banners');
    return data.data;
  },

  getStoreConfig: async (): Promise<StoreSettings> => {
    const { data } = await apiClient.get('/customer/public/config');
    return data.data;
  },
};
