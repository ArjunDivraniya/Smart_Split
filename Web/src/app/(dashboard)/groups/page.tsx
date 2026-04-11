'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Archive,
  Download,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { apiCall } from '@/lib/api-client';

interface Group {
  id: string;
  name: string;
  type: 'trip' | 'college' | 'flatmates' | 'general';
  members: number;
  total: number;
  yourBalance: number;
  settled: boolean;
  icon: string;
  description?: string;
  lastUpdated?: string;
}

type ViewMode = 'card' | 'table';
type FilterTab = 'all' | 'active' | 'trips' | 'college' | 'settled' | 'archived';

const ICON_MAP: Record<string, string> = {
  trip: '✈️',
  college: '🎓',
  flatmates: '🏠',
  general: '👥',
};

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'balance' | 'recent'>('recent');

  useEffect(() => {
    fetchGroups();
  }, [session?.user?.id]);

  const fetchGroups = async () => {
    try {
      const res = await apiCall('/groups');
      if (res.success && res.data) {
        const formattedGroups = res.data.map((g: any) => ({
          id: g._id || g.id,
          name: g.name,
          type: g.type || 'general',
          members: g.members?.length || 0,
          total: g.totalSpent || 0,
          yourBalance: g.netBalance || 0,
          settled: !g.isActive || false,
          icon: ICON_MAP[g.type] || '👥',
          description: g.description,
          lastUpdated: g.createdAt,
        }));
        setGroups(formattedGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups
    .filter((g) => {
      switch (activeTab) {
        case 'active':
          return !g.settled;
        case 'trips':
          return g.type === 'trip';
        case 'college':
          return g.type === 'college';
        case 'settled':
          return g.settled;
        default:
          return true;
      }
    })
    .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'total':
          return b.total - a.total;
        case 'balance':
          return b.yourBalance - a.yourBalance;
        case 'recent':
          return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
        default:
          return 0;
      }
    });

  const toggleSelectAll = () => {
    if (selectedGroups.size === filteredGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(filteredGroups.map((g) => g.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedGroups(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Groups
          </h1>
          <p className="text-[#8888AA]">Manage your shared expenses</p>
        </div>
        <Link href="/groups/create">
          <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6DFF] hover:to-[#7B5CE5] text-white">
            <Plus size={20} className="mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888AA] size-4" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1A1A2B] border-[#2A2A3B] text-[#F0F0FF] placeholder-[#8888AA]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'card'
                ? 'bg-[#7C5CFC] text-white'
                : 'bg-[#1A1A2B] text-[#8888AA] hover:bg-[#2A2A3B]'
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-[#7C5CFC] text-white'
                : 'bg-[#1A1A2B] text-[#8888AA] hover:bg-[#2A2A3B]'
            }`}
          >
            <List size={20} />
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 bg-[#1A1A2B] border border-[#2A2A3B] text-[#F0F0FF] rounded-lg text-sm"
          >
            <option value="recent">Recent</option>
            <option value="name">Name</option>
            <option value="total">Total Spent</option>
            <option value="balance">Your Balance</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'active', 'trips', 'college', 'settled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as FilterTab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] text-white'
                : 'bg-[#1A1A2B] text-[#8888AA] hover:bg-[#2A2A3B]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedGroups.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-[#1A1A2B]/50 rounded-lg border border-[#2A2A3B]">
          <span className="text-sm text-[#8888AA]">
            {selectedGroups.size} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#8888AA] hover:text-[#F0F0FF]"
          >
            <Archive size={16} className="mr-2" />
            Archive
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#8888AA] hover:text-[#F0F0FF]"
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] hover:border-[#7C5CFC]/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-[#7C5CFC]/20 group">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{group.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#F0F0FF] truncate group-hover:text-[#7C5CFC] transition-colors">
                          {group.name}
                        </h3>
                        <p className="text-xs text-[#8888AA]">
                          {group.members} {group.members === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedGroups.has(group.id)}
                      onCheckedChange={() => toggleSelect(group.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="border-[#2A2A3B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-[#8888AA]">Total Spent</span>
                      <span className="text-lg font-bold text-[#F0F0FF]">
                        ₹{group.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-[#8888AA]">Your Balance</span>
                      <span
                        className={`font-bold text-lg ${
                          group.yourBalance < 0
                            ? 'text-[#FF9999]'
                            : group.yourBalance > 0
                              ? 'text-[#99FF99]'
                              : 'text-[#8888AA]'
                        }`}
                      >
                        {group.yourBalance < 0 ? '-' : group.yourBalance > 0 ? '+' : ''}
                        ₹{Math.abs(group.yourBalance).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1A1A2B]">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        group.settled
                          ? 'bg-[#2A4A2A] text-[#66FF66]'
                          : 'bg-[#4A3A2A] text-[#FFAA66]'
                      }`}
                    >
                      {group.settled ? '✅ Settled' : '⏳ Active'}
                    </span>
                    <ChevronRight size={16} className="text-[#8888AA] group-hover:text-[#7C5CFC] transition-colors" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-[#1A1A2B] rounded-lg bg-[#14141F]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A2B] bg-[#0F0F1A]">
                <th className="p-4 text-left">
                  <Checkbox
                    checked={selectedGroups.size === filteredGroups.length && filteredGroups.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-[#2A2A3B]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#8888AA]">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#8888AA]">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#8888AA]">Members</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[#8888AA]">Total</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[#8888AA]">Your Balance</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-[#8888AA]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr
                  key={group.id}
                  className="border-b border-[#1A1A2B] hover:bg-[#1A1A2B]/50 transition-colors"
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedGroups.has(group.id)}
                      onCheckedChange={() => toggleSelect(group.id)}
                      className="border-[#2A2A3B]"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/groups/${group.id}`}
                      className="flex items-center gap-2 text-[#F0F0FF] hover:text-[#7C5CFC] transition-colors"
                    >
                      <span className="text-lg">{group.icon}</span>
                      <span className="font-medium">{group.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-[#8888AA]">
                    <span className="capitalize text-sm">{group.type}</span>
                  </td>
                  <td className="px-6 py-3 text-[#8888AA]">{group.members}</td>
                  <td className="px-6 py-3 text-right text-[#F0F0FF] font-semibold">
                    ₹{group.total.toLocaleString('en-IN')}
                  </td>
                  <td
                    className={`px-6 py-3 text-right font-semibold ${
                      group.yourBalance < 0
                        ? 'text-[#FF9999]'
                        : group.yourBalance > 0
                          ? 'text-[#99FF99]'
                          : 'text-[#8888AA]'
                    }`}
                  >
                    {group.yourBalance < 0 ? '-' : group.yourBalance > 0 ? '+' : ''}
                    ₹{Math.abs(group.yourBalance).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded inline-block ${
                        group.settled
                          ? 'bg-[#2A4A2A] text-[#66FF66]'
                          : 'bg-[#4A3A2A] text-[#FFAA66]'
                      }`}
                    >
                      {group.settled ? 'Settled' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#8888AA] mb-4">No groups found</p>
          <Link href="/groups/create">
            <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6DFF] hover:to-[#7B5CE5] text-white">
              Create your first group
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
