'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Search,
  ChevronRight,
  Send,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Loader,
  AlertCircle,
  MoreHorizontal,
  Share2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiCall } from '@/lib/api-client';

interface Friend {
  id: string;
  name: string;
  email: string;
  balance: number;
  avatar?: string;
  transactionCount: number;
  pendingCount?: number;
  overdueCount?: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  category: string;
  type: 'paid' | 'sent' | 'received' | 'settlement';
}

interface FriendDetail extends Friend {
  transactions: Transaction[];
  totalShared: number;
  groups: string[];
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleLoading, setSettleLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, [session?.user?.id]);

  const fetchFriends = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiCall('/friends');
      if (res.success && res.data) {
        const friendsList = Array.isArray(res.data) ? res.data : res.data.friends || [];
        const formatted = friendsList
          .map((f: any) => ({
            id: f._id || f.id,
            name: f.name || f.userId?.name || 'Unknown',
            email: f.email || f.userId?.email || '',
            balance: f.balance || 0,
            avatar: f.avatar || f.userId?.avatar,
            transactionCount: f.transactionCount || 0,
            pendingCount: f.pendingCount || 0,
            overdueCount: f.overdueCount || 0,
          }))
          .sort((a: Friend, b: Friend) => Math.abs(b.balance) - Math.abs(a.balance));
        setFriends(formatted);
        if (formatted.length > 0) {
          selectFriend(formatted[0]);
        }
      }
    } catch (err) {
      setError('Failed to load friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectFriend = (friend: Friend) => {
    setSelectedFriend(null);
    setDetailLoading(true);
    fetchFriendDetail(friend);
  };

  const fetchFriendDetail = async (friend: Friend) => {
    try {
      const res = await apiCall(`/friends/${friend.id}`);
      if (res.success && res.data) {
        const data = res.data;
        setSelectedFriend({
          ...friend,
          transactions: (data.transactions || [])
            .map((t: any) => ({
              id: t._id || t.id,
              description: t.description || '',
              amount: t.amount || 0,
              date: t.date || '',
              paidBy: t.paidBy || '',
              category: t.category || 'other',
              type: t.type || 'paid',
            }))
            .sort((a: Transaction, b: Transaction) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          totalShared: data.totalShared || 0,
          groups: data.groups || [],
        });
      }
    } catch (err) {
      console.error('Error fetching friend detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!selectedFriend || !settleAmount) return;
    
    try {
      setSettleLoading(true);
      const amount = parseFloat(settleAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const res = await apiCall('/settlements/create', 'POST', {
        friendId: selectedFriend.id,
        amount,
        description: `Settlement with ${selectedFriend.name}`,
        method: 'manual',
      });

      if (res.success) {
        setSettleAmount('');
        await fetchFriends();
      } else {
        setError(res.message || 'Settlement failed');
      }
    } catch (err) {
      setError('Error settling payment');
      console.error('Error settling:', err);
    } finally {
      setSettleLoading(false);
    }
  };

  const handleShare = async (friend: Friend) => {
    const text = `Hi ${friend.name}, let's settle up! Your balance: ₹${Math.abs(friend.balance).toLocaleString('en-IN')} via SmartSplit`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SmartSplit Settlement',
          text: text,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  const totalOwe = friends
    .filter((f) => f.balance < 0)
    .reduce((sum, f) => sum + Math.abs(f.balance), 0);
  const totalGet = friends
    .filter((f) => f.balance > 0)
    .reduce((sum, f) => sum + f.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Friends
          </h1>
          <p className="text-[#8888AA]">Track balances with friends</p>
        </div>
        <Link href="/settlements">
          <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6DFF] hover:to-[#7B5CE5] text-white">
            Settlements →
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </Link>
      </div>

      {/* Main Layout - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 min-h-[600px]">
        {/* LEFT PANEL - Friends List (35%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888AA] size-4" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1A1A2B] border-[#2A2A3B] text-[#F0F0FF] placeholder-[#8888AA]"
            />
          </div>

          {/* Friends List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-16 bg-[#1A1A2B]" />
                  </div>
                ))}
              </>
            ) : error ? (
              <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4">
                <div className="flex gap-2 items-start">
                  <AlertCircle size={16} className="text-[#FF9999] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#FF9999]">Error</p>
                    <p className="text-xs text-[#8888AA]">{error}</p>
                  </div>
                </div>
              </Card>
            ) : filteredFriends.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6 text-center">
                <p className="text-[#8888AA]">
                  {searchQuery ? 'No friends match your search' : 'No friends yet'}
                </p>
              </Card>
            ) : (
              filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => selectFriend(friend)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedFriend?.id === friend.id
                      ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] shadow-lg shadow-[#7C5CFC]/10'
                      : 'bg-[#1A1A2B] border-[#2A2A3B] hover:border-[#7C5CFC]/50'
                  }`}
                >
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium text-[#F0F0FF]">{friend.name}</p>
                    <div className="flex gap-1 mt-1">
                      {friend.pendingCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] bg-[#FFB366]/20 text-[#FFB366] border-[#FFB366]/30">
                          {friend.pendingCount} pending
                        </Badge>
                      )}
                      {friend.overdueCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] bg-[#FF9999]/20 text-[#FF9999] border-[#FF9999]/30">
                          {friend.overdueCount} overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span
                      className={`text-sm font-bold text-right min-w-[60px] ${
                        friend.balance === 0
                          ? 'text-[#8888AA]'
                          : friend.balance > 0
                            ? 'text-[#FF9999]'
                            : 'text-[#99FF99]'
                      }`}
                    >
                      {friend.balance === 0
                        ? 'Settled'
                        : friend.balance > 0
                          ? `₹${friend.balance.toLocaleString('en-IN')}`
                          : `₹${Math.abs(friend.balance).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2 pt-4 border-t border-[#2A2A3B]">
            <div className="flex items-center justify-between p-3 bg-[#1A1A2B] rounded-lg border border-[#2A2A3B]">
              <span className="text-sm text-[#8888AA] flex items-center gap-1">
                <ArrowUpRight size={14} /> Total Owe
              </span>
              <span className="font-bold text-[#FF9999]">₹{totalOwe.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1A1A2B] rounded-lg border border-[#2A2A3B]">
              <span className="text-sm text-[#8888AA] flex items-center gap-1">
                <ArrowDownLeft size={14} /> Total Get
              </span>
              <span className="font-bold text-[#99FF99]">₹{totalGet.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Friend Detail (65%) */}
        <div className="lg:col-span-5">
          {detailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 bg-[#1A1A2B]" />
              <Skeleton className="h-12 bg-[#1A1A2B]" />
              <Skeleton className="h-80 bg-[#1A1A2B]" />
            </div>
          ) : selectedFriend ? (
            <div className="space-y-6">
              {/* Friend Header Card */}
              <Card className="bg-gradient-to-br from-[#7C5CFC]/20 to-transparent border border-[#7C5CFC]/30 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#9B7FFF] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {selectedFriend.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-[#F0F0FF]">{selectedFriend.name}</h2>
                      <p className="text-sm text-[#8888AA] truncate">{selectedFriend.email}</p>
                      <div className="flex gap-2 mt-2">
                        {selectedFriend.pendingCount > 0 && (
                          <Badge className="bg-[#FFB366]/20 text-[#FFB366] border-[#FFB366]/30">
                            <Clock size={12} className="mr-1" />
                            {selectedFriend.pendingCount} pending
                          </Badge>
                        )}
                        {selectedFriend.overdueCount > 0 && (
                          <Badge className="bg-[#FF9999]/20 text-[#FF9999] border-[#FF9999]/30">
                            ⚠️ {selectedFriend.overdueCount} overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#8888AA] mb-1">Net Balance</p>
                    <p
                      className={`text-2xl font-bold ${
                        selectedFriend.balance === 0
                          ? 'text-[#8888AA]'
                          : selectedFriend.balance > 0
                            ? 'text-[#FF9999]'
                            : 'text-[#99FF99]'
                      }`}
                    >
                      {selectedFriend.balance === 0
                        ? 'Settled'
                        : selectedFriend.balance > 0
                          ? `₹${selectedFriend.balance.toLocaleString('en-IN')}`
                          : `₹${Math.abs(selectedFriend.balance).toLocaleString('en-IN')}`}
                    </p>
                    <p className="text-xs text-[#8888AA] mt-1 font-medium">
                      {selectedFriend.balance > 0 && 'they owe you'}
                      {selectedFriend.balance < 0 && 'you owe them'}
                      {selectedFriend.balance === 0 && 'all settled'}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1A1A2B] rounded-lg p-3 border border-[#2A2A3B]">
                    <p className="text-xs text-[#8888AA] mb-1">Total Shared</p>
                    <p className="text-lg font-bold text-[#F0F0FF]">
                      ₹{selectedFriend.totalShared.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-[#1A1A2B] rounded-lg p-3 border border-[#2A2A3B]">
                    <p className="text-xs text-[#8888AA] mb-1">Transactions</p>
                    <p className="text-lg font-bold text-[#F0F0FF]">{selectedFriend.transactions.length}</p>
                  </div>
                  <div className="bg-[#1A1A2B] rounded-lg p-3 border border-[#2A2A3B]">
                    <p className="text-xs text-[#8888AA] mb-1">Shared Groups</p>
                    <p className="text-lg font-bold text-[#F0F0FF]">{selectedFriend.groups.length}</p>
                  </div>
                </div>
              </Card>

              {/* Settle Up Form */}
              {selectedFriend.balance !== 0 && (
                <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border border-[#1A1A2B] p-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount to settle"
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSettle()}
                      className="bg-[#1A1A2B] border-[#2A2A3B] text-[#F0F0FF] placeholder-[#8888AA]"
                    />
                    <Button
                      onClick={handleSettle}
                      disabled={!settleAmount || settleLoading}
                      className="bg-gradient-to-r from-[#99FF99] to-[#66FF66] hover:from-[#AAFFAA] hover:to-[#77FF77] text-black font-semibold min-w-fit"
                    >
                      {settleLoading ? (
                        <Loader size={16} className="animate-spin mr-1" />
                      ) : (
                        <Send size={16} className="mr-1" />
                      )}
                      Settle
                    </Button>
                  </div>
                  {selectedFriend.balance < 0 && (
                    <p className="text-xs text-[#8888AA] mt-2">
                      Mark ₹{Math.abs(selectedFriend.balance).toLocaleString('en-IN')} payment as complete
                    </p>
                  )}
                </Card>
              )}

              {/* Transaction History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#F0F0FF]">Transaction History</h3>
                  <span className="text-xs text-[#8888AA]">{selectedFriend.transactions.length} items</span>
                </div>
                <div className="space-y-2">
                  {selectedFriend.transactions.length === 0 ? (
                    <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6 text-center">
                      <p className="text-[#8888AA]">No transactions yet with {selectedFriend.name}</p>
                    </Card>
                  ) : (
                    selectedFriend.transactions.map((tx) => (
                      <Card
                        key={tx.id}
                        className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4 hover:border-[#7C5CFC]/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`p-2 rounded-lg flex-shrink-0 ${
                                tx.type === 'paid'
                                  ? 'bg-[#7C5CFC]/20'
                                  : tx.type === 'received' || tx.type === 'settlement'
                                    ? 'bg-[#99FF99]/20'
                                    : 'bg-[#FF9999]/20'
                              }`}
                            >
                              {tx.type === 'paid' ? (
                                <DollarSign size={16} className="text-[#7C5CFC]" />
                              ) : tx.type === 'received' || tx.type === 'settlement' ? (
                                <ArrowDownLeft size={16} className="text-[#99FF99]" />
                              ) : (
                                <ArrowUpRight size={16} className="text-[#FF9999]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-[#F0F0FF] truncate">{tx.description}</p>
                                {tx.type === 'settlement' && (
                                  <Badge variant="outline" className="text-[10px]">
                                    Settlement
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-[#8888AA] mt-1">
                                {new Date(tx.date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })} • {tx.category}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-[#F0F0FF] text-right flex-shrink-0 ml-2 min-w-[80px]">
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="text-3xl">👋</p>
                <p className="text-[#F0F0FF] font-medium">Select a friend</p>
                <p className="text-[#8888AA] text-sm">
                  {friends.length === 0
                    ? 'No friends to display'
                    : 'Choose a friend from the list to view details'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
