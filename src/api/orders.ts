import { apiClient } from './client';
import { Order } from '../types';

export const orderApi = {
  getOrders: async (page = 1, limit = 10): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> => {
    const { data } = await apiClient.get('/customer/orders', { params: { page, limit } });
    return {
      orders: data.data ?? [],
      total: data.pagination?.total ?? 0,
      page: data.pagination?.page ?? 1,
      totalPages: data.pagination?.totalPages ?? 1,
    };
  },

  createOrder: async (orderData: Partial<Order>, idempotencyKey: string): Promise<Order> => {
    const { data } = await apiClient.post('/customer/orders', orderData, {
      headers: {
        'x-idempotency-key': idempotencyKey,
      },
    });
    return data.data;
  },

  cancelOrder: async (id: string, reason: string): Promise<Order> => {
    const { data } = await apiClient.post(`/customer/orders/${id}/cancel`, { reason });
    return data.data;
  },

  validateCoupon: async (code: string, subtotal: number): Promise<any> => {
    const { data } = await apiClient.post('/customer/orders/coupons/validate', { code, subtotal });
    return data.data;
  },
};
