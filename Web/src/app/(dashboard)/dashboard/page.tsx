'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrendingUp, Plus, Users, Wallet, ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiCall } from '@/lib/api-client';

interface DashboardData {
  financial: {
    totalPersonal: number;
    totalGroup: number;
    totalGet: number;
    totalOwe: number;
    totalSettled: number;
  };
  tripCount: number;
  groupCount: number;
  upcomingSettlements: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate?: string;
  }>;
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    group?: string;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiCall('/analytics/dashboard');
        
        if (res.success && res.data) {
          setDashboardData(res.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const netBalance = (dashboardData?.financial.totalGet || 0) - (dashboardData?.financial.totalOwe || 0);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-br from-[#7C5CFC]/10 to-transparent rounded-2xl p-6 border border-[#7C5CFC]/10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent mb-2">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return 'Good morning 🌅';
            if (hour < 18) return 'Good afternoon ☀️';
            return 'Good evening 🌙';
          })()}
        </h1>
        <p className="text-[#8888AA]">
          {session?.user?.name ? `Welcome back, ${session.user.name.split(' ')[0]}!` : "Let's track your money smartly"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-[#3D1E1E] to-[#5F3232] border border-[#FF5F7E]/30 rounded-xl text-[#FF9999]">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#7C5CFC]/20 p-6 hover:border-[#7C5CFC]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">Total Spent</p>
              <p className="text-2xl font-bold text-[#F0F0FF] mt-2">
                {loading ? '₹---' : formatCurrency((dashboardData?.financial.totalPersonal || 0) + (dashboardData?.financial.totalGroup || 0))}
              </p>
              <p className="text-[#55556A] text-xs mt-1">
                Personal: {formatCurrency(dashboardData?.financial.totalPersonal || 0)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </Card>

        {/* You Owe */}
        <Card className="bg-gradient-to-br from-[#1F1517] to-[#0F0F1A] border border-[#FF5F7E]/20 p-6 hover:border-[#FF5F7E]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">You Owe</p>
              <p className="text-2xl font-bold text-[#FF9999] mt-2">
                {loading ? '₹---' : formatCurrency(dashboardData?.financial.totalOwe || 0)}
              </p>
              <p className="text-[#55556A] text-xs mt-1 flex items-center gap-1">
                <ArrowDownLeft size={12} /> Outgoing
              </p>
            </div>
            <div className="text-3xl">📤</div>
          </div>
        </Card>

        {/* You're Owed */}
        <Card className="bg-gradient-to-br from-[#152F1E] to-[#0F0F1A] border border-[#99FF99]/20 p-6 hover:border-[#99FF99]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">You Get</p>
              <p className="text-2xl font-bold text-[#99FF99] mt-2">
                {loading ? '₹---' : formatCurrency(dashboardData?.financial.totalGet || 0)}
              </p>
              <p className="text-[#55556A] text-xs mt-1 flex items-center gap-1">
                <ArrowUpRight size={12} /> Incoming
              </p>
            </div>
            <div className="text-3xl">📥</div>
          </div>
        </Card>

        {/* Net Balance */}
        <Card className={`bg-gradient-to-br ${
          netBalance >= 0
            ? 'from-[#152F1E] to-[#0F0F1A] border-[#99FF99]/20 hover:border-[#99FF99]/50'
            : 'from-[#1F1517] to-[#0F0F1A] border-[#FF5F7E]/20 hover:border-[#FF5F7E]/50'
        } border p-6 transition-colors`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">Net Balance</p>
              <p className={`text-2xl font-bold mt-2 ${netBalance >= 0 ? 'text-[#99FF99]' : 'text-[#FF9999]'}`}>
                {loading ? '₹---' : formatCurrency(Math.abs(netBalance))}
              </p>
              <p className="text-[#55556A] text-xs mt-1">
                {netBalance >= 0 ? 'You get back' : 'You owe total'}
              </p>
            </div>
            <div className="text-3xl">{netBalance >= 0 ? '✨' : '⚠️'}</div>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <div className="space-y-3">
          {dashboardData.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                alert.severity === 'high'
                  ? 'bg-[#3D1E1E]/50 border-[#FF5F7E]/30'
                  : alert.severity === 'medium'
                    ? 'bg-[#3D2E1E]/50 border-[#FFAA66]/30'
                    : 'bg-[#1E3D2E]/50 border-[#99FF99]/30'
              }`}
            >
              <Zap size={16} className={`mt-1 flex-shrink-0 ${
                alert.severity === 'high'
                  ? 'text-[#FF5F7E]'
                  : alert.severity === 'medium'
                    ? 'text-[#FFAA66]'
                    : 'text-[#99FF99]'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-[#F0F0FF]">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#F0F0FF]">Recent Expenses</h2>
            <Link href="/personal/add">
              <Button size="sm" className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] text-white">
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6 text-center text-[#8888AA]">
                Loading expenses...
              </Card>
            ) : dashboardData?.recentExpenses && dashboardData.recentExpenses.length > 0 ? (
              dashboardData.recentExpenses.map((expense) => (
                <Card key={expense.id} className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4 hover:border-[#7C5CFC]/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">💸</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#F0F0FF] truncate">{expense.description}</p>
                        <p className="text-xs text-[#8888AA]">
                          {new Date(expense.date).toLocaleDateString()} {expense.group ? ` • ${expense.group}` : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-right font-bold text-[#F0F0FF]">₹{expense.amount.toLocaleString('en-IN')}</p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-8 text-center">
                <p className="text-[#8888AA] mb-4">No expenses yet</p>
                <Link href="/personal/add">
                  <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] text-white">
                    Add Your First Expense
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Groups Overview */}
          <div>
            <h3 className="font-bold text-[#F0F0FF] mb-4 flex items-center gap-2">
              <Users size={18} /> Groups
            </h3>
            <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6 text-center">
              <p className="text-3xl font-bold text-[#7C5CFC] mb-2">
                {loading ? '...' : dashboardData?.tripCount || 0}
              </p>
              <p className="text-sm text-[#8888AA] mb-4">Active Groups</p>
              <Link href="/groups" className="w-full">
                <Button variant="outline" className="w-full border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF]">
                  View Groups
                </Button>
              </Link>
            </Card>
          </div>

          {/* Upcoming Settlements */}
          <div>
            <h3 className="font-bold text-[#F0F0FF] mb-4 flex items-center gap-2">
              <Wallet size={18} /> Settlements
            </h3>
            {dashboardData?.upcomingSettlements && dashboardData.upcomingSettlements.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.upcomingSettlements.slice(0, 3).map((settlement) => (
                  <Card key={settlement.id} className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#F0F0FF] truncate">{settlement.description}</p>
                      <p className="font-bold text-[#99FF99] text-sm">₹{settlement.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </Card>
                ))}
                <Link href="/settlements" className="w-full">
                  <Button variant="outline" className="w-full border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF] mt-2">
                    View All
                  </Button>
                </Link>
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4 text-center">
                <p className="text-sm text-[#8888AA]">All settled up! 🎉</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
