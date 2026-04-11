'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Personal() {
  const expenses = [
    {
      id: 1,
      category: 'Food',
      amount: '₹450',
      date: 'Today',
      icon: '🍕',
    },
    {
      id: 2,
      category: 'Transport',
      amount: '₹150',
      date: 'Yesterday',
      icon: '🚕',
    },
    {
      id: 3,
      category: 'Shopping',
      amount: '₹2,500',
      date: '2 days ago',
      icon: '🛍️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Personal Expenses</h1>
          <p className="text-slate-400">Track your individual spending</p>
        </div>
        <Link href="/personal/add">
          <Button className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white">
            <Plus size={20} className="mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">This Month</p>
          <p className="text-2xl font-bold text-white mt-2">₹28,500</p>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">This Week</p>
          <p className="text-2xl font-bold text-white mt-2">₹3,100</p>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Today</p>
          <p className="text-2xl font-bold text-white mt-2">₹450</p>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Expenses</h2>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{expense.icon}</span>
                <div>
                  <p className="font-semibold text-white">{expense.category}</p>
                  <p className="text-sm text-slate-400">{expense.date}</p>
                </div>
              </div>
              <p className="font-semibold text-cyan-400">{expense.amount}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
