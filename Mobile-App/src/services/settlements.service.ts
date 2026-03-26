import api from './api';
import {
  PendingSettlementsResponse,
  Settlement,
  SettlementStatus,
} from '../types/settlement.types';

export type SettlementPayload = Record<string, any>;

const unwrapData = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export const createSettlement = async <T = any>(data: SettlementPayload): Promise<T> => {
  const response = await api.post('/settlements', data);
  return unwrapData<T>(response.data);
};

export const getGroupSettlements = async <T = any>(groupId: string): Promise<T> => {
  const response = await api.get(`/settlements/group/${groupId}`);
  return unwrapData<T>(response.data);
};

export const getUserSettlements = async <T = any>(): Promise<T> => {
  const response = await api.get('/settlements/user');
  return unwrapData<T>(response.data);
};

export const getPendingSettlements = async (
  filters?: { status?: SettlementStatus; direction?: string; groupId?: string }
): Promise<PendingSettlementsResponse> => {
  const response = await api.get('/settlements/pending', { params: filters });
  return unwrapData<PendingSettlementsResponse>(response.data);
};

export interface SettlementHistoryParams {
  page?: number;
  limit?: number;
  friendId?: string;
  groupId?: string;
  month?: number;
  year?: number;
}

export interface SettlementHistoryResponse {
  settlements: Settlement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export const getSettlementHistory = async (
  params?: SettlementHistoryParams
): Promise<SettlementHistoryResponse> => {
  const response = await api.get('/settlements/history', { params });
  return unwrapData<SettlementHistoryResponse>(response.data);
};

export const createPartialSettlement = async (
  id: string,
  data: { amountPaid: number; method: string; note?: string }
): Promise<Settlement> => {
  const response = await api.put(`/settlements/${id}/partial`, data);
  return unwrapData<Settlement>(response.data);
};

export interface ReminderResponse {
  message: string;
  whatsappUrl: string;
  remindCount: number;
  canRemindAgainAt: string;
}

export const sendReminder = async (settlementId: string): Promise<ReminderResponse> => {
  const response = await api.post('/settlements/remind', { settlementId });
  const payload = response.data;

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as ReminderResponse;
  }

  return {
    message: String(payload?.message || ''),
    whatsappUrl: String(payload?.whatsappUrl || ''),
    remindCount: Number(payload?.remindCount || 0),
    canRemindAgainAt: String(payload?.canRemindAgainAt || ''),
  };
};

export const markAsReceived = async (settlementId: string): Promise<Settlement> => {
  const response = await api.put(`/settlements/${settlementId}/mark-received`);
  return unwrapData<Settlement>(response.data);
};

export const settlementsService = {
  createSettlement,
  getGroupSettlements,
  getUserSettlements,
  getPendingSettlements,
  getSettlementHistory,
  createPartialSettlement,
  sendReminder,
  markAsReceived,
};

export default settlementsService;
