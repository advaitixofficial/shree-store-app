import { apiClient } from './client';
import { Address } from '../types';

export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const { data } = await apiClient.get('/customer/addresses');
    return data.data;
  },

  createAddress: async (addressData: Partial<Address>): Promise<Address> => {
    const { data } = await apiClient.post('/customer/addresses', addressData);
    return data.data;
  },

  updateAddress: async (id: string, addressData: Partial<Address>): Promise<Address> => {
    const { data } = await apiClient.put(`/customer/addresses/${id}`, addressData);
    return data.data;
  },

  setDefault: async (id: string): Promise<Address> => {
    const { data } = await apiClient.put(`/customer/addresses/${id}/default`);
    return data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`/customer/addresses/${id}`);
  },
};
