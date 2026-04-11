'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';

export default function Groups() {
  const groups = [
    {
      id: 1,
      name: 'Roommates 2025',
      members: ['You', 'Arjun', 'Priya'],
      balance: '+₹2,500',
      lastExpense: '2 days ago',
    },
    {
      id: 2,
      name: 'Dubai Trip',
      members: ['You', 'Arjun', 'Priya', 'Raj', 'Ananya'],
      balance: '-₹3,200',
      lastExpense: '1 week ago',
    },
    {
      id: 3,
      name: 'Office Lunch Fund',
      members: ['You', 'Team...'],
      balance: '₹0 (settled)',
      lastExpense: '3 weeks ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Groups</h1>
          <p className="text-slate-400">Manage your shared expenses</p>
        </div>
        <Link href="/groups/create">
          <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
            <Plus size={20} className="mr-2" />
            New Group
          </Button>
        </Link>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 hover:border-violet-500 transition-all group/card cursor-pointer">
            <Link href={`/groups/${group.id}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{group.name}</h3>
                    <p className="text-sm text-slate-400">{group.members.length} members</p>
                  </div>
                  <p className={`font-semibold text-right ${
                    group.balance.includes('settled') ? 'text-green-400' :
                    group.balance.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {group.balance}
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-2">Members</p>
                  <div className="flex flex-wrap gap-2">
                    {group.members.slice(0, 3).map((member, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-200">
                        {member}
                      </span>
                    ))}
                    {group.members.length > 3 && (
                      <span className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-200">
                        +{group.members.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500">Last expense: {group.lastExpense}</p>

                <div className="flex gap-2 pt-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    <ChevronRight size={16} className="mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-600/30 text-red-400 hover:bg-red-950/20">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-white mb-2">No groups yet</h2>
          <p className="text-slate-400 mb-6">Create your first group to start splitting expenses</p>
          <Link href="/groups/create">
            <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
              Create Group
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
