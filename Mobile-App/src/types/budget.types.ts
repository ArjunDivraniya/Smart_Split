export interface BudgetStatusItem {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  alert: boolean;
  month: number;
  year: number;
}

export interface CreateBudgetPayload {
  category: string;
  limit: number;
  month: number;
  year: number;
}

export interface UpdateBudgetPayload {
  limit: number;
}

export interface BudgetStatusResponse {
  success: boolean;
  data: BudgetStatusItem[];
}

export interface BudgetWriteResponse {
  success: boolean;
  data: {
    _id?: string;
    id?: string;
    category: string;
    limit: number;
    month: number;
    year: number;
  };
}
