import { apiClient } from './client';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number }) => 
    apiClient.get<ApiResponse>('/customer/notifications', { params }),
    
  markAsRead: (id: string) => 
    apiClient.patch<ApiResponse>(`/customer/notifications/${id}/read`),
    
  markAllAsRead: () => 
    apiClient.patch<ApiResponse>('/customer/notifications/read-all'),
    
  clearAll: () => 
    apiClient.delete<ApiResponse>('/customer/notifications/clear-all'),
};
