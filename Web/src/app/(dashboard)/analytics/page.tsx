'use client';

import { Card } from '@/components/ui/card';

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400">Get insights into your spending patterns</p>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 h-80">
          <h2 className="text-lg font-bold text-white mb-4">Spending by Category</h2>
          <div className="h-64 flex items-center justify-center text-slate-400">
            📊 Pie Chart Component
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 h-80">
          <h2 className="text-lg font-bold text-white mb-4">Spending Trends</h2>
          <div className="h-64 flex items-center justify-center text-slate-400">
            📈 Line Chart Component
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Category Breakdown</h2>
        <div className="space-y-3">
          {[
            { category: 'Food', amount: '₹8,500', percentage: 30 },
            { category: 'Transport', amount: '₹5,200', percentage: 18 },
            { category: 'Shopping', amount: '₹7,800', percentage: 27 },
            { category: 'Entertainment', amount: '₹4,000', percentage: 14 },
            { category: 'Others', amount: '₹3,000', percentage: 11 },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">{item.category}</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-cyan-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <p className="font-semibold text-white">{item.amount}</p>
                <p className="text-sm text-slate-400">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
