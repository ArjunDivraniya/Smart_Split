import api from './api';

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

export const settlementsService = {
  createSettlement,
  getGroupSettlements,
  getUserSettlements,
};

export default settlementsService;
