// Mobile-App/src/types/group.types.ts

export enum GroupType {
  TRIP = 'trip',
  COLLEGE = 'college',
  FOOD = 'food',
  FLATMATES = 'flatmates',
  EVENT = 'event',
  CUSTOM = 'custom',
}

export enum GroupIcon {
  TRIP = '✈️',
  COLLEGE = '🎓',
  FOOD = '🍔',
  FLATMATES = '🏠',
  EVENT = '🎉',
  CUSTOM = '➕',
}

export const GROUP_TYPE_MAP = {
  [GroupType.TRIP]: { emoji: '✈️', label: 'Trip', description: 'Travel & vacation expenses' },
  [GroupType.COLLEGE]: { emoji: '🎓', label: 'College', description: 'Shared college group' },
  [GroupType.FOOD]: { emoji: '🍔', label: 'Food & Snacks', description: 'Food sharing expenses' },
  [GroupType.FLATMATES]: { emoji: '🏠', label: 'Flatmates', description: 'Shared living expenses' },
  [GroupType.EVENT]: { emoji: '🎉', label: 'Event', description: 'Event or party expenses' },
  [GroupType.CUSTOM]: { emoji: '➕', label: 'Custom', description: 'Create your own group type' },
};

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface TripDay {
  dayNumber: number;
  date: Date;
  dayName: string;
  expenses: Expense[];
  totalSpent: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  paidByName: string;
  splitAmong: Array<{
    userId: string;
    userName: string;
    amount: number;
  }>;
  date: Date;
  groupId: string;
  tripDay?: number; // For trip groups only
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  emoji?: string;
  customEmoji?: string;
  color?: string;
  description?: string;
  members?: Array<{
    userId: string;
    userName: string;
    email: string;
    avatar?: string;
    role: 'creator' | 'member';
  }>;
  expenses?: Expense[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;

  // Trip-specific fields
  tripStartDate?: Date;
  tripEndDate?: Date;
  tripDestination?: string;
  tripBudget?: number;
  trackBudget?: boolean; // NEW: Track budget progress

  // Regular group fields
  totalSpent: number;
  netBalance: number; // Positive = owed to user, Negative = user owes
}

export interface GroupSettlement {
  from: {
    userId: string;
    userName: string;
  };
  to: {
    userId: string;
    userName: string;
  };
  amount: number;
  settled: boolean;
  settledAt?: Date;
}

export interface CreateGroupFormData {
  name: string;
  type: GroupType;
  emoji?: string;
  members: string[]; // User IDs
  description?: string;

  // Trip-specific
  tripStartDate?: Date;
  tripEndDate?: Date;
  tripDestination?: string;
  tripBudget?: number;
  trackBudget?: boolean;
}

export interface TripExpenseWithDay extends Expense {
  day: TripDay;
}
