/**
 * TypeScript Type Definitions for SmartSplit App
 */

// ==================== User Types ====================
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phone?: string;
  authProvider: 'credentials' | 'google';
  createdAt: string;
}

// ==================== Trip Types ====================
export interface Trip {
  _id: string;
  name: string;
  description?: string;
  destination?: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  currency: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  members: TripMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TripMember {
  userId: string;
  user?: User;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface CreateTripInput {
  name: string;
  description?: string;
  destination?: string;
  startDate: string;
  endDate: string;
  currency?: string;
  memberEmails?: string[];
}

// ==================== Expense Types ====================
export interface Expense {
  _id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: string;
  paidByUser?: User;
  date: string;
  receiptImage?: string;
  splitMethod: 'equal' | 'percentage' | 'amount' | 'shares';
  splits: ExpenseSplit[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSplit {
  userId: string;
  user?: User;
  amount: number;
  percentage?: number;
  shares?: number;
  isPaid: boolean;
}

export interface CreateExpenseInput {
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: string;
  date: string;
  splitMethod: 'equal' | 'percentage' | 'amount' | 'shares';
  splits: Omit<ExpenseSplit, 'isPaid'>[];
  notes?: string;
}

// ==================== Settlement Types ====================
export interface Settlement {
  _id: string;
  tripId: string;
  from: string;
  fromUser?: User;
  to: string;
  toUser?: User;
  amount: number;
  currency: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

// ==================== Analytics Types ====================
export interface TripAnalytics {
  totalExpenses: number;
  totalAmount: number;
  averageExpense: number;
  expensesByCategory: CategoryExpense[];
  expensesByMember: MemberExpense[];
  dailyExpenses: DailyExpense[];
  topExpenses: Expense[];
}

export interface CategoryExpense {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MemberExpense {
  userId: string;
  userName: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

export interface DailyExpense {
  date: string;
  amount: number;
  count: number;
}

// ==================== Notification Types ====================
export interface Notification {
  _id: string;
  userId: string;
  type: 'expense_added' | 'expense_updated' | 'expense_deleted' | 'trip_invite' | 'trip_updated' | 'settlement_request' | 'settlement_completed' | 'member_joined' | 'member_left' | 'reminder';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// ==================== Activity Types ====================
export interface Activity {
  _id: string;
  tripId: string;
  userId: string;
  user?: User;
  type: 'expense_added' | 'expense_updated' | 'expense_deleted' | 'member_added' | 'member_removed' | 'trip_updated' | 'settlement_paid';
  message: string;
  data?: any;
  createdAt: string;
}

// ==================== Packing Item Types ====================
export interface PackingItem {
  _id: string;
  tripId: string;
  name: string;
  category: string;
  isPacked: boolean;
  assignedTo?: string;
  assignedToUser?: User;
  createdBy: string;
  createdAt: string;
}

// ==================== Itinerary Types ====================
export interface ItineraryItem {
  _id: string;
  tripId: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type: 'activity' | 'transportation' | 'accommodation' | 'meal' | 'other';
  createdBy: string;
  createdAt: string;
}

// ==================== API Response Types ====================
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== Form Types ====================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

// ==================== Navigation Types ====================
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  TripDetails: { tripId: string };
  AddExpense: { tripId: string };
  ExpenseDetails: { expenseId: string };
  EditExpense: { expenseId: string };
  TripMembers: { tripId: string };
  AddMember: { tripId: string };
  Settlements: { tripId: string };
  TripAnalytics: { tripId: string };
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

// ==================== Component Props Types ====================
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  multiline?: boolean;
  icon?: string;
}

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
}

// ==================== Chart Data Types ====================
export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    colors?: string[];
  }[];
}

export interface PieChartData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

// ==================== Filter Types ====================
export interface ExpenseFilter {
  category?: string;
  paidBy?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TripFilter {
  status?: 'planning' | 'active' | 'completed' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
}

// ==================== State Types ====================
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

// ==================== Error Types ====================
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export default {
  User,
  Trip,
  Expense,
  Settlement,
  Notification,
  ApiResponse,
};
