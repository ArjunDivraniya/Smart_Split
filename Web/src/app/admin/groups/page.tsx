'use client';

import { Card } from '@/components/ui/card';

export default function AdminGroups() {
  const groups = [
    {
      id: 1,
      name: 'Roommates 2025',
      members: 3,
      expenses: 45,
      settled: '₹45,000',
    },
    {
      id: 2,
      name: 'Dubai Trip',
      members: 5,
      expenses: 78,
      settled: '₹1,25,000',
    },
    {
      id: 3,
      name: 'Office Lunch Fund',
      members: 12,
      expenses: 156,
      settled: '₹2,00,000',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Groups Management</h1>
          <p className="text-slate-400">Overview of all active groups</p>
        </div>

        {/* Groups Table */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Group Name</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Members</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Expenses</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Amount Settled</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white font-semibold">{group.name}</td>
                    <td className="py-3 px-4 text-slate-300">{group.members}</td>
                    <td className="py-3 px-4 text-slate-300">{group.expenses}</td>
                    <td className="py-3 px-4 text-green-400 font-semibold">{group.settled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
