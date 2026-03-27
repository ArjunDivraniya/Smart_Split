export type PresetExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Utilities'
  | 'Healthcare'
  | 'Shopping'
  | 'Other';

export type ExpenseCategory = string;

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';

export type RecurringType = 'daily' | 'monthly' | 'weekly';

export interface PersonalExpense {
  id: string;
  user: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  expenseDate: string | Date;
  isRecurring: boolean;
  recurringType?: RecurringType | null;
  note?: string;
  receiptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  description: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  expenseDate: string | Date;
  isRecurring: boolean;
  recurringType?: RecurringType;
  note?: string;
  receiptUrl?: string;
}

export interface UpdateExpensePayload {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  expenseDate?: string | Date;
  isRecurring?: boolean;
  recurringType?: RecurringType | null;
  note?: string;
  receiptUrl?: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface GetExpensesResponse {
  success: boolean;
  data: {
    expenses: PersonalExpense[];
    pagination: PaginationMeta;
  };
}

export interface GetExpenseByIdResponse {
  success: boolean;
  data: PersonalExpense;
}

export interface ExpenseSummary {
  name: string;
  total: number;
  count: number;
}

export interface GetSummaryResponse {
  success: boolean;
  data: {
    month: number;
    year: number;
    total: number;
    categories: ExpenseSummary[];
  };
}

export interface CreateExpenseResponse {
  success: boolean;
  message: string;
  data: PersonalExpense;
}

export interface UpdateExpenseResponse {
  success: boolean;
  message: string;
  data: PersonalExpense;
}

export interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}
