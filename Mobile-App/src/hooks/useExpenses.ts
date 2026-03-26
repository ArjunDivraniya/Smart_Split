import { useCallback, useEffect, useState } from 'react';
import {
  addExpense as addExpenseRequest,
  deleteExpense as deleteExpenseRequest,
  getGroupBalances,
  getGroupExpenses,
  type ExpensePayload,
  updateExpense as updateExpenseRequest,
} from '@/src/services/expenses.service';

export interface GroupBalanceRow {
  userId: string;
  userName: string;
  netBalance: number;
  paid: number;
  owedShare: number;
}

interface UseExpensesResult<TExpense = any, TBalances = GroupBalanceRow[] | Record<string, any>> {
  expenses: TExpense[];
  balances: TBalances;
  loading: boolean;
  error: string;
  addExpense: (data: ExpensePayload) => Promise<TExpense | null>;
  updateExpense: (id: string, data: ExpensePayload) => Promise<TExpense | null>;
  deleteExpense: (id: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
}

const getErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Failed to process expense request'
  );
};

export const useExpenses = <TExpense = any, TBalances = GroupBalanceRow[] | Record<string, any>>(
  groupId?: string
): UseExpensesResult<TExpense, TBalances> => {
  const [expenses, setExpenses] = useState<TExpense[]>([]);
  const [balances, setBalances] = useState<TBalances>(([] as unknown) as TBalances);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const refreshExpenses = useCallback(async () => {
    if (!groupId) {
      setExpenses([]);
      setBalances(([] as unknown) as TBalances);
      setLoading(false);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [expensesData, balancesData] = await Promise.all([
        getGroupExpenses<TExpense[]>(groupId),
        getGroupBalances<TBalances>(groupId),
      ]);

      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setBalances(balancesData);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setExpenses([]);
      setBalances(([] as unknown) as TBalances);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const addExpense = useCallback(
    async (data: ExpensePayload): Promise<TExpense | null> => {
      try {
        setError('');
        const createdExpense = await addExpenseRequest<TExpense>(data);
        await refreshExpenses();
        return createdExpense;
      } catch (err: any) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [refreshExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, data: ExpensePayload): Promise<TExpense | null> => {
      try {
        setError('');
        const updatedExpense = await updateExpenseRequest<TExpense>(id, data);
        await refreshExpenses();
        return updatedExpense;
      } catch (err: any) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [refreshExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError('');
        await deleteExpenseRequest(id);
        setExpenses((prev) =>
          prev.filter((expense: any) => {
            const expenseId = expense?.id || expense?._id;
            return expenseId !== id;
          })
        );

        if (groupId) {
          const latestBalances = await getGroupBalances<TBalances>(groupId);
          setBalances(latestBalances);
        }

        return true;
      } catch (err: any) {
        setError(getErrorMessage(err));
        return false;
      }
    },
    [groupId]
  );

  useEffect(() => {
    refreshExpenses();
  }, [refreshExpenses]);

  return {
    expenses,
    balances,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses,
  };
};

export default useExpenses;
