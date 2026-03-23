import api from './api';
import { Group } from '@/src/types/group.types';

export type CreateGroupPayload = Record<string, any>;
export type UpdateGroupPayload = Record<string, any>;

const unwrapData = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export const createGroup = async (data: CreateGroupPayload): Promise<Group> => {
  const response = await api.post('/groups', data);
  return unwrapData<Group>(response.data);
};

export const getGroups = async (): Promise<Group[]> => {
  const response = await api.get('/groups');
  const groups = unwrapData<Group[] | undefined>(response.data);
  return Array.isArray(groups) ? groups : [];
};

export const getGroupById = async (id: string): Promise<Group> => {
  const response = await api.get(`/groups/${id}`);
  return unwrapData<Group>(response.data);
};

export const updateGroup = async (id: string, data: UpdateGroupPayload): Promise<Group> => {
  const response = await api.put(`/groups/${id}`, data);
  return unwrapData<Group>(response.data);
};

export const deleteGroup = async (id: string): Promise<{ deletedExpenses?: number; deletedSettlements?: number } | null> => {
  const response = await api.delete(`/groups/${id}`);
  const data = unwrapData<{ deletedExpenses?: number; deletedSettlements?: number } | null>(response.data);
  return data || null;
};

export const addMember = async (groupId: string, userId: string): Promise<Group> => {
  const response = await api.post(`/groups/${groupId}/members`, { userId });
  return unwrapData<Group>(response.data);
};

export const groupsService = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
};

export default groupsService;
