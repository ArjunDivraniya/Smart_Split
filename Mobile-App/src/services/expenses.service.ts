import api from './api';

export type ExpensePayload = Record<string, any>;

const unwrapData = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export const addExpense = async <T = any>(data: ExpensePayload): Promise<T> => {
  const response = await api.post('/expenses', data);
  return unwrapData<T>(response.data);
};

export const getGroupExpenses = async <T = any>(groupId: string): Promise<T> => {
  const response = await api.get(`/expenses/group/${groupId}`);
  return unwrapData<T>(response.data);
};

export const getGroupBalances = async <T = any>(groupId: string): Promise<T> => {
  const response = await api.get(`/expenses/group/${groupId}/balances`);
  return unwrapData<T>(response.data);
};

export const updateExpense = async <T = any>(id: string, data: ExpensePayload): Promise<T> => {
  const response = await api.put(`/expenses/${id}`, data);
  return unwrapData<T>(response.data);
};

export const deleteExpense = async <T = any>(id: string): Promise<T> => {
  const response = await api.delete(`/expenses/${id}`);
  return unwrapData<T>(response.data);
};

export const expensesService = {
  addExpense,
  getGroupExpenses,
  getGroupBalances,
  updateExpense,
  deleteExpense,
};

export default expensesService;
    