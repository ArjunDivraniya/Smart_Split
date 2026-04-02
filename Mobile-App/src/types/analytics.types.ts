export interface MonthlyData {
  label: string;
  month: number;
  year: number;
  personal: number;
  group: number;
  total: number;
}

export interface MonthlyAnalyticsResponse {
  data: MonthlyData[];
}

export interface CategoryData {
  category: string;
  total: number;
  count: number;
  percentage: number;
  emoji: string;
}

export interface CategoryBreakdownResponse {
  grandTotal: number;
  totalPersonal: number;
  totalGroup: number;
  personalCount: number;
  groupCount: number;
  categories: CategoryData[];
}

export type InsightType = 'warning' | 'positive' | 'info';

export interface InsightItem {
  type: InsightType;
  icon: string;
  message: string;
  detail: string;
}

export interface InsightsResponse {
  insights: InsightItem[];
  thisMonthTotal: number;
  lastMonthTotal: number;
  changePercent: number;
  topCategory: string;
}

export interface GroupVsPersonalData {
  month: string;
  group: number;
  personal: number;
}

export interface GroupVsPersonalSummary {
  totalGroup: number;
  totalPersonal: number;
  groupPercent: number;
  personalPercent: number;
}

export interface GroupVsPersonalResponse {
  data: GroupVsPersonalData[];
  summary: GroupVsPersonalSummary;
}

export interface FriendSpending {
  friendId: string;
  friendName: string;
  friendAvatar: string;
  totalShared: number;
  expenseCount: number;
  groups: string[];
}

export interface FriendSpendingResponse {
  friends: FriendSpending[];
}

export type AnalyticsChartType = 'monthly' | 'group-vs-personal' | 'friend-spending';
