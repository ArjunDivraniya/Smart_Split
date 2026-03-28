import api from './api';
import {
  CategoryBreakdownResponse,
  FriendSpendingResponse,
  GroupVsPersonalResponse,
  InsightsResponse,
  MonthlyAnalyticsResponse,
} from '@/src/types/analytics.types';

const unwrapData = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export const getMonthlyData = async (): Promise<MonthlyAnalyticsResponse> => {
  const response = await api.get('/analytics/monthly');
  return unwrapData<MonthlyAnalyticsResponse>(response.data);
};

export const getCategoryBreakdown = async (
  month: number,
  year: number
): Promise<CategoryBreakdownResponse> => {
  const response = await api.get('/analytics/categories', {
    params: { month, year },
  });
  return unwrapData<CategoryBreakdownResponse>(response.data);
};

export const getInsights = async (): Promise<InsightsResponse> => {
  const response = await api.get('/analytics/insights');
  return unwrapData<InsightsResponse>(response.data);
};

export const getGroupVsPersonal = async (): Promise<GroupVsPersonalResponse> => {
  const response = await api.get('/analytics/group-vs-personal');
  return unwrapData<GroupVsPersonalResponse>(response.data);
};

export const getFriendSpending = async (): Promise<FriendSpendingResponse> => {
  const response = await api.get('/analytics/friend-spending');
  return unwrapData<FriendSpendingResponse>(response.data);
};

export const analyticsService = {
  getMonthlyData,
  getCategoryBreakdown,
  getInsights,
  getGroupVsPersonal,
  getFriendSpending,
};

export default analyticsService;
