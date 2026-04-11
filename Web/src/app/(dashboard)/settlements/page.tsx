'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Settlements() {
  const settlements = [
    {
      id: 1,
      payer: 'You',
      payee: 'Priya Patel',
      amount: '₹1,800',
      date: 'Today at 2:30 PM',
      status: 'pending',
      icon: '⏳',
    },
    {
      id: 2,
      payer: 'Arjun Sharma',
      payee: 'You',
      amount: '₹2,500',
      date: 'Yesterday',
      status: 'completed',
      icon: '✅',
    },
    {
      id: 3,
      payer: 'You',
      payee: 'Raj Kumar',
      amount: '₹950',
      date: '3 days ago',
      status: 'pending',
      icon: '⚠️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settlements</h1>
        <p className="text-slate-400">Manage your payments and receivables</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button className="px-4 py-2 font-semibold text-white border-b-2 border-violet-500">
          All
        </button>
        <button className="px-4 py-2 text-slate-400 hover:text-white">
          Pending
        </button>
        <button className="px-4 py-2 text-slate-400 hover:text-white">
          Completed
        </button>
      </div>

      {/* Settlements List */}
      <div className="space-y-4">
        {settlements.map((settlement) => (
          <Card key={settlement.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{settlement.icon}</span>
                <div>
                  <p className="font-semibold text-white">
                    {settlement.payer} → {settlement.payee}
                  </p>
                  <p className="text-sm text-slate-400">
                    {settlement.status === 'pending' ? 'Pending · ' : 'Completed · '}
                    {settlement.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-cyan-400">{settlement.amount}</p>
                {settlement.status === 'pending' && (
                  <Button
                    size="sm"
                    className="mt-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white"
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
