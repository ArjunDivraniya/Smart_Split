'use client';

import { Card } from '@/components/ui/card';
import { Bell, Mail, Package } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'settlement',
      title: 'Priya Patel settled ₹1,800',
      message: 'Payment received via UPI',
      time: '2 hours ago',
      icon: '✅',
    },
    {
      id: 2,
      type: 'budget',
      title: 'Budget alert: Food (71%)',
      message: 'You\'ve spent ₹7,100 of your ₹10,000 food budget',
      time: '4 hours ago',
      icon: '⚠️',
    },
    {
      id: 3,
      type: 'expense',
      title: 'Expense added in Roommates',
      message: 'Arjun added ₹2,500 rent expense',
      time: '1 day ago',
      icon: '💸',
    },
    {
      id: 4,
      type: 'settlement',
      title: 'You owe Raj Kumar ₹950',
      message: 'From Dubai Trip group',
      time: '3 days ago',
      icon: '📧',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400">Stay updated on settlements and budgets</p>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4 hover:border-violet-500 transition-colors cursor-pointer">
            <div className="flex gap-4">
              <span className="text-2xl">{notification.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-white">{notification.title}</p>
                <p className="text-sm text-slate-400">{notification.message}</p>
                <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
