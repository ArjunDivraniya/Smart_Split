import { useCallback, useEffect, useState } from 'react';
import {
  addExpense as addExpenseRequest,
  deleteExpense as deleteExpenseRequest,
  getExpenses as getExpensesRequest,
  getSummary as getSummaryRequest,
  updateExpense as updateExpenseRequest,
} from '@/src/services/personal.service';
import type {
  CreateExpensePayload,
  ExpenseSummary,
  PersonalExpense,
  UpdateExpensePayload,
} from '@/src/types/personal.types';

interface UsePaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface UsePersonalExpensesResult {
  // Data
  expenses: PersonalExpense[];
  summary: ExpenseSummary[];
  summaryTotal: number;
  summaryMonth: number;
  summaryYear: number;

  // State
  loading: boolean;
  error: string;
  pagination: UsePaginationState;

  // Actions
  fetchExpenses: (page?: number, category?: string) => Promise<void>;
  fetchSummary: (month?: number, year?: number) => Promise<void>;
  addExpense: (data: CreateExpensePayload) => Promise<PersonalExpense | null>;
  updateExpense: (id: string, data: UpdateExpensePayload) => Promise<PersonalExpense | null>;
  deleteExpense: (id: string) => Promise<boolean>;

  // Pagination
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;

  // Reset and refresh
  resetPagination: () => void;
  refreshExpenses: () => Promise<void>;
}

const getErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Failed to process personal expense'
  );
};

/**
 * Custom hook for managing personal expenses
 * Handles fetching, pagination, addition, update, and deletion of personal expenses
 * Also manages monthly summary data
 *
 * @param initialMonth - Initial month for filtering (defaults to current month)
 * @param initialYear - Initial year for filtering (defaults to current year)
 * @param itemsPerPage - Number of items per page (default: 20, max: 100)
 * @returns UsePersonalExpensesResult with expenses, summary, and actions
 */
export const usePersonalExpenses = (
  initialMonth?: number,
  initialYear?: number,
  itemsPerPage: number = 20
): UsePersonalExpensesResult => {
  // Data state
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary[]>([]);
  const [summaryTotal, setSummaryTotal] = useState<number>(0);
  const [summaryMonth, setSummaryMonth] = useState<number>(initialMonth || new Date().getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState<number>(initialYear || new Date().getFullYear());

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Pagination state
  const [pagination, setPagination] = useState<UsePaginationState>({
    page: 1,
    limit: Math.min(itemsPerPage, 100),
    total: 0,
    hasMore: false,
  });

  // Filter state
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth || new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(initialYear || new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  /**
   * Fetch expenses with current filters and pagination
   */
  const fetchExpenses = useCallback(
    async (page: number = 1, category?: string) => {
      try {
        setLoading(true);
        setError('');

        if (category) {
          setSelectedCategory(category);
        }

        const response = await getExpensesRequest(
          currentMonth,
          currentYear,
          category || selectedCategory,
          pagination.limit,
          page
        );

        if (response.success && response.data) {
          setExpenses(response.data.expenses);
          setPagination({
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            total: response.data.pagination.total,
            hasMore: response.data.pagination.hasMore,
          });
        } else {
          setExpenses([]);
        }
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    },
    [currentMonth, currentYear, pagination.limit, selectedCategory]
  );

  /**
   * Fetch monthly summary
   */
  const fetchSummary = useCallback(async (month?: number, year?: number) => {
    try {
      const queryMonth = month || summaryMonth;
      const queryYear = year || summaryYear;

      const response = await getSummaryRequest(queryMonth, queryYear);

      if (response.success && response.data) {
        setSummary(response.data.categories);
        setSummaryTotal(response.data.total);
        setSummaryMonth(response.data.month);
        setSummaryYear(response.data.year);
      } else {
        setSummary([]);
        setSummaryTotal(0);
      }
    } catch (err: any) {
      console.error('Error fetching summary:', getErrorMessage(err));
      setSummary([]);
      setSummaryTotal(0);
    }
  }, [summaryMonth, summaryYear]);

  /**
   * Add new expense
   */
  const addExpense = useCallback(
    async (data: CreateExpensePayload): Promise<PersonalExpense | null> => {
      try {
        setError('');
        const newExpense = await addExpenseRequest(data);

        // Refresh list and summary
        await Promise.all([fetchExpenses(1), fetchSummary()]);

        return newExpense;
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        return null;
      }
    },
    [fetchExpenses, fetchSummary]
  );

  /**
   * Update existing expense
   */
  const updateExpense = useCallback(
    async (id: string, data: UpdateExpensePayload): Promise<PersonalExpense | null> => {
      try {
        setError('');
        const updated = await updateExpenseRequest(id, data);

        // Refresh list and summary
        await Promise.all([fetchExpenses(pagination.page), fetchSummary()]);

        return updated;
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        return null;
      }
    },
    [fetchExpenses, fetchSummary, pagination.page]
  );

  /**
   * Delete expense
   */
  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError('');
        const success = await deleteExpenseRequest(id);

        if (success) {
          // Refresh list and summary
          await Promise.all([fetchExpenses(pagination.page), fetchSummary()]);
        }

        return success;
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        return false;
      }
    },
    [fetchExpenses, fetchSummary, pagination.page]
  );

  /**
   * Pagination controls
   */
  const goToPage = useCallback(
    async (page: number) => {
      if (page >= 1 && page <= Math.ceil(pagination.total / pagination.limit)) {
        await fetchExpenses(page);
      }
    },
    [fetchExpenses, pagination.total, pagination.limit]
  );

  const nextPage = useCallback(async () => {
    if (pagination.hasMore) {
      await goToPage(pagination.page + 1);
    }
  }, [pagination.hasMore, pagination.page, goToPage]);

  const previousPage = useCallback(async () => {
    if (pagination.page > 1) {
      await goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  /**
   * Reset pagination to page 1
   */
  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      limit: Math.min(itemsPerPage, 100),
      total: 0,
      hasMore: false,
    });
  }, [itemsPerPage]);

  /**
   * Refresh all data (expenses and summary)
   */
  const refreshExpenses = useCallback(async () => {
    await Promise.all([fetchExpenses(1), fetchSummary()]);
  }, [fetchExpenses, fetchSummary]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchExpenses(1), fetchSummary()]);
    };
    init();
  }, []);

  return {
    // Data
    expenses,
    summary,
    summaryTotal,
    summaryMonth,
    summaryYear,

    // State
    loading,
    error,
    pagination,

    // Actions
    fetchExpenses,
    fetchSummary,
    addExpense,
    updateExpense,
    deleteExpense,

    // Pagination
    goToPage,
    nextPage,
    previousPage,

    // Reset and refresh
    resetPagination,
    refreshExpenses,
  };
};
