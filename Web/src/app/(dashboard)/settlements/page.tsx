'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChevronDown,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  Archive,
  Share2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
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
import { apiCall } from '@/lib/api-client';

interface Settlement {
  id: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  groupId?: string;
  groupName?: string;
  amount: number;
  remaining?: number;
  status: 'pending' | 'overdue' | 'completed' | 'partial';
  direction: 'you_owe' | 'they_owe';
  createdAt: string;
  dueAt?: string;
  method?: 'cash' | 'upi' | 'bank';
  notes?: string;
}

interface SettlementSummary {
  totalYouOwe: number;
  totalTheyOwe: number;
  netBalance: number;
  pendingCount: number;
  overdueCount: number;
  partialCount: number;
  totalCount: number;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; badge: string }> = {
  pending: {
    icon: <Clock size={16} />,
    color: 'text-[#FFB366]',
    badge: 'bg-[#FFB366]/20 text-[#FFB366] border-[#FFB366]/30',
  },
  overdue: {
    icon: <AlertTriangle size={16} />,
    color: 'text-[#FF9999]',
    badge: 'bg-[#FF9999]/20 text-[#FF9999] border-[#FF9999]/30',
  },
  completed: {
    icon: <CheckCircle size={16} />,
    color: 'text-[#99FF99]',
    badge: 'bg-[#99FF99]/20 text-[#99FF99] border-[#99FF99]/30',
  },
  partial: {
    icon: <AlertCircle size={16} />,
    color: 'text-[#7C5CFC]',
    badge: 'bg-[#7C5CFC]/20 text-[#7C5CFC] border-[#7C5CFC]/30',
  },
};

export default function SettlementsPage() {
  const { data: session } = useSession();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'overdue' | 'completed' | 'partial'>('all');
  const [activeDirection, setActiveDirection] = useState<'all' | 'you_owe' | 'they_owe'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSettlements();
  }, [session?.user?.id]);

  const fetchSettlements = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const res = await apiCall('/settlements');
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : res.data.settlements || [];
        setSettlements(data);

        // Calculate summary
        const summary: SettlementSummary = {
          totalYouOwe: 0,
          totalTheyOwe: 0,
          netBalance: 0,
          pendingCount: 0,
          overdueCount: 0,
          partialCount: 0,
          totalCount: data.length,
        };

        data.forEach((s: Settlement) => {
          const remaining = s.remaining || s.amount;
          if (s.direction === 'you_owe') {
            summary.totalYouOwe += remaining;
          } else {
            summary.totalTheyOwe += remaining;
          }
          
          if (s.status === 'pending') summary.pendingCount++;
          if (s.status === 'overdue') summary.overdueCount++;
          if (s.status === 'partial') summary.partialCount++;
        });

        summary.netBalance = summary.totalTheyOwe - summary.totalYouOwe;
        setSummary(summary);
      }
    } catch (err) {
      console.error('Error fetching settlements:', err);
      setError('Failed to load settlements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredSettlements = useMemo(() => {
    let filtered = settlements;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === activeFilter);
    }

    // Apply direction filter
    if (activeDirection !== 'all') {
      filtered = filtered.filter((s) => s.direction === activeDirection);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [settlements, activeFilter, activeDirection]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSettlements.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newIds = new Set(selectedIds);
    if (checked) {
      newIds.add(id);
    } else {
      newIds.delete(id);
    }
    setSelectedIds(newIds);
  };

  const handleSettleSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      // Batch settle selected settlements
      await apiCall('/settlements/settle-batch', 'POST', {
        settlementIds: Array.from(selectedIds),
      });
      setSelectedIds(new Set());
      await fetchSettlements();
    } catch (err) {
      console.error('Error settling:', err);
      setError('Failed to settle selected payments');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Friend', 'Amount', 'Group', 'Status', 'Direction', 'Days'];
    const rows = filteredSettlements.map((s) => {
      const days = Math.floor((Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return [
        s.friendName,
        s.remaining || s.amount,
        s.groupName || 'Personal',
        s.status,
        s.direction === 'you_owe' ? 'You Owe' : 'They Owe',
        days,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settlements-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading && settlements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Settlements
          </h1>
          <p className="text-[#8888AA]">Manage your payments and receivables</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 bg-[#1A1A2B]" />
          ))}
        </div>
      </div>
    );
  }

  if (error && settlements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Settlements
          </h1>
        </div>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <div className="flex gap-3 items-start">
            <AlertCircle size={20} className="text-[#FF9999] mt-0.5" />
            <div>
              <p className="font-semibold text-[#FF9999]">Error Loading Settlements</p>
              <p className="text-sm text-[#8888AA]">{error}</p>
              <Button onClick={() => fetchSettlements()} size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Settlements
          </h1>
          <p className="text-[#8888AA]">Manage payments & receivables</p>
        </div>
        <Button
          onClick={() => setRefreshing(true)}
          disabled={refreshing}
          variant="ghost"
          size="sm"
        >
          {refreshing ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <span>↻ Refresh</span>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-[#FF9999]/10 to-transparent border border-[#FF9999]/30 p-4">
            <p className="text-xs text-[#8888AA] mb-1">You Owe</p>
            <p className="text-2xl font-bold text-[#FF9999]">
              ₹{summary.totalYouOwe.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#8888AA] mt-1">{summary.pendingCount} pending</p>
          </Card>

          <Card className="bg-gradient-to-br from-[#99FF99]/10 to-transparent border border-[#99FF99]/30 p-4">
            <p className="text-xs text-[#8888AA] mb-1">They Owe</p>
            <p className="text-2xl font-bold text-[#99FF99]">
              ₹{summary.totalTheyOwe.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#8888AA] mt-1">{summary.pendingCount} pending</p>
          </Card>

          <Card className="bg-gradient-to-br from-[#7C5CFC]/10 to-transparent border border-[#7C5CFC]/30 p-4">
            <p className="text-xs text-[#8888AA] mb-1">Net Balance</p>
            <p
              className={`text-2xl font-bold ${
                summary.netBalance >= 0 ? 'text-[#99FF99]' : 'text-[#FF9999]'
              }`}
            >
              ₹{Math.abs(summary.netBalance).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#8888AA] mt-1">
              {summary.netBalance >= 0 ? 'you get' : 'you owe'}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-4">
            <p className="text-xs text-[#8888AA] mb-1">Overdue</p>
            <p className="text-2xl font-bold text-[#FF9999]">{summary.overdueCount}</p>
            <p className="text-xs text-[#8888AA] mt-1">pending action</p>
          </Card>

          <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-4">
            <p className="text-xs text-[#8888AA] mb-1">Total</p>
            <p className="text-2xl font-bold text-[#F0F0FF]">{summary.totalCount}</p>
            <p className="text-xs text-[#8888AA] mt-1">settlements</p>
          </Card>
        </div>
      )}

      {/* Filters & Controls */}
      <div className="space-y-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'overdue', 'completed', 'partial'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeFilter === status
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-[#1A1A2B] text-[#8888AA] hover:bg-[#2A2A3B]'
              }`}
            >
              {status === 'all' ? '🔄 All' : status === 'pending' ? '⏳ Pending' : status === 'overdue' ? '⚠️ Overdue' : status === 'completed' ? '✓ Done' : '🤝 Partial'}
            </button>
          ))}
        </div>

        {/* Direction & View Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#8888AA]">Direction:</label>
            <select
              value={activeDirection}
              onChange={(e) => setActiveDirection(e.target.value as 'all' | 'you_owe' | 'they_owe')}
              className="bg-[#1A1A2B] border border-[#2A2A3B] text-[#F0F0FF] rounded px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="you_owe">You Owe</option>
              <option value="they_owe">They Owe</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-[#8888AA]">View:</label>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-sm ${
                viewMode === 'table'
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-[#1A1A2B] text-[#8888AA]'
              }`}
            >
              ≡ Table
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm ${
                viewMode === 'list'
                  ? 'bg-[#7C5CFC] text-white'
                  : 'bg-[#1A1A2B] text-[#8888AA]'
              }`}
            >
              ≣ List
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="border-[#7C5CFC]/30 text-[#7C5CFC]"
            >
              <Download size={14} className="mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#7C5CFC]/30 text-[#7C5CFC]"
            >
              <Printer size={14} className="mr-1" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="bg-gradient-to-br from-[#7C5CFC]/10 to-transparent border border-[#7C5CFC]/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#F0F0FF]">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSettleSelected}
                size="sm"
                className="bg-[#99FF99] text-black hover:bg-[#AAFFAA]"
              >
                <Send size={14} className="mr-1" />
                Settle Selected
              </Button>
              <Button
                onClick={() => setSelectedIds(new Set())}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1A1A2B]">
              <TableRow>
                <TableHead className="w-12 text-[#8888AA]">
                  <Checkbox
                    checked={selectedIds.size === filteredSettlements.length && filteredSettlements.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead className="text-[#8888AA]">Friend</TableHead>
                <TableHead className="text-[#8888AA]">Amount</TableHead>
                <TableHead className="text-[#8888AA]">Group</TableHead>
                <TableHead className="text-[#8888AA]">Status</TableHead>
                <TableHead className="text-[#8888AA]">Days</TableHead>
                <TableHead className="text-right text-[#8888AA]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSettlements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#8888AA]">
                    No settlements found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSettlements.map((settlement) => {
                  const days = Math.floor(
                    (Date.now() - new Date(settlement.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isSelected = selectedIds.has(settlement.id);
                  const config = STATUS_CONFIG[settlement.status];

                  return (
                    <TableRow
                      key={settlement.id}
                      className={`border-[#2A2A3B] hover:bg-[#1A1A2B]/50 transition-colors ${
                        isSelected ? 'bg-[#7C5CFC]/10' : ''
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectOne(settlement.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium text-[#F0F0FF]">
                        {settlement.friendName}
                      </TableCell>
                      <TableCell className="font-semibold text-[#F0F0FF]">
                        ₹{(settlement.remaining || settlement.amount).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-[#8888AA]">
                        {settlement.groupName || 'Personal'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config.badge} border`}>
                          {settlement.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#8888AA]">{days}d</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1A1A2B] border-[#2A2A3B]">
                            {settlement.direction === 'you_owe' && settlement.status !== 'completed' && (
                              <DropdownMenuItem className="text-[#99FF99] focus:bg-[#7C5CFC]/20">
                                <Send size={14} className="mr-2" />
                                Pay Now
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-[#7C5CFC] focus:bg-[#7C5CFC]/20">
                              <Share2 size={14} className="mr-2" />
                              Share
                            </DropdownMenuItem>
                            {settlement.status !== 'completed' && (
                              <DropdownMenuItem className="text-[#FFB366] focus:bg-[#FFB366]/20">
                                <Clock size={14} className="mr-2" />
                                Remind
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredSettlements.length === 0 ? (
            <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6 text-center">
              <p className="text-[#8888AA]">No settlements found</p>
            </Card>
          ) : (
            filteredSettlements.map((settlement) => {
              const days = Math.floor(
                (Date.now() - new Date(settlement.createdAt).getTime()) / (1000 * 60 * 60 * 24)
              );
              const config = STATUS_CONFIG[settlement.status];

              return (
                <Card
                  key={settlement.id}
                  className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-[#F0F0FF]">{settlement.friendName}</p>
                        <Badge className={`${config.badge} border text-xs`}>
                          {settlement.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#8888AA] mb-1">
                        {settlement.groupName || 'Personal'} • {days} days ago
                      </p>
                      <p className="text-xs text-[#8888AA]">{settlement.friendEmail}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-lg font-bold ${
                          settlement.direction === 'you_owe' ? 'text-[#FF9999]' : 'text-[#99FF99]'
                        }`}
                      >
                        ₹{(settlement.remaining || settlement.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-[#8888AA]">
                        {settlement.direction === 'you_owe' ? 'you owe' : 'they owe'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
