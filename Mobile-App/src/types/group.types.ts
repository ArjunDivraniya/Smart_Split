// Mobile-App/src/types/group.types.ts

export enum GroupType {
  PERSONAL = 'personal',
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
  [GroupType.PERSONAL]: { emoji: '👤', label: 'Personal', description: 'Personal expenses' },
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
  _id?: string; // MongoDB ObjectId (for compatibility)
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
    status?: 'invited' | 'joined' | 'rejected'; // For trip-type groups
  }>;
  expenses?: Expense[];
  createdBy?: {
    _id?: string;
    name: string;
    email: string;
  } | string; // Can be user object or just user ID string
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
  status?: 'active' | 'completed'; // For trip-type groups and regular groups

  // Trip-specific fields (all optional - only present when type='trip')
  tripStartDate?: Date;
  tripEndDate?: Date;
  tripDestination?: string;
  tripBudget?: number | null;
  trackBudget?: boolean;

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
