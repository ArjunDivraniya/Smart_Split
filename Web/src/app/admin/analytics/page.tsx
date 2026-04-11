'use client';

import { Card } from '@/components/ui/card';

export default function AdminAnalytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
          <p className="text-slate-400">Detailed system metrics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'DAU', value: '8,250' },
            { label: 'MAU', value: '45,300' },
            { label: 'Avg. Group Size', value: '4.2' },
            { label: 'Platform Revenue', value: '₹1,25,000' },
          ].map((metric, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">{metric.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts Placeholder */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 h-96">
          <h2 className="text-lg font-bold text-white mb-4">Revenue Trends</h2>
          <div className="h-80 flex items-center justify-center text-slate-400">
            📈 Revenue Chart Component
          </div>
        </Card>
      </div>
    </div>
  );
}
