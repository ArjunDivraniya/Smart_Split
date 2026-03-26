export type SettlementStatus = 'pending' | 'overdue' | 'partial' | 'completed';

export type SettlementDirection = 'you_owe' | 'they_owe';

export type SettlementSource = 'group' | 'personal' | 'direct';

export interface SettlementFriend {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  upiId: string;
}

export interface SettlementGroup {
  id: string;
  name: string;
  emoji: string;
  type: string;
}

export interface Settlement {
  id: string;
  friend: SettlementFriend;
  amount: number;
  amountPaid: number;
  remaining: number;
  direction: SettlementDirection;
  status: SettlementStatus;
  source: SettlementSource;
  group?: SettlementGroup;
  expenseDescription: string;
  createdAt: string;
  daysPending: number;
  remindCount: number;
  remindedAt?: string;
  dueDate?: string;
}

export interface SettlementSummary {
  totalYouOwe: number;
  totalYouGet: number;
  netBalance: number;
  pendingCount: number;
  overdueCount: number;
  partialCount: number;
}

export interface PendingSettlementsResponse {
  summary: SettlementSummary;
  settlements: Settlement[];
}
