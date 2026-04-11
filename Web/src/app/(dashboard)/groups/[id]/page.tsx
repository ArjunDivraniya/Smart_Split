'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Trash2,
  FileText,
  Printer,
  Check,
  AlertCircle,
  Download,
  ArrowRight,
  UserPlus,
  Settings,
  Copy,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiCall } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  balance: number; // negative = they owe, positive = they get
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  category: string;
  date: string;
  splitTally: Record<string, number>;
}

interface GroupDetail {
  id: string;
  name: string;
  description?: string;
  type: string;
  icon: string;
  totalSpent: number;
  perPerson: number;
  yourBalance: number;
  members: GroupMember[];
  expenses: Expense[];
  settled: boolean;
}

export default function GroupDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupDetail();
  }, [params.id, session?.user?.id]);

  const fetchGroupDetail = async () => {
    try {
      const res = await apiCall(`/groups/${params.id}`);
      if (res.success && res.data) {
        const g = res.data;
        const members = g.members || [];
        const totalSpent = g.totalSpent || 0;
        const perPerson = members.length > 0 ? Math.round(totalSpent / members.length) : 0;
        
        setGroup({
          id: g._id || g.id,
          name: g.name,
          description: g.description,
          type: g.type,
          icon: getIcon(g.type),
          totalSpent: totalSpent,
          perPerson: perPerson,
          yourBalance: g.netBalance || 0,
          members: members.map((m: any) => ({
            id: m._id || m.id,
            name: m.name || m.userId?.name || 'Unknown',
            email: m.email || m.userId?.email || '',
            balance: m.balance || 0,
          })),
          expenses: (g.expenses || []).map((e: any) => ({
            id: e._id || e.id,
            description: e.description,
            amount: e.amount,
            paidBy: e.paidBy,
            category: e.category,
            date: e.date,
            splitTally: e.splitTally || {},
          })),
          settled: !g.isActive || false,
        });
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      trip: '✈️',
      college: '🎓',
      flatmates: '🏠',
      general: '👥',
    };
    return icons[type] || '👥';
  };

  const toggleSelectExpense = (id: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExpenses(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#8888AA]">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8888AA] mb-4">Group not found</p>
        <Link href="/groups">
          <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5]">
            Back to Groups
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/groups">
            <button className="p-2 hover:bg-[#1A1A2B] rounded-lg transition-colors text-[#8888AA] hover:text-[#F0F0FF]">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{group.icon}</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
                {group.name}
              </h1>
            </div>
            <p className="text-[#8888AA]">
              {group.members.length} {group.members.length === 1 ? 'member' : 'members'} · ₹{group.totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-[#1A1A2B] rounded-lg transition-colors">
          <MoreVertical size={24} className="text-[#8888AA]" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <div className="space-y-2">
            <p className="text-sm text-[#8888AA]">Total Spent</p>
            <p className="text-3xl font-bold text-[#F0F0FF]">
              ₹{group.totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <div className="space-y-2">
            <p className="text-sm text-[#8888AA]">Per Person</p>
            <p className="text-3xl font-bold text-[#F0F0FF]">
              ₹{group.perPerson.toLocaleString('en-IN')}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <div className="space-y-2">
            <p className="text-sm text-[#8888AA]">Your Balance</p>
            <p
              className={`text-3xl font-bold ${
                group.yourBalance < 0
                  ? 'text-[#FF9999]'
                  : group.yourBalance > 0
                    ? 'text-[#99FF99]'
                    : 'text-[#8888AA]'
              }`}
            >
              {group.yourBalance < 0 ? '-' : group.yourBalance > 0 ? '+' : ''}
              ₹{Math.abs(group.yourBalance).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#8888AA]">
              {group.yourBalance < 0 ? 'You owe' : group.yourBalance > 0 ? 'You get' : 'Settled'}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#1A1A2B] border border-[#2A2A3B]">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Expenses Tab - Split View */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expenses List - 65% */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#F0F0FF]">Expenses</h2>
                <Link href={`/groups/${params.id}/expenses/add`}>
                  <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6DFF] hover:to-[#7B5CE5] text-white">
                    <Plus size={16} className="mr-2" />
                    Add Expense
                  </Button>
                </Link>
              </div>

              {/* Expense Items */}
              <div className="space-y-3">
                {group.expenses.length === 0 ? (
                  <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-8 text-center">
                    <p className="text-[#8888AA]">No expenses yet</p>
                  </Card>
                ) : (
                  group.expenses.map((expense) => (
                    <Card
                      key={expense.id}
                      className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4 hover:border-[#7C5CFC]/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedExpenses.has(expense.id)}
                          onCheckedChange={() => toggleSelectExpense(expense.id)}
                          className="border-[#2A2A3B]"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#F0F0FF]">{expense.description}</h3>
                          <p className="text-xs text-[#8888AA]">
                            {expense.paidBy} paid · {new Date(expense.date).toLocaleDateString()} · {Object.keys(expense.splitTally).length} people
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#F0F0FF]">₹{expense.amount.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-[#8888AA]">{expense.category}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Bulk Actions */}
              {selectedExpenses.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[#1A1A2B]/50 rounded-lg border border-[#2A2A3B]">
                  <span className="text-xs text-[#8888AA]">{selectedExpenses.size} selected</span>
                  <Button variant="ghost" size="sm" className="text-[#FF9999]">
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Members & Quick Actions - 35% */}
            <div className="space-y-6">
              {/* Members */}
              <div>
                <h3 className="font-bold text-[#F0F0FF] mb-4">Members</h3>
                <div className="space-y-3">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-gradient-to-br from-[#14141F] to-[#0F0F1A] rounded-lg border border-[#1A1A2B]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[#F0F0FF] truncate">{member.name}</p>
                            <p className="text-xs text-[#8888AA] truncate">{member.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {member.balance === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#66FF66]">
                            <Check size={12} /> Settled
                          </span>
                        ) : member.balance < 0 ? (
                          <p className="text-sm font-bold text-[#FF9999]">
                            Owes ₹{Math.abs(member.balance).toLocaleString('en-IN')}
                          </p>
                        ) : (
                          <p className="text-sm font-bold text-[#99FF99]">
                            Gets ₹{member.balance.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF]">
                  <Plus size={14} className="mr-2" />
                  Add Member
                </Button>
              </div>

              {/* Quick Settle */}
              {group.members.some((m) => m.balance < 0) && (
                <div className="p-4 bg-gradient-to-br from-[#4A3A2A] to-[#3A2A1A] rounded-lg border border-[#5F3232]">
                  <h4 className="font-semibold text-[#FFAA66] mb-3 flex items-center gap-2">
                    <AlertCircle size={16} /> Quick Settle
                  </h4>
                  <div className="space-y-2 text-sm">
                    {group.members
                      .filter((m) => m.balance < 0)
                      .map((member) => (
                        <div key={member.id} className="flex justify-between items-center">
                          <span className="text-[#CCAA88]">{member.name} owes</span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6DFF] hover:to-[#7B5CE5] text-white text-xs"
                          >
                            Collect ₹{Math.abs(member.balance).toLocaleString('en-IN')}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances">
          <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
            <p className="text-[#8888AA]">Balances view coming soon</p>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
            <p className="text-[#8888AA]">Timeline view coming soon</p>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5]">
                <FileText size={16} className="mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" className="border-[#2A2A3B] text-[#8888AA]">
                <Printer size={16} className="mr-2" />
                Print
              </Button>
            </div>
            <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
              <p className="text-[#8888AA]">Summary view coming soon</p>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
            <p className="text-[#8888AA]">Settings coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
