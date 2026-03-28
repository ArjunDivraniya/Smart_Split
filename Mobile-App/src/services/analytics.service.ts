import api from './api';
import {
  CategoryBreakdownResponse,
  FriendSpendingResponse,
  GroupVsPersonalResponse,
  InsightsResponse,
  MonthlyAnalyticsResponse,
} from '@/src/types/analytics.types';

const normalizeMonthlyPayload = (payload: any): MonthlyAnalyticsResponse => {
  if (Array.isArray(payload)) {
    return { data: payload };
  }

  if (payload?.success && payload?.data?.data && Array.isArray(payload.data.data)) {
    return { data: payload.data.data };
  }

  if (payload?.success && Array.isArray(payload?.data)) {
    return { data: payload.data };
  }

  if (Array.isArray(payload?.data)) {
    return { data: payload.data };
  }

  return { data: [] };
};

const normalizeCategoryPayload = (payload: any): CategoryBreakdownResponse => {
  if (payload?.success && payload?.data) {
    return {
      grandTotal: Number(payload.data?.grandTotal || 0),
      categories: Array.isArray(payload.data?.categories) ? payload.data.categories : [],
    };
  }

  return {
    grandTotal: Number(payload?.grandTotal || 0),
    categories: Array.isArray(payload?.categories) ? payload.categories : [],
  };
};

const normalizeInsightsPayload = (payload: any): InsightsResponse => {
  const source = payload?.success && payload?.data ? payload.data : payload;

  return {
    insights: Array.isArray(source?.insights) ? source.insights : [],
    thisMonthTotal: Number(source?.thisMonthTotal || source?.totalSpent || 0),
    lastMonthTotal: Number(source?.lastMonthTotal || 0),
    changePercent: Number(source?.changePercent || source?.percentage || 0),
    topCategory: String(source?.topCategory || source?.name || ''),
  };
};

const normalizeGroupVsPersonalPayload = (payload: any): GroupVsPersonalResponse => {
  if (payload?.success && payload?.data) {
    return {
      data: Array.isArray(payload.data?.data) ? payload.data.data : [],
      summary: payload.data?.summary || {
        totalGroup: 0,
        totalPersonal: 0,
        groupPercent: 0,
        personalPercent: 0,
      },
    };
  }

  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    summary: payload?.summary || {
      totalGroup: 0,
      totalPersonal: 0,
      groupPercent: 0,
      personalPercent: 0,
    },
  };
};

const normalizeFriendPayload = (payload: any): FriendSpendingResponse => {
  if (payload?.success && payload?.data) {
    return {
      friends: Array.isArray(payload.data?.friends) ? payload.data.friends : [],
    };
  }

  return {
    friends: Array.isArray(payload?.friends) ? payload.friends : [],
  };
};

export const getMonthlyData = async (): Promise<MonthlyAnalyticsResponse> => {
  const response = await api.get('/analytics/monthly');
  return normalizeMonthlyPayload(response.data);
};

export const getCategoryBreakdown = async (
  month: number,
  year: number
): Promise<CategoryBreakdownResponse> => {
  const response = await api.get('/analytics/categories', {
    params: { month, year },
  });
  return normalizeCategoryPayload(response.data);
};

export const getInsights = async (): Promise<InsightsResponse> => {
  const response = await api.get('/analytics/insights');
  return normalizeInsightsPayload(response.data);
};

export const getGroupVsPersonal = async (): Promise<GroupVsPersonalResponse> => {
  const response = await api.get('/analytics/group-vs-personal');
  return normalizeGroupVsPersonalPayload(response.data);
};

export const getFriendSpending = async (): Promise<FriendSpendingResponse> => {
  const response = await api.get('/analytics/friend-spending');
  return normalizeFriendPayload(response.data);
};

export const analyticsService = {
  getMonthlyData,
  getCategoryBreakdown,
  getInsights,
  getGroupVsPersonal,
  getFriendSpending,
};

export default analyticsService;
