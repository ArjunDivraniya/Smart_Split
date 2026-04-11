'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SetBudget() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <Link href="/budget">
        <Button variant="ghost" className="text-slate-300 hover:text-white">
          <ArrowLeft size={16} className="mr-2" />
          Back to Budget
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Set Budget</h1>
        <p className="text-slate-400">Configure category budgets</p>
      </div>

      {/* Form */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <form className="space-y-4">
          {['Food', 'Transport', 'Shopping', 'Entertainment', 'Others'].map((category) => (
            <div key={category}>
              <label className="block text-sm font-medium text-white mb-2">{category}</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-2"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
              Save Budgets
            </Button>
            <Link href="/budget">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
