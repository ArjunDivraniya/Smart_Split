import { useCallback, useEffect, useState } from 'react';
import {
  AnalyticsChartType,
  CategoryData,
  FriendSpending,
  GroupVsPersonalData,
  GroupVsPersonalSummary,
  InsightItem,
  InsightsResponse,
  MonthlyData,
} from '@/src/types/analytics.types';
import {
  getCategoryBreakdown,
  getFriendSpending,
  getGroupVsPersonal,
  getInsights,
  getMonthlyData,
} from '@/src/services/analytics.service';

interface UseAnalyticsResult {
  loading: boolean;
  error: string | null;
  selectedMonth: number;
  selectedYear: number;
  activeChart: AnalyticsChartType;
  monthlyData: MonthlyData[];
  categoryGrandTotal: number;
  categoryData: CategoryData[];
  insights: InsightItem[];
  insightSummary: Omit<InsightsResponse, 'insights'>;
  groupVsPersonalData: GroupVsPersonalData[];
  groupVsPersonalSummary: GroupVsPersonalSummary;
  friendSpending: FriendSpending[];
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setActiveChart: (chart: AnalyticsChartType) => void;
  refreshAnalytics: () => Promise<void>;
}

const emptyInsightSummary: Omit<InsightsResponse, 'insights'> = {
  thisMonthTotal: 0,
  lastMonthTotal: 0,
  changePercent: 0,
  topCategory: '',
};

const emptyGroupVsPersonalSummary: GroupVsPersonalSummary = {
  totalGroup: 0,
  totalPersonal: 0,
  groupPercent: 0,
  personalPercent: 0,
};

const getErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Failed to load analytics data'
  );
};

export const useAnalytics = (): UseAnalyticsResult => {
  const now = new Date();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [activeChart, setActiveChart] = useState<AnalyticsChartType>('monthly');

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryGrandTotal, setCategoryGrandTotal] = useState<number>(0);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [insightSummary, setInsightSummary] = useState<Omit<InsightsResponse, 'insights'>>(emptyInsightSummary);
  const [groupVsPersonalData, setGroupVsPersonalData] = useState<GroupVsPersonalData[]>([]);
  const [groupVsPersonalSummary, setGroupVsPersonalSummary] = useState<GroupVsPersonalSummary>(
    emptyGroupVsPersonalSummary
  );
  const [friendSpending, setFriendSpending] = useState<FriendSpending[]>([]);

  const [hasLoadedInitial, setHasLoadedInitial] = useState<boolean>(false);

  const fetchCategoryData = useCallback(async (month: number, year: number) => {
    const categoryResponse = await getCategoryBreakdown(month, year);
    setCategoryGrandTotal(categoryResponse?.grandTotal || 0);
    setCategoryData(Array.isArray(categoryResponse?.categories) ? categoryResponse.categories : []);
  }, []);

  const refreshAnalytics = useCallback(async (monthOverride?: number, yearOverride?: number) => {
    const monthToUse = monthOverride ?? selectedMonth;
    const yearToUse = yearOverride ?? selectedYear;

    try {
      setLoading(true);
      setError(null);

      const [monthlyResponse, categoryResponse, insightResponse, groupVsPersonalResponse, friendResponse] =
        await Promise.all([
          getMonthlyData(),
          getCategoryBreakdown(monthToUse, yearToUse),
          getInsights(),
          getGroupVsPersonal(),
          getFriendSpending(),
        ]);

      setMonthlyData(Array.isArray(monthlyResponse?.data) ? monthlyResponse.data : []);
      setCategoryGrandTotal(categoryResponse?.grandTotal || 0);
      setCategoryData(Array.isArray(categoryResponse?.categories) ? categoryResponse.categories : []);
      setInsights(Array.isArray(insightResponse?.insights) ? insightResponse.insights : []);
      setInsightSummary({
        thisMonthTotal: insightResponse?.thisMonthTotal || 0,
        lastMonthTotal: insightResponse?.lastMonthTotal || 0,
        changePercent: insightResponse?.changePercent || 0,
        topCategory: insightResponse?.topCategory || '',
      });
      setGroupVsPersonalData(
        Array.isArray(groupVsPersonalResponse?.data) ? groupVsPersonalResponse.data : []
      );
      setGroupVsPersonalSummary(
        groupVsPersonalResponse?.summary || emptyGroupVsPersonalSummary
      );
      setFriendSpending(Array.isArray(friendResponse?.friends) ? friendResponse.friends : []);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setMonthlyData([]);
      setCategoryGrandTotal(0);
      setCategoryData([]);
      setInsights([]);
      setInsightSummary(emptyInsightSummary);
      setGroupVsPersonalData([]);
      setGroupVsPersonalSummary(emptyGroupVsPersonalSummary);
      setFriendSpending([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    refreshAnalytics(selectedMonth, selectedYear).finally(() => {
      setHasLoadedInitial(true);
    });
    // Run once on mount for full payload fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLoadedInitial) {
      return;
    }

    const refetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchCategoryData(selectedMonth, selectedYear);
      } catch (err: any) {
        setError(getErrorMessage(err));
        setCategoryGrandTotal(0);
        setCategoryData([]);
      } finally {
        setLoading(false);
      }
    };

    refetchCategoryData();
  }, [fetchCategoryData, hasLoadedInitial, selectedMonth, selectedYear]);

  return {
    loading,
    error,
    selectedMonth,
    selectedYear,
    activeChart,
    monthlyData,
    categoryGrandTotal,
    categoryData,
    insights,
    insightSummary,
    groupVsPersonalData,
    groupVsPersonalSummary,
    friendSpending,
    setSelectedMonth,
    setSelectedYear,
    setActiveChart,
    refreshAnalytics,
  };
};

export default useAnalytics;
