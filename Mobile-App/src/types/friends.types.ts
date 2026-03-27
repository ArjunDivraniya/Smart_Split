export interface FriendBalanceItem {
  friendId: string;
  name: string;
  netBalance: number;
  netAmount?: number;
  pendingCount?: number;
  overdueCount?: number;
}

export interface FriendHistoryItem {
  type: 'expense' | 'settlement';
  amount: number;
  description?: string;
  date: string;
  direction: 'you_paid' | 'friend_paid' | 'you_received';
}

export interface FriendBalanceResponse {
  success: boolean;
  data: FriendBalanceItem[];
}

export interface FriendHistoryResponse {
  success: boolean;
  data: FriendHistoryItem[];
}
