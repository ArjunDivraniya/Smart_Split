'use client';

import { Card } from '@/components/ui/card';

const features = [
  {
    icon: '👥',
    title: 'Group Splitting',
    description: 'Split any expense 4 ways and track balances easily',
  },
  {
    icon: '💰',
    title: 'Personal Tracking',
    description: 'Track daily expenses by category smartly',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'See exactly where your money goes',
  },
  {
    icon: '✅',
    title: 'Smart Settlement',
    description: 'Minimize transactions to settle efficiently',
  },
  {
    icon: '💳',
    title: 'Real UPI Payments',
    description: 'Pay via UPI or Razorpay in-app',
  },
  {
    icon: '🔔',
    title: 'Instant Alerts',
    description: 'Budget & settlement notifications',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Everything you need to manage money
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed for complete financial control
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-violet-500 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 p-6 group cursor-pointer"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
