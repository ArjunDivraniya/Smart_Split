import api from './api';
import type {
  PersonalExpense,
  CreateExpensePayload,
  UpdateExpensePayload,
  GetExpensesResponse,
  GetExpenseByIdResponse,
  GetSummaryResponse,
  CreateExpenseResponse,
  UpdateExpenseResponse,
  DeleteExpenseResponse,
} from '@/src/types/personal.types';

/**
 * Get personal expenses with filters and pagination
 * @param month - Month (1-12), defaults to current month
 * @param year - Year, defaults to current year
 * @param category - Filter by category (optional)
 * @param limit - Items per page (default: 20, max: 100)
 * @param page - Page number (default: 1)
 * @returns Promise with expenses and pagination data
 */
export const getExpenses = async (
  month?: number,
  year?: number,
  category?: string,
  limit: number = 20,
  page: number = 1
): Promise<GetExpensesResponse> => {
  try {
    const params: any = {
      limit: Math.min(limit, 100),
      page: Math.max(1, page),
    };

    if (month) {
      params.month = month;
    }
    if (year) {
      params.year = year;
    }
    if (category) {
      params.category = category;
    }

    const response = await api.get<GetExpensesResponse>('/personal-expenses', { params });
    console.log('✅ Fetched personal expenses');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching personal expenses:', error.message);
    throw error;
  }
};

/**
 * Get one personal expense by id
 * @param id - Expense ID
 * @returns Promise with expense
 */
export const getExpenseById = async (id: string): Promise<PersonalExpense> => {
  try {
    const response = await api.get<GetExpenseByIdResponse>(`/personal-expenses/${id}`);
    console.log(`✅ Fetched personal expense ${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error(`❌ Error fetching personal expense ${id}:`, error.message);
    throw error;
  }
};

/**
 * Create a new personal expense
 * @param payload - Expense data
 * @returns Promise with created expense
 */
export const addExpense = async (payload: CreateExpensePayload): Promise<PersonalExpense> => {
  try {
    const response = await api.post<CreateExpenseResponse>('/personal-expenses', payload);
    console.log('✅ Personal expense created successfully');
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error creating personal expense:', error.message);
    throw error;
  }
};

/**
 * Update an existing personal expense
 * @param id - Expense ID
 * @param payload - Updated expense data
 * @returns Promise with updated expense
 */
export const updateExpense = async (
  id: string,
  payload: UpdateExpensePayload
): Promise<PersonalExpense> => {
  try {
    const response = await api.put<UpdateExpenseResponse>(`/personal-expenses/${id}`, payload);
    console.log(`✅ Personal expense ${id} updated successfully`);
    return response.data.data;
  } catch (error: any) {
    console.error(`❌ Error updating personal expense ${id}:`, error.message);
    throw error;
  }
};

/**
 * Delete a personal expense
 * @param id - Expense ID
 * @returns Promise with success status
 */
export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const response = await api.delete<DeleteExpenseResponse>(`/personal-expenses/${id}`);
    console.log(`✅ Personal expense ${id} deleted successfully`);
    return response.data.success;
  } catch (error: any) {
    console.error(`❌ Error deleting personal expense ${id}:`, error.message);
    throw error;
  }
};

/**
 * Get monthly expense summary grouped by category
 * @param month - Month (1-12), defaults to current month
 * @param year - Year, defaults to current year
 * @returns Promise with summary data
 */
export const getSummary = async (month?: number, year?: number): Promise<GetSummaryResponse> => {
  try {
    const params: any = {};

    if (month) {
      params.month = month;
    }
    if (year) {
      params.year = year;
    }

    const response = await api.get<GetSummaryResponse>('/personal-expenses/summary', { params });
    console.log('✅ Fetched personal expense summary');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching personal expense summary:', error.message);
    throw error;
  }
};
