import { apiClient } from './client';
import { Cart } from '../types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const { data } = await apiClient.get('/customer/cart');
    return data.data;
  },

  addItem: async (productId: string, variantId: string, quantity: number): Promise<Cart> => {
    const { data } = await apiClient.post('/customer/cart/items', { productId, variantId, quantity });
    return data.data;
  },

  updateItem: async (productId: string, variantId: string, quantity: number): Promise<Cart> => {
    const { data } = await apiClient.put(`/customer/cart/items/${productId}/${variantId}`, { quantity });
    return data.data;
  },

  removeItem: async (productId: string, variantId: string): Promise<Cart> => {
    const { data } = await apiClient.delete(`/customer/cart/items/${productId}/${variantId}`);
    return data.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/customer/cart');
  },

  validateCart: async (): Promise<{ isValid: boolean; messages: string[]; cart: Cart }> => {
    const { data } = await apiClient.post('/customer/cart/validate');
    return data.data;
  },
};
