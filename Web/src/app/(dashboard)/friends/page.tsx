'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle, Send } from 'lucide-react';

export default function Friends() {
  const friends = [
    {
      id: 1,
      name: 'Arjun Sharma',
      status: 'owes you',
      amount: '₹2,500',
      color: 'green',
      avatar: '👨‍🎓',
    },
    {
      id: 2,
      name: 'Priya Patel',
      status: 'you owe',
      amount: '₹1,800',
      color: 'red',
      avatar: '👩‍💼',
    },
    {
      id: 3,
      name: 'Raj Kumar',
      status: 'settled',
      amount: '₹0',
      color: 'green',
      avatar: '👨‍💻',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Friends & Balances</h1>
        <p className="text-slate-400">See who owes you and who you owe</p>
      </div>

      {/* Friends List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map((friend) => (
          <Card key={friend.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{friend.avatar}</span>
                <div>
                  <p className="font-semibold text-white">{friend.name}</p>
                  <p className="text-sm text-slate-400 capitalize">{friend.status}</p>
                </div>
              </div>
              <p className={`font-bold text-lg ${
                friend.status === 'settled' ? 'text-green-400' :
                friend.status === 'owes you' ? 'text-green-400' : 'text-red-400'
              }`}>
                {friend.amount}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <MessageCircle size={16} className="mr-1" />
                Message
              </Button>
              {friend.status !== 'settled' && (
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white"
                >
                  <Send size={16} className="mr-1" />
                  Settle
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
