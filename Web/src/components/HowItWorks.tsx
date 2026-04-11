'use client';

import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Create a Group',
    description: 'Add members and set budget limits',
    icon: '📱',
  },
  {
    number: 2,
    title: 'Add Expenses',
    description: 'Split 4 ways and auto-calculate',
    icon: '💸',
  },
  {
    number: 3,
    title: 'Settle Up',
    description: 'Pay via UPI and confirm',
    icon: '✅',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">How it works</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Three simple steps to start managing shared expenses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8 text-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </Card>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="text-violet-500" size={32} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
