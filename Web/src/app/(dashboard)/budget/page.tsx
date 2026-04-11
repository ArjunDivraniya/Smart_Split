'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Budget() {
  const [monthlyBudget, setMonthlyBudget] = useState('40000');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Budget Management</h1>
        <p className="text-slate-400">Set and track spending limits</p>
      </div>

      {/* Current Budget */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Monthly Budget</h2>
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm mb-2">Set your monthly limit</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter amount"
              />
              <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
                Save
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between mb-2">
              <span className="text-slate-300">Progress</span>
              <span className="text-white font-semibold">₹28,500 / ₹40,000</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4">
              <div className="bg-gradient-to-r from-violet-600 to-cyan-600 h-4 rounded-full" style={{ width: '71%' }} />
            </div>
            <p className="text-sm text-slate-400 mt-2">₹11,500 remaining this month</p>
          </div>
        </div>
      </Card>

      {/* Category Budgets */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Budget by Category</h2>
        <div className="space-y-4">
          {[
            { category: 'Food', spent: 8500, limit: 10000 },
            { category: 'Transport', spent: 5200, limit: 7000 },
            { category: 'Shopping', spent: 7800, limit: 12000 },
            { category: 'Entertainment', spent: 4000, limit: 5000 },
            { category: 'Others', spent: 3000, limit: 6000 },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between">
                <p className="font-semibold text-white">{item.category}</p>
                <p className="text-slate-400">₹{item.spent} / ₹{item.limit}</p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.spent / item.limit > 0.8
                      ? 'bg-red-500'
                      : item.spent / item.limit > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${(item.spent / item.limit) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
