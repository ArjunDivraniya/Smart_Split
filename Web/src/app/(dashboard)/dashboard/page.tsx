'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrendingUp, Plus, Users, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiCall } from '@/lib/api-client';

interface DashboardStats {
  totalExpenses: number;
  youOwe: number;
  youOwed: number;
  budgetLeft?: number;
  totalBudget?: number;
  groupCount: number;
  settlementsPending: number;
  peopleOweYou: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch dashboard summary from backend
        const analyticsRes = await apiCall('/analytics/dashboard');
        
        if (analyticsRes.success && analyticsRes.data) {
          const data = analyticsRes.data;
          setStats({
            totalExpenses: data.financial?.monthlySpend || 0,
            youOwe: data.financial?.totalOwe || 0,
            youOwed: data.financial?.totalGet || 0,
            budgetLeft: 0,
            totalBudget: 0,
            groupCount: data.tripCount || 0,
            settlementsPending: data.financial?.totalOwe > 0 ? 1 : 0,
            peopleOweYou: data.financial?.totalGet > 0 ? 1 : 0,
          });
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-[#3D1E1E] to-[#5F3232] border border-[#5F3232] rounded-xl text-[#FF9999] shadow-lg shadow-red-500/10">
          {error}
        </div>
      )}

      {/* Header Section with Gradient - Mobile Style */}
      <div className="mb-8 bg-gradient-to-br from-[#7C5CFC]/10 to-transparent rounded-2xl p-6 border border-[#7C5CFC]/10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent mb-2">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return 'Good morning 🌅';
            if (hour < 18) return 'Good afternoon ☀️';
            return 'Good evening 🌙';
          })()}
        </h1>
        <p className="text-[#8888AA]">Let's track your money smartly</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#7C5CFC]/20 p-6 shadow-lg shadow-[#7C5CFC]/10 hover:shadow-[#7C5CFC]/20 transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">Total Expenses</p>
              <p className="text-2xl font-bold text-[#F0F0FF] mt-2">
                {loading ? '...' : formatCurrency(stats?.totalExpenses || 0)}
              </p>
              <p className="text-[#55556A] text-xs mt-1">{stats?.groupCount || 0} active groups</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#1F1517] to-[#0F0F1A] border border-[#FF5F7E]/20 p-6 shadow-lg shadow-[#FF5F7E]/10 hover:shadow-[#FF5F7E]/20 transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">You Owe</p>
              <p className="text-2xl font-bold text-[#FF5F7E] mt-2">
                {loading ? '...' : formatCurrency(stats?.youOwe || 0)}
              </p>
              <p className="text-[#55556A] text-xs mt-1">{stats?.settlementsPending || 0} pending settlements</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#152F1E] to-[#0F0F1A] border border-[#00E5B0]/20 p-6 shadow-lg shadow-[#00E5B0]/10 hover:shadow-[#00E5B0]/20 transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">You're Owed</p>
              <p className="text-2xl font-bold text-[#00E5B0] mt-2">
                {loading ? '...' : formatCurrency(stats?.youOwed || 0)}
              </p>
              <p className="text-[#55556A] text-xs mt-1">{stats?.peopleOweYou || 0} people owe you</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#152940] to-[#0F0F1A] border border-[#38BDF8]/20 p-6 shadow-lg shadow-[#38BDF8]/10 hover:shadow-[#38BDF8]/20 transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8888AA] text-sm font-semibold">Budget Left</p>
              <p className="text-2xl font-bold text-[#38BDF8] mt-2">
                {loading ? '...' : formatCurrency(stats?.budgetLeft || 0)}
              </p>
              <p className="text-[#55556A] text-xs mt-1">Out of {formatCurrency(stats?.totalBudget || 0)}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions with Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/groups/create">
          <Button className="w-full bg-gradient-to-br from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6CFF] hover:to-[#5A3FD5] text-white h-12 font-semibold shadow-lg shadow-[#7C5CFC]/30 transition-all hover:shadow-[#7C5CFC]/50">
            <Plus size={20} className="mr-2" />
            New Group
          </Button>
        </Link>

        <Link href="/personal/add">
          <Button className="w-full bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] hover:from-[#5ACBFF] hover:to-[#06B6D4] text-white h-12 font-semibold shadow-lg shadow-[#38BDF8]/30 transition-all hover:shadow-[#38BDF8]/50">
            <Plus size={20} className="mr-2" />
            Add Expense
          </Button>
        </Link>

        <Link href="/settlements">
          <Button className="w-full bg-gradient-to-br from-[#FFB547] to-[#E59F29] hover:from-[#FFC86E] hover:to-[#D48F1D] text-white h-12 font-semibold shadow-lg shadow-[#FFB547]/30 transition-all hover:shadow-[#FFB547]/50">
            <Wallet size={20} className="mr-2" />
            Settle Up
          </Button>
        </Link>

        <Link href="/analytics">
          <Button className="w-full bg-gradient-to-br from-[#00E5B0] to-[#00B895] hover:from-[#26F0C4] hover:to-[#009977] text-black h-12 font-semibold shadow-lg shadow-[#00E5B0]/30 transition-all hover:shadow-[#00E5B0]/50">
            <TrendingUp size={20} className="mr-2" />
            Analytics
          </Button>
        </Link>
      </div>

      {/* Recent Groups with Gradient Header */}
      <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-6 shadow-xl shadow-[#1A1A2B]/50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <Users size={24} />
          Recent Groups
        </h2>
        <div className="space-y-3">
          {[
            { name: 'Roommates 2025', members: 3, balance: '+₹2,500' },
            { name: 'Dubai Trip', members: 5, balance: '-₹3,200' },
            { name: 'Office Lunch Fund', members: 8, balance: '₹0 (settled)' },
          ].map((group, idx) => (
            <Link key={idx} href={`/groups/${idx}`}>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0F0F1A] to-[#14141F] rounded-xl hover:from-[#1A1A2B] hover:to-[#0F0F1A] transition-all cursor-pointer border border-[#1A1A2B] hover:border-[#7C5CFC]/30 shadow-md hover:shadow-lg hover:shadow-[#7C5CFC]/10">
                <div>
                  <p className="font-semibold text-[#F0F0FF]">{group.name}</p>
                  <p className="text-sm text-[#8888AA]">{group.members} members</p>
                </div>
                <p className={`font-bold ${
                  group.balance.includes('settled') ? 'text-[#00E5B0]' :
                  group.balance.startsWith('+') ? 'text-[#00E5B0]' : 'text-[#FF5F7E]'
                }`}>
                  {group.balance}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
