'use client';

import { Card } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: '12,500', change: '+2.5%' },
            { label: 'Active Groups', value: '3,200', change: '+5.2%' },
            { label: 'Total Settled', value: '₹2.5Cr', change: '+8.1%' },
            { label: 'Platform Fee', value: '₹15,000', change: '+3.4%' },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-green-400 text-xs mt-1">{stat.change}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
