import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '@/src/constants/categories';

const getDevBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    console.log('✅ Base URL from ENV:', envUrl);
    return envUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.hostUri;
  console.log('🔍 Detected hostUri:', hostUri);

  // If using local web or a direct localhost connection
  if (Platform.OS === 'web' || hostUri?.includes('localhost') || hostUri?.includes('127.0.0.1')) {
    return 'http://localhost:5000/api';
  }

  // If on Android Physical/Emulator
  if (Platform.OS === 'android') {
    if (hostUri && !hostUri.includes('localhost')) {
      const host = hostUri.split(':')[0];
      return `http://${host}:5000/api`;
    }
    // Fallback for Android emulator
    return 'http://10.0.2.2:5000/api';
  }

  // Physical iOS/Android on LAN
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000/api`;
  }

  // Production fallback
  return 'http://localhost:5000/api';
};

// Base URL for API calls
// Using Render backend URL exclusively as requested
const BASE_URL = 'https://smart-split-oomn.onrender.com/api';

console.log('🚀 API Base URL:', BASE_URL);

const AUTH_TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
const REFRESH_TOKEN_KEY = '@refresh_token';

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Auto-attach JWT token to every request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (token && config.headers) {
        // Attach token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const requestUrl = originalRequest?.url || '';
      const isRefreshRequest = requestUrl.includes('/auth/refresh');

      console.error(`❌ API Error: ${requestUrl} - Status ${status}`);

      if (status === 401 && !isRefreshRequest && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(
              `${BASE_URL}/auth/refresh`,
              { refreshToken },
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
              }
            );

            const newAccessToken = refreshResponse?.data?.token;
            const newRefreshToken = refreshResponse?.data?.refreshToken;

            if (newAccessToken) {
              await AsyncStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
              if (newRefreshToken) {
                await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
              }

              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, STORAGE_KEYS.USER_DATA]);
        console.log('Unauthorized - session cleared after refresh failure');
      }

      // Handle specific error codes
      switch (status) {
        case 403:
          console.error('Forbidden - Access denied');
          break;

        case 404:
          console.error('Not found');
          break;

        case 500:
          console.error('Server error');
          break;

        default:
          console.error('API error:', data);
      }
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API Service Methods
export const apiService = {
  // Auth endpoints
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      api.post('/auth/register', data),
    
    login: (data: { email: string; password: string }) =>
      api.post('/auth/login', data),
    
    googleLogin: (data: { email: string; name: string; googleId: string; profileImage?: string }) =>
      api.post('/auth/google-login', data),

    refresh: (refreshToken: string) =>
      api.post('/auth/refresh', { refreshToken }),
    
    logout: () =>
      api.post('/auth/logout'),
  },

  // User endpoints
  user: {
    getMe: () =>
      api.get('/user/me'),

    getProfile: () =>
      api.get('/user/me'),
    
    updateProfile: (data: any) =>
      api.put('/user/update', data),
    
    searchUsers: (query: string) =>
      api.get(`/user/search?q=${query}`),
    
    uploadProfileImage: (formData: FormData) =>
      api.post('/user/upload-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  },

  // Trip endpoints
  trips: {
    getAll: () =>
      api.get('/trips/user'),
    
    getById: (tripId: string) =>
      api.get(`/trips/${tripId}`),
    
    create: (data: any) =>
      api.post('/trips/create', data),
    
    addMember: (tripId: string, userId: string) =>
      api.post(`/trips/${tripId}/add-member`, { userId }),
    
    endTrip: (tripId: string) =>
      api.post(`/trips/${tripId}/end`),
    
    getSettlements: (tripId: string) =>
      api.get(`/trips/${tripId}/settlements`),
    
    getItinerary: (tripId: string) =>
      api.get(`/trips/${tripId}/itinerary`),
    
    addActivity: (tripId: string, data: any) =>
      api.post(`/trips/${tripId}/itinerary`, data),
    
    getPackingList: (tripId: string) =>
      api.get(`/trips/${tripId}/packing`),
  },

  // Expense endpoints
  expenses: {
    create: (data: any) =>
      api.post('/expenses/add', data),
    
    update: (expenseId: string, data: any) =>
      api.put(`/expenses/${expenseId}`, data),
    
    delete: (expenseId: string) =>
      api.delete(`/expenses/${expenseId}`),
  },

  // Analytics endpoints
  analytics: {
    getTripAnalytics: (tripId: string) =>
      api.get(`/analytics/trip/${tripId}`),
    
    getRecentActivity: () =>
      api.get('/analytics/recent-activity'),
    
    getDashboardInsights: () =>
      api.get('/analytics/insights'),
    
    getDashboardSummary: () =>
      api.get('/analytics/dashboard'),
  },

  // Notification endpoints
  notifications: {
    getAll: () =>
      api.get('/notifications'),
    
    markAsRead: (notificationId: string) =>
      api.put(`/notifications/${notificationId}/read`),
    
    markAllAsRead: () =>
      api.put('/notifications/read-all'),
    
    clearAll: () =>
      api.delete('/notifications/clear'),
    
    delete: (notificationId: string) =>
      api.delete(`/notifications/${notificationId}`),
  },

  // Profile endpoints
  profile: {
    getProfile: () =>
      api.get('/profile'),
    
    getStats: () =>
      api.get('/profile/stats'),
    
    updateProfile: (data: any) =>
      api.put('/profile', data),
    
    updatePreferences: (data: any) =>
      api.put('/profile/preferences', data),
    
    updateBudgetGoals: (data: { monthlyIncome?: number; monthlyBudget?: number; savingsGoal?: number }) =>
      api.put('/profile/budget-goals', data),
    
    updatePaymentPreferences: (data: { paymentPreferences: any }) =>
      api.put('/profile/payment-preferences', data),
    
    updateCategories: (expenseCategories: any) =>
      api.put('/profile/categories', { expenseCategories }),
    
    updatePrivacySettings: (privacySettings: any) =>
      api.put('/profile/privacy', { privacySettings }),
    
    updateSecuritySettings: (securitySettings: any) =>
      api.put('/profile/security', securitySettings),
    
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.put('/profile/change-password', data),
    
    exportData: () =>
      api.get('/profile/export'),
    
    resetSavings: () =>
      api.post('/profile/reset-savings'),
  },

  // Group endpoints
  groups: {
    getAll: () =>
      api.get('/groups'),
    
    getById: (groupId: string) =>
      api.get(`/groups/${groupId}`),
    
    create: (data: any) =>
      api.post('/groups', data),
    
    update: (groupId: string, data: any) =>
      api.put(`/groups/${groupId}`, data),
    
    delete: (groupId: string) =>
      api.delete(`/groups/${groupId}`),

    removeMember: (groupId: string, memberId: string) =>
      api.delete(`/groups/${groupId}/members/${memberId}`),
    
    addExpense: (groupId: string, data: any) =>
      api.post(`/groups/${groupId}/expenses`, data),
    
    removeExpense: (groupId: string, expenseId: string) =>
      api.delete(`/groups/${groupId}/expenses/${expenseId}`),
    
    getTimeline: (groupId: string) =>
      api.get(`/groups/${groupId}/timeline`),
    
    getSettlements: (groupId: string) =>
      api.get(`/groups/${groupId}/settlements`),
    
    recordSettlement: (groupId: string, data: { fromUserId: string; toUserId: string; amount: number; note?: string }) =>
      api.post(`/groups/${groupId}/settlements`, data),
    
    getSummary: (groupId: string) =>
      api.get(`/groups/${groupId}/summary`),
  },

  // Settlement endpoints (cross-group)
  settlements: {
    getGroupHistory: (groupId: string) =>
      api.get(`/settlements/group/${groupId}`),
    
    getUserSettlements: () =>
      api.get(`/settlements/user`),
  },

  // Expense endpoints (group-specific)
  groupExpenses: {
    getAll: (groupId: string, params?: { paid?: string; category?: string; search?: string; sortBy?: string; sortOrder?: string }) =>
      api.get(`/expenses/group/${groupId}`, { params }),
    
    getBalances: (groupId: string) =>
      api.get(`/expenses/group/${groupId}/balances`),
  },
};

// Helper function to store auth token
export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    console.log('✅ Auth token stored');
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

export const setRefreshToken = async (refreshToken: string) => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('✅ Refresh token stored');
  } catch (error) {
    console.error('Error storing refresh token:', error);
  }
};

// Helper function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return refreshToken;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

// Helper function to clear auth token
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    console.log('✅ Auth tokens cleared');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

export default api;
