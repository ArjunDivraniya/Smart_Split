'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AddExpense() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <Link href="/personal">
        <Button variant="ghost" className="text-slate-300 hover:text-white">
          <ArrowLeft size={16} className="mr-2" />
          Back to Personal
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Add Expense</h1>
        <p className="text-slate-400">Record a new personal expense</p>
      </div>

      {/* Form */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-2 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <select className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-2 focus:outline-none focus:border-violet-500">
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <input
              type="text"
              placeholder="Optional notes"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-2 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white">
              Add Expense
            </Button>
            <Link href="/personal">
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
