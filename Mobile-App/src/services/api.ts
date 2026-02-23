import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    console.log('Using EXPO_PUBLIC_API_URL:', envUrl);
    return envUrl;
  }

  // Try to get host from Expo config (LAN IP auto-detected)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.hostUri;
  if (hostUri && !hostUri.includes('localhost')) {
    const host = hostUri.split(':')[0];
    console.log('Using Expo hostUri:', host);
    return `http://${host}:5000/api`;
  }

  // For Android emulator only (NOT physical devices)
  if (Platform.OS === 'android' && hostUri?.includes('localhost')) {
    console.log('Using Android Emulator fallback: 10.0.2.2');
    return 'http://10.0.2.2:5000/api';
  }

  // Fallback for physical devices
  console.log('Using physical device fallback: 192.168.43.155');
  return 'http://192.168.43.155:5000/api';
};

// Backend API Base URL
const BASE_URL = __DEV__
  ? getDevBaseUrl()
  : 'https://smartsplit-app-cv3e.onrender.com/api';

console.log('🔗 API Base URL:', BASE_URL);

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
      const token = await AsyncStorage.getItem('@auth_token');
      
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
      console.error(`❌ API Error: ${error.config?.url} - Status ${status}`);
      
      // Handle specific error codes
      switch (status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          console.log('Unauthorized - Clearing token');
          await AsyncStorage.removeItem('@auth_token');
          // You can trigger navigation to login screen here via navigation ref
          break;
          
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
    
    logout: () =>
      api.post('/auth/logout'),
  },

  // User endpoints
  user: {
    getMe: () =>
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
    
    delete: (notificationId: string) =>
      api.delete(`/notifications/${notificationId}`),
  },

  // Profile endpoints
  profile: {
    getStats: () =>
      api.get('/profile/stats'),
    
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
};

// Helper function to store auth token
export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('@auth_token', token);
    console.log('✅ Auth token stored');
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

// Helper function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to clear auth token
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('@auth_token');
    console.log('✅ Auth token cleared');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

export default api;
