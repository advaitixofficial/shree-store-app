import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================================
// Secure Storage Keys
// ============================================================
export const SECURE_KEYS = {
  ACCESS_TOKEN: 'shree_access_token',
  REFRESH_TOKEN: 'shree_refresh_token',
};

// ============================================================
// Axios Configuration
// ============================================================
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds default timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// A separate client for refreshing token to avoid interceptor loops
const tokenClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// Global Auth Callbacks
// ============================================================
let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (cb: () => void) => {
  logoutCallback = cb;
};

// ============================================================
// Request Interceptor
// ============================================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Ignore secure store errors during request prep
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor (Handling 401 & Refresh)
// ============================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle Network Errors / Timeouts
    if (!error.response) {
      const message = error.code === 'ECONNABORTED' 
        ? 'The request took too long. Please try again.'
        : 'Unable to connect to the server. Please check your internet connection and try again.';
      return Promise.reject(new Error(message));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await tokenClient.post('/customer/auth/refresh', {
          refreshToken,
        });

        if (data.success && data.data) {
          const newAccessToken = data.data.accessToken;
          const newRefreshToken = data.data.refreshToken;

          await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, newAccessToken);
          await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, newRefreshToken);

          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        
        // Clear tokens and trigger logout callback
        await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
        
        if (logoutCallback) {
          logoutCallback();
        }

        return Promise.reject(new Error('Session expired. Please login again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // Parse backend error messages if available
    const responseData = error.response.data as any;
    if (responseData && responseData.message) {
      return Promise.reject(new Error(responseData.message));
    }

    return Promise.reject(error);
  }
);
