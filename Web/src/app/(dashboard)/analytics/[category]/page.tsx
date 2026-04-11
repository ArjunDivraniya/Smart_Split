'use client';

import { Card } from '@/components/ui/card';

export default function AnalyticsByCategory({ params }: { params: { category: string } }) {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
      <h1 className="text-2xl font-bold text-white mb-4">
        {params.category.charAt(0).toUpperCase() + params.category.slice(1)} Analytics
      </h1>
      <p className="text-slate-400">Detailed analytics for {params.category}</p>
    </Card>
  );
}
