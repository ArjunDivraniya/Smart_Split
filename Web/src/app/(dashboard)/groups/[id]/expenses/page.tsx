'use client';

import { Card } from '@/components/ui/card';

export default function GroupExpenses({ params }: { params: { id: string } }) {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Group Expenses</h1>
      <p className="text-slate-400">Expenses page for group {params.id}</p>
    </Card>
  );
}
