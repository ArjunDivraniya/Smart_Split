import api from './api';
import {
  FriendBalanceItem,
  FriendBalanceResponse,
  FriendHistoryItem,
  FriendHistoryResponse,
} from '@/src/types/friends.types';

const normalizeBalanceItem = (item: any): FriendBalanceItem => ({
  friendId: String(item?.friendId || item?._id || item?.id || ''),
  name: String(item?.name || item?.friendName || 'Friend'),
  netBalance: Number(item?.netBalance ?? item?.netAmount ?? 0),
  netAmount: Number(item?.netAmount ?? item?.netBalance ?? 0),
  pendingCount: item?.pendingCount !== undefined ? Number(item.pendingCount || 0) : undefined,
  overdueCount: item?.overdueCount !== undefined ? Number(item.overdueCount || 0) : undefined,
});

const normalizeHistoryItem = (item: any): FriendHistoryItem => ({
  type: item?.type === 'settlement' ? 'settlement' : 'expense',
  amount: Number(item?.amount || 0),
  description: item?.description ? String(item.description) : undefined,
  date: String(item?.date || item?.createdAt || new Date().toISOString()),
  direction:
    item?.direction === 'you_received'
      ? 'you_received'
      : item?.direction === 'friend_paid'
      ? 'friend_paid'
      : 'you_paid',
});

export const getFriendBalances = async (): Promise<FriendBalanceItem[]> => {
  const response = await api.get<FriendBalanceResponse>('/friends/balances');
  const payload: any = response?.data;
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return data.map(normalizeBalanceItem).filter((item: FriendBalanceItem) => Boolean(item.friendId));
};

export const getFriendHistory = async (friendId: string): Promise<FriendHistoryItem[]> => {
  const response = await api.get<FriendHistoryResponse>(`/friends/${friendId}/history`);
  const payload: any = response?.data;
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return data.map(normalizeHistoryItem);
};

export const friendsService = {
  getFriendBalances,
  getFriendHistory,
};

export default friendsService;
