import api from './api';
import {
  BudgetStatusItem,
  BudgetStatusResponse,
  BudgetWriteResponse,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '@/src/types/budget.types';

const normalizeBudgetStatus = (item: any): BudgetStatusItem => ({
  id: String(item?.id || item?._id || ''),
  category: String(item?.category || ''),
  limit: Number(item?.limit || 0),
  spent: Number(item?.spent || 0),
  remaining: Number(item?.remaining || 0),
  percentage: Number(item?.percentage || 0),
  alert: Boolean(item?.alert),
  month: Number(item?.month || 0),
  year: Number(item?.year || 0),
});

export const getBudgetStatus = async (month: number, year: number): Promise<BudgetStatusItem[]> => {
  const response = await api.get<BudgetStatusResponse>('/budgets/status', {
    params: { month, year },
  });

  const payload: any = response?.data;
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return data.map(normalizeBudgetStatus);
};

export const createBudget = async (data: CreateBudgetPayload): Promise<any> => {
  const response = await api.post<BudgetWriteResponse>('/budgets', data);
  return response?.data?.data || response?.data;
};

export const updateBudget = async (budgetId: string, data: UpdateBudgetPayload): Promise<any> => {
  const response = await api.put<BudgetWriteResponse>(`/budgets/${budgetId}`, data);
  return response?.data?.data || response?.data;
};

export const deleteBudget = async (budgetId: string): Promise<boolean> => {
  const response = await api.delete(`/budgets/${budgetId}`);
  return Boolean(response?.data?.success ?? true);
};

export const budgetService = {
  getBudgetStatus,
  createBudget,
  updateBudget,
  deleteBudget,
};

export default budgetService;
