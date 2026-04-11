'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GroupDetail({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Roommates 2025</h1>
          <p className="text-slate-400">Group with 3 members</p>
        </div>
        <Link href="/groups">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Back to Groups
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Expenses</h2>
              <Link href={`/groups/${params.id}/expenses`}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Add Expense
                </Button>
              </Link>
            </div>
            <div className="text-slate-400 text-center py-8">
              No expenses yet. Add one to get started!
            </div>
          </Card>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <Link href={`/groups/${params.id}/balances`}>
              <h2 className="text-lg font-bold text-white">Balances</h2>
              <p className="text-slate-400 text-center py-8">View member balances</p>
            </Link>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <Link href={`/groups/${params.id}/timeline`}>
              <h2 className="text-lg font-bold text-white">Timeline</h2>
              <p className="text-slate-400 text-center py-8">View activity timeline</p>
            </Link>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
            <Link href={`/groups/${params.id}/settings`}>
              <h2 className="text-lg font-bold text-white">Settings</h2>
              <p className="text-slate-400 text-center py-8">Manage group settings</p>
            </Link>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
