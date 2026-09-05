import { apiClient } from './client';
import { Category, Product } from '../types';

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get('/customer/catalog/categories');
    return data.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get(`/customer/catalog/categories/${id}`);
    return data.data;
  },

  getProducts: async (params?: { category?: string; search?: string; isFeatured?: boolean; page?: number; limit?: number }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> => {
    // Map 'search' to 'q' to match backend API's expected query parameter name
    const apiParams: Record<string, any> = { ...params };
    if (apiParams.search) {
      apiParams.q = apiParams.search;
      delete apiParams.search;
    }
    const { data } = await apiClient.get('/customer/catalog/products', { params: apiParams });
    // Backend uses sendPaginated: { success, data: Product[], pagination: { page, limit, total, totalPages } }
    return {
      products: data.data ?? [],
      total: data.pagination?.total ?? 0,
      page: data.pagination?.page ?? 1,
      totalPages: data.pagination?.totalPages ?? 1,
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(`/customer/catalog/products/${id}`);
    return data.data;
  },
};
