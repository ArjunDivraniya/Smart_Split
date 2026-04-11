'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateGroup() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'INR',
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <Link href="/groups">
        <Button variant="ghost" className="text-slate-300 hover:text-white">
          <ArrowLeft size={16} className="mr-2" />
          Back to Groups
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Create New Group</h1>
        <p className="text-slate-400">Start splitting expenses with your friends</p>
      </div>

      {/* Form */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Group Name</label>
            <Input
              placeholder="e.g., Roommates 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description (Optional)</label>
            <textarea
              placeholder="What's this group for?"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 p-3 focus:outline-none focus:border-violet-500"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white p-2 focus:outline-none focus:border-violet-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white">
              Create Group
            </Button>
            <Link href="/groups">
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
