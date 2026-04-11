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
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { apiCall } from '@/lib/api-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

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
type SortKey = 'name' | 'total' | 'balance' | 'recent' | 'members';

const ICON_MAP: Record<string, string> = {
  trip: '✈️',
  college: '🎓',
  flatmates: '🏠',
  general: '👥',
};

const FILTER_TABS = [
  { id: 'all', label: 'All', count: (groups: Group[]) => groups.length },
  { id: 'active', label: 'Active', count: (groups: Group[]) => groups.filter(g => !g.settled).length },
  { id: 'trips', label: 'Trips', count: (groups: Group[]) => groups.filter(g => g.type === 'trip').length },
  { id: 'college', label: 'College', count: (groups: Group[]) => groups.filter(g => g.type === 'college').length },
  { id: 'settled', label: 'Settled', count: (groups: Group[]) => groups.filter(g => g.settled).length },
];

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
      toast({ title: 'Error loading groups', variant: 'destructive' });
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
      let aVal: any = a[sortBy as keyof Group];
      let bVal: any = b[sortBy as keyof Group];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleGroupSelection = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedGroups.size === filteredGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(filteredGroups.map(g => g.id)));
    }
  };

  const handleArchiveSelected = async () => {
    if (selectedGroups.size === 0) return;
    // Implementation would call archive API for each selected group
    toast({ title: `Archived ${selectedGroups.size} groups` });
    setSelectedGroups(new Set());
    fetchGroups();
  };

  const handleExportSelected = async () => {
    if (selectedGroups.size === 0) return;
    // Implementation would export selected groups as JSON/CSV
    toast({ title: `Exported ${selectedGroups.size} groups` });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortBy !== key) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#171727] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Groups
          </h1>
          <p className="text-[#8888AA] mt-1">Manage your shared expenses</p>
        </div>
        <Link href="/groups/create">
          <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#5C3AFF] hover:from-[#6B4DEB] hover:to-[#4C2AEF] text-white gap-2">
            <Plus size={18} />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Search and View Toggle */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-[#8888AA]" size={18} />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#171727] border-[#2A2A3B] text-white placeholder-[#8888AA]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('card')}
            className="bg-[#171727] border-[#2A2A3B]"
          >
            <LayoutGrid size={18} />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
            className="bg-[#171727] border-[#2A2A3B]"
          >
            <List size={18} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#2A2A3B] overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#7C5CFC] text-white'
                : 'border-transparent text-[#8888AA] hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-sm opacity-70">
              ({tab.count(groups)})
            </span>
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedGroups.size > 0 && (
        <div className="bg-[#171727] border border-[#2A2A3B] rounded-lg p-4 flex items-center justify-between">
          <span className="text-[#F0F0FF]">
            {selectedGroups.size} group{selectedGroups.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveSelected}
              className="gap-2"
            >
              <Archive size={16} />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              className="gap-2"
            >
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#8888AA]">No groups found</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="bg-gradient-to-br from-[#1A1A2B] to-[#171727] border-[#2A2A3B] hover:border-[#7C5CFC] transition-all cursor-pointer h-full">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-4xl mb-2">{group.icon}</div>
                      <h3 className="text-lg font-bold text-white">{group.name}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="text-[#8888AA]">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#171727] border-[#2A2A3B]">
                        <DropdownMenuItem className="text-[#F0F0FF]">Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-[#FF5F7E]">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="text-sm text-[#8888AA]">
                    {group.members} member{group.members !== 1 ? 's' : ''}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-[#2A2A3B]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8888AA]">Total</span>
                      <span className="font-bold text-white">
                        {formatCurrency(group.total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8888AA]">Your Balance</span>
                      <span className={`font-bold ${
                        group.yourBalance > 0 ? 'text-[#00E5B0]' : 
                        group.yourBalance < 0 ? 'text-[#FF5F7E]' : 
                        'text-[#8888AA]'
                      }`}>
                        {group.yourBalance > 0 ? '+' : ''}
                        {formatCurrency(group.yourBalance)}
                      </span>
                    </div>
                  </div>

                  {group.settled && (
                    <div className="flex items-center gap-2 text-[#00E5B0] text-sm">
                      ✓ Settled
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="border border-[#2A2A3B] rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-[#171727] border-b border-[#2A2A3B]">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedGroups.size === filteredGroups.length && filteredGroups.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'name') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('name');
                      setSortOrder('asc');
                    }
                  }}
                >
                  Name {getSortIcon('name')}
                </TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-white text-right"
                  onClick={() => {
                    if (sortBy === 'members') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('members');
                      setSortOrder('desc');
                    }
                  }}
                >
                  Members {getSortIcon('members')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-white text-right"
                  onClick={() => {
                    if (sortBy === 'total') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('total');
                      setSortOrder('desc');
                    }
                  }}
                >
                  Total {getSortIcon('total')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-white text-right"
                  onClick={() => {
                    if (sortBy === 'balance') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('balance');
                      setSortOrder('desc');
                    }
                  }}
                >
                  Your Balance {getSortIcon('balance')}
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow
                  key={group.id}
                  className="border-b border-[#2A2A3B] hover:bg-[#171727]/50 cursor-pointer"
                  onClick={() => {
                    // Navigate on row click but not on checkbox
                  }}
                >
                  <TableCell
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroupSelection(group.id);
                    }}
                  >
                    <Checkbox
                      checked={selectedGroups.has(group.id)}
                      onCheckedChange={() => toggleGroupSelection(group.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/groups/${group.id}`} className="hover:text-[#7C5CFC] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.icon}</span>
                        <span className="font-medium text-white">{group.name}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center text-[#8888AA] capitalize">
                    {group.type}
                  </TableCell>
                  <TableCell className="text-right text-[#8888AA]">
                    {group.members}
                  </TableCell>
                  <TableCell className="text-right font-medium text-white">
                    {formatCurrency(group.total)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={
                      group.yourBalance > 0 ? 'text-[#00E5B0]' : 
                      group.yourBalance < 0 ? 'text-[#FF5F7E]' : 
                      'text-[#8888AA]'
                    }>
                      {group.yourBalance > 0 ? '+' : ''}
                      {formatCurrency(group.yourBalance)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {group.settled ? (
                      <span className="text-[#00E5B0]">✓ Settled</span>
                    ) : (
                      <span className="text-[#FFB547]">Active</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
