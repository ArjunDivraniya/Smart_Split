import { COLORS } from './theme';

/**
 * Expense Categories with Icons and Colors
 * Used throughout the app for expense categorization
 */

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'restaurant',
    color: '#FF6B6B',
    description: 'Restaurants, groceries, snacks',
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: 'car',
    color: '#4ECDC4',
    description: 'Taxi, bus, train, gas, parking',
  },
  {
    id: 'accommodation',
    name: 'Accommodation',
    icon: 'bed',
    color: '#45B7D1',
    description: 'Hotels, hostels, Airbnb',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'ticket',
    color: '#FFA07A',
    description: 'Movies, concerts, activities',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#F06292',
    description: 'Souvenirs, clothes, gifts',
  },
  {
    id: 'health',
    name: 'Health',
    icon: 'medical',
    color: '#66BB6A',
    description: 'Medicine, hospital, pharmacy',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: 'flash',
    color: '#FFA726',
    description: 'Internet, phone, electricity',
  },
  {
    id: 'drinks',
    name: 'Drinks & Bar',
    icon: 'wine',
    color: '#AB47BC',
    description: 'Coffee, alcohol, beverages',
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: 'bicycle',
    color: '#26A69A',
    description: 'Tours, adventure, sports',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'cart',
    color: '#9CCC65',
    description: 'Supermarket, food supplies',
  },
  {
    id: 'flight',
    name: 'Flight',
    icon: 'airplane',
    color: '#42A5F5',
    description: 'Airfare, baggage fees',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#78909C',
    description: 'Miscellaneous expenses',
  },
];

/**
 * Get category by ID
 */
export const getCategoryById = (categoryId: string): ExpenseCategory | undefined => {
  return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
};

/**
 * Get category icon name
 */
export const getCategoryIcon = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.icon || 'help-circle';
};

/**
 * Get category color
 */
export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || COLORS.textSecondary;
};

/**
 * Trip Status Types
 */
export const TRIP_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];

/**
 * Trip Status Labels with Colors
 */
export const TRIP_STATUS_CONFIG = {
  [TRIP_STATUS.PLANNING]: {
    label: 'Planning',
    color: COLORS.info,
    icon: 'calendar',
  },
  [TRIP_STATUS.ACTIVE]: {
    label: 'Active',
    color: COLORS.success,
    icon: 'location',
  },
  [TRIP_STATUS.COMPLETED]: {
    label: 'Completed',
    color: COLORS.textSecondary,
    icon: 'checkmark-circle',
  },
  [TRIP_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: COLORS.error,
    icon: 'close-circle',
  },
};

/**
 * Split Methods
 */
export const SPLIT_METHODS = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  AMOUNT: 'amount',
  SHARES: 'shares',
} as const;

export type SplitMethod = typeof SPLIT_METHODS[keyof typeof SPLIT_METHODS];

/**
 * Split Method Labels
 */
export const SPLIT_METHOD_LABELS = {
  [SPLIT_METHODS.EQUAL]: 'Equal Split',
  [SPLIT_METHODS.PERCENTAGE]: 'By Percentage',
  [SPLIT_METHODS.AMOUNT]: 'By Amount',
  [SPLIT_METHODS.SHARES]: 'By Shares',
};

/**
 * Currency Codes
 */
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
];

/**
 * Default Currency
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || '$';
};

/**
 * Payment Methods
 */
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: 'cash' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
  { id: 'upi', name: 'UPI', icon: 'qr-code' },
  { id: 'bank', name: 'Bank Transfer', icon: 'business' },
  { id: 'wallet', name: 'Digital Wallet', icon: 'wallet' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal' },
];

/**
 * Date Range Presets for Analytics
 */
export const DATE_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL: 'all',
  CUSTOM: 'custom',
} as const;

export type DateRange = typeof DATE_RANGES[keyof typeof DATE_RANGES];

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  EXPENSE_ADDED: 'expense_added',
  EXPENSE_UPDATED: 'expense_updated',
  EXPENSE_DELETED: 'expense_deleted',
  TRIP_INVITE: 'trip_invite',
  TRIP_UPDATED: 'trip_updated',
  SETTLEMENT_REQUEST: 'settlement_request',
  SETTLEMENT_COMPLETED: 'settlement_completed',
  MEMBER_JOINED: 'member_joined',
  MEMBER_LEFT: 'member_left',
  REMINDER: 'reminder',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

/**
 * App Constants
 */
export const APP_CONSTANTS = {
  APP_NAME: 'SmartSplit',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: 30000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  MIN_PASSWORD_LENGTH: 6,
  MAX_TRIP_MEMBERS: 50,
  MAX_EXPENSE_AMOUNT: 1000000,
};

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME_MODE: '@theme_mode',
  CURRENCY: '@currency',
  LANGUAGE: '@language',
  ONBOARDING_COMPLETE: '@onboarding_complete',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

export default {
  EXPENSE_CATEGORIES,
  TRIP_STATUS,
  TRIP_STATUS_CONFIG,
  SPLIT_METHODS,
  SPLIT_METHOD_LABELS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  PAYMENT_METHODS,
  DATE_RANGES,
  NOTIFICATION_TYPES,
  APP_CONSTANTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
};
