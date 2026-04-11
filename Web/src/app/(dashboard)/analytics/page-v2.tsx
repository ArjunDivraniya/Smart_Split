'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Download,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Loader,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiCall } from '@/lib/api-client';

interface Transaction {
  date: string;
  amount: number;
  category: string;
  type: 'group' | 'personal';
  description: string;
}

interface FriendSpendingData {
  friendId: string;
  friendName: string;
  totalShared: number;
}

interface AnalyticsData {
  currentMonthTotal: number;
  lastMonthTotal: number;
  currentMonthPersonal: number;
  currentMonthGroup: number;
  topCategory: { name: string; amount: number; emoji: string; percentage: number };
  categories: Array<{ name: string; emoji: string; amount: number; percentage: number; count: number }>;
  transactions: Transaction[];
  friendSpending: FriendSpendingData[];
  groupVsPersonal: { group: number; personal: number };
  insights: string[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍔',
  groceries: '🛒',
  transport: '🚕',
  entertainment: '🎬',
  shopping: '🛍️',
  utilities: '💡',
  health: '🏥',
  accommodation: '🏠',
  other: '📌',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: 'from-[#FF6B6B] to-[#FF8E8E]',
  groceries: 'from-[#6BCB77] to-[#8FE7EE]',
  transport: 'from-[#4ECDC4] to-[#6FE7D8]',
  entertainment: 'from-[#FFE66D] to-[#FFD93D]',
  shopping: 'from-[#95E5E5] to-[#80D8D8]',
  utilities: 'from-[#A0C4FF] to-[#BFDBFE]',
  health: 'from-[#FFB6C1] to-[#FFC9CC]',
  accommodation: 'from-[#DDA15E] to-[#EDB183]',
  other: 'from-[#D4A5A5] to-[#E8B8B8]',
};

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [chartMode, setChartMode] = useState<'combined' | 'split'>('combined');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [session?.user?.id, currentMonth]);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      setLoading(true);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const res = await apiCall(`/analytics/monthly?month=${month}&year=${year}`);
      
      if (res.success && res.data) {
        const data = res.data;
        
        // Calculate last month data for comparison
        const lastMonthDate = new Date(year, month - 2);
        const lastMonth = lastMonthDate.getMonth() + 1;
        const lastYear = lastMonthDate.getFullYear();
        
        const lastRes = await apiCall(`/analytics/monthly?month=${lastMonth}&year=${lastYear}`);
        const lastMonthTotal = (lastRes.success && lastRes.data?.totalExpenses) || 0;

        setAnalyticsData({
          currentMonthTotal: data.totalExpenses || 0,
          lastMonthTotal,
          currentMonthPersonal: data.personalExpenses || 0,
          currentMonthGroup: data.groupExpenses || 0,
          topCategory: data.topCategory || { name: 'Food', amount: 0, emoji: '🍔', percentage: 40 },
          categories: (data.categories || []).map((c: any) => ({
            name: c.name || 'Other',
            emoji: CATEGORY_EMOJIS[c.name?.toLowerCase()] || '📌',
            amount: c.amount || 0,
            percentage: c.percentage || 0,
            count: c.count || 0,
          })),
          transactions: data.transactions || [],
          friendSpending: data.friendSpending || [],
          groupVsPersonal: {
            group: data.groupExpenses || 0,
            personal: data.personalExpenses || 0,
          },
          insights: data.insights || [
            'Your top category this month',
            'Compare spending with last month',
            'Track group vs personal expenses',
          ],
        });
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  const handleExport = () => {
    if (!analyticsData) return;
    
    const csvContent = 'Category,Amount,Percentage\n' + 
      analyticsData.categories.map(c => `${c.name},${c.amount},${c.percentage}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${currentMonth.toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const percentageChange = useMemo(() => {
    if (analyticsData?.lastMonthTotal === 0) return 0;
    return ((analyticsData?.currentMonthTotal || 0 - analyticsData?.lastMonthTotal || 0) / (analyticsData?.lastMonthTotal || 1)) * 100;
  }, [analyticsData?.currentMonthTotal, analyticsData?.lastMonthTotal]);

  const maxCategoryAmount = useMemo(
    () => Math.max(...(analyticsData?.categories.map(c => c.amount) || [0])),
    [analyticsData?.categories]
  );

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-[#8888AA]">Track your spending patterns</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-[#1A1A2B]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Analytics
          </h1>
        </div>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <div className="flex gap-3 items-start">
            <AlertCircle size={20} className="text-[#FF9999] mt-0.5" />
            <div>
              <p className="font-semibold text-[#FF9999]">Error Loading Analytics</p>
              <p className="text-sm text-[#8888AA]">{error}</p>
              <Button onClick={handleRefresh} size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-[#8888AA]">Track your spending patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-[#1A1A2B] rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft size={20} className="text-[#8888AA]" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-[#1A1A2B] rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight size={20} className="text-[#8888AA]" />
          </button>
          <span className="text-[#F0F0FF] font-semibold min-w-[140px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-[#7C5CFC]/30 text-[#7C5CFC] hover:bg-[#7C5CFC]/10"
          >
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button
            onClick={handleRefresh}
            size="sm"
            disabled={refreshing}
            variant="ghost"
          >
            {refreshing ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <span>↻</span>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#7C5CFC]/10 to-transparent border border-[#7C5CFC]/30 p-6">
          <p className="text-[#8888AA] text-sm mb-2">This Month</p>
          <p className="text-3xl font-bold text-[#F0F0FF]">
            ₹{analyticsData.currentMonthTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#8888AA] mt-2">Total expenses</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-6">
          <p className="text-[#8888AA] text-sm mb-2">vs Last Month</p>
          <div className="flex items-center gap-2">
            {percentageChange >= 0 ? (
              <TrendingUp size={20} className="text-[#FF9999]" />
            ) : (
              <TrendingDown size={20} className="text-[#99FF99]" />
            )}
            <p className={`text-3xl font-bold ${
              percentageChange >= 0 ? 'text-[#FF9999]' : 'text-[#99FF99]'
            }`}>
              {Math.abs(percentageChange).toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-[#8888AA] mt-2">
            {percentageChange >= 0 ? '↑ increase' : '↓ decrease'}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-[#FF5F7E]/10 to-transparent border border-[#FF5F7E]/30 p-6">
          <p className="text-[#8888AA] text-sm mb-2">{analyticsData.topCategory.emoji} Top Category</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">{analyticsData.topCategory.name}</p>
          <p className="text-sm text-[#FF9999] font-semibold mt-2">
            ₹{analyticsData.topCategory.amount.toLocaleString('en-IN')} ({analyticsData.topCategory.percentage}%)
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-6">
          <p className="text-[#8888AA] text-sm mb-2">Personal / Group</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#7C5CFC]">
              {analyticsData.groupVsPersonal.personal ? analyticsData.groupVsPersonal.personal.toLocaleString('en-IN') : '₹0'}
            </span>
            <span className="text-xs text-[#8888AA]">/</span>
            <span className="text-2xl font-bold text-[#FF5F7E]">
              {analyticsData.groupVsPersonal.group ? analyticsData.groupVsPersonal.group.toLocaleString('en-IN') : '₹0'}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#F0F0FF]">Monthly Trend</h3>
            <Tabs value={chartMode} onValueChange={(v) => setChartMode(v as 'combined' | 'split')}>
              <TabsList className="bg-[#1A1A2B] border-[#2A2A3B]">
                <TabsTrigger value="combined">Combined</TabsTrigger>
                <TabsTrigger value="split">Split</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8888AA]">Group Expenses</span>
                <span className="text-sm font-semibold text-[#FF5F7E]">
                  ₹{analyticsData.currentMonthGroup.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#1A1A2B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5F7E] to-[#FF8899]"
                  style={{
                    width: `${Math.min(
                      100,
                      (analyticsData.currentMonthGroup /
                        Math.max(analyticsData.currentMonthTotal, 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8888AA]">Personal Expenses</span>
                <span className="text-sm font-semibold text-[#7C5CFC]">
                  ₹{analyticsData.currentMonthPersonal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#1A1A2B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#9B7FFF]"
                  style={{
                    width: `${Math.min(
                      100,
                      (analyticsData.currentMonthPersonal /
                        Math.max(analyticsData.currentMonthTotal, 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {chartMode === 'split' && (
            <div className="mt-4 p-3 bg-[#1A1A2B] rounded text-center text-sm text-[#8888AA]">
              Detailed split view - each transaction tracked separately
            </div>
          )}
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-6">
          <h3 className="text-lg font-bold text-[#F0F0FF] mb-4">Category Breakdown</h3>

          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#F0F0FF]">
                ₹{(analyticsData.currentMonthTotal / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-[#8888AA]">Total Spent</p>
            </div>
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {analyticsData.categories.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="p-2 hover:bg-[#1A1A2B] rounded transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{cat.emoji}</span>
                    <span className="text-sm text-[#F0F0FF] truncate">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#8888AA] flex-shrink-0 ml-2">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#2A2A3B] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${CATEGORY_COLORS[cat.name.toLowerCase()] || CATEGORY_COLORS.other}`}
                    style={{ width: `${(cat.amount / maxCategoryAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group vs Personal Pie */}
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-6">
          <h3 className="text-lg font-bold text-[#F0F0FF] mb-4">Group vs Personal Split</h3>

          <div className="space-y-4">
            {[
              {
                label: 'Group Expenses',
                value: analyticsData.currentMonthGroup,
                color: 'from-[#FF5F7E] to-[#FF8899]',
                percentage: analyticsData.currentMonthTotal 
                  ? ((analyticsData.currentMonthGroup / analyticsData.currentMonthTotal) * 100).toFixed(1)
                  : 0,
              },
              {
                label: 'Personal Expenses',
                value: analyticsData.currentMonthPersonal,
                color: 'from-[#7C5CFC] to-[#9B7FFF]',
                percentage: analyticsData.currentMonthTotal
                  ? ((analyticsData.currentMonthPersonal / analyticsData.currentMonthTotal) * 100).toFixed(1)
                  : 0,
              },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#F0F0FF]">{item.label}</span>
                  <span className="text-sm font-semibold text-[#F0F0FF]">{item.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-[#1A1A2B] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color}`}
                    style={{
                      width: `${Math.max(
                        5,
                        (item.value / Math.max(analyticsData.currentMonthTotal, 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-[#8888AA] mt-1">
                  ₹{item.value.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Friend Spending */}
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-6">
          <h3 className="text-lg font-bold text-[#F0F0FF] mb-4">You spend most with...</h3>

          {analyticsData.friendSpending.length === 0 ? (
            <p className="text-[#8888AA] text-sm">No shared expenses yet</p>
          ) : (
            <div className="space-y-3">
              {analyticsData.friendSpending.slice(0, 5).map((friend, idx) => {
                const maxFriendAmount = Math.max(
                  ...analyticsData.friendSpending.map(f => f.totalShared)
                );
                const percentage = maxFriendAmount 
                  ? ((friend.totalShared / maxFriendAmount) * 100).toFixed(0)
                  : 0;
                
                return (
                  <div key={friend.friendId || idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#F0F0FF] font-medium">{friend.friendName}</span>
                      <span className="text-sm font-semibold text-[#F0F0FF]">
                        ₹{friend.totalShared.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1A1A2B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#FF5F7E]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#7C5CFC]/10 to-transparent border border-[#7C5CFC]/30 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-semibold text-[#F0F0FF] text-sm">Spending Trend</p>
              <p className="text-xs text-[#8888AA] mt-1">
                {percentageChange >= 0 ? `Up ${Math.abs(percentageChange).toFixed(1)}%` : `Down ${Math.abs(percentageChange).toFixed(1)}%`} vs last month
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#FF5F7E]/10 to-transparent border border-[#FF5F7E]/30 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{analyticsData.topCategory.emoji}</span>
            <div>
              <p className="font-semibold text-[#F0F0FF] text-sm">Top Spending</p>
              <p className="text-xs text-[#8888AA] mt-1">
                {analyticsData.topCategory.name} ({analyticsData.topCategory.percentage}%)
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#99FF99]/10 to-transparent border border-[#99FF99]/30 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-semibold text-[#F0F0FF] text-sm">Shared Expenses</p>
              <p className="text-xs text-[#8888AA] mt-1">
                {analyticsData.friendSpending.length} friend{analyticsData.friendSpending.length !== 1 ? 's' : ''} involved
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
