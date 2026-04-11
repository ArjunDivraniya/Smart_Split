'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Download,
  Upload,
  Trash2,
  Edit2,
  Filter,
  Calendar,
  Search,
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

interface PersonalExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  icon: string;
}

interface CategoryTotal {
  name: string;
  amount: number;
  icon: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚕',
  entertainment: '🎬',
  shopping: '🛍️',
  utilities: '💡',
  health: '🏥',
  other: '📌',
};

export default function PersonalExpensesPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<PersonalExpense>>({});
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(true);

  // Sort
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchExpenses();
  }, [session?.user?.id]);

  const fetchExpenses = async () => {
    try {
      const res = await apiCall('/personal-expenses');
      if (res.success && res.data) {
        const expensesArray = Array.isArray(res.data) ? res.data : res.data.expenses || [];
        const formattedExpenses = expensesArray.map((e: any) => ({
          id: e._id || e.id,
          description: e.description || e.title || '',
          amount: e.amount || 0,
          category: e.category ? e.category.toLowerCase() : 'other',
          paymentMethod: e.paymentMethod || 'cash',
          date: e.date || e.createdAt || new Date().toISOString(),
          icon: CATEGORY_ICONS[e.category ? e.category.toLowerCase() : 'other'] || '📌',
        }));
        setExpenses(formattedExpenses);

        // Calculate category totals
        const totals: Record<string, number> = {};
        formattedExpenses.forEach((e: PersonalExpense) => {
          totals[e.category] = (totals[e.category] || 0) + e.amount;
        });

        const categoryData = Object.entries(totals)
          .map(([cat, amount]) => ({
            name: cat,
            amount,
            icon: CATEGORY_ICONS[cat] || '📌',
          }))
          .sort((a, b) => b.amount - a.amount);

        setCategoryTotals(categoryData);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({ title: 'Error loading expenses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedExpenses = expenses
    .filter((e) => {
      const inDateRange =
        (!dateRange.from || new Date(e.date) >= new Date(dateRange.from)) &&
        (!dateRange.to || new Date(e.date) <= new Date(dateRange.to));
      
      return (
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategories.size === 0 || selectedCategories.has(e.category)) &&
        (selectedPaymentMethods.size === 0 || selectedPaymentMethods.has(e.paymentMethod)) &&
        inDateRange
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'description') {
        comparison = a.description.localeCompare(b.description);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalSpent = filteredAndSortedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses
    .filter((e) => {
      const now = new Date();
      const expDate = new Date(e.date);
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const toggleSelectAll = () => {
    if (selectedExpenses.size === filteredAndSortedExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(filteredAndSortedExpenses.map((e) => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExpenses(newSelected);
  };

  const toggleCategory = (cat: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(cat)) {
      newSelected.delete(cat);
    } else {
      newSelected.add(cat);
    }
    setSelectedCategories(newSelected);
  };

  const togglePaymentMethod = (method: string) => {
    const newSelected = new Set(selectedPaymentMethods);
    if (newSelected.has(method)) {
      newSelected.delete(method);
    } else {
      newSelected.add(method);
    }
    setSelectedPaymentMethods(newSelected);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedExpenses);
    try {
      for (const id of ids) {
        await apiCall(`/personal-expenses/${id}`, { method: 'DELETE' });
      }
      toast({ title: `Deleted ${ids.length} expense(s)` });
      setSelectedExpenses(new Set());
      fetchExpenses();
    } catch (error) {
      toast({ title: 'Error deleting expenses', variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Payment Method', 'Amount'];
    const rows = filteredAndSortedExpenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.description,
      e.category,
      e.paymentMethod,
      e.amount.toLocaleString('en-IN'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast({ title: 'Expenses exported successfully' });
  };

  const handleInlineEdit = async (id: string, field: keyof PersonalExpense, value: any) => {
    try {
      await apiCall(`/personal-expenses/${id}`, {
        method: 'PUT',
        body: { [field]: value },
      });
      setEditingId(null);
      fetchExpenses();
      toast({ title: 'Expense updated' });
    } catch (error) {
      toast({ title: 'Error updating expense', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortIcon = (key: typeof sortBy) => {
    if (sortBy !== key) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[#171727] rounded" />
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
            Personal Expenses
          </h1>
          <p className="text-[#8888AA] mt-1">Track and manage your spending</p>
        </div>
        <Link href="/personal/add">
          <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#5C3AFF] hover:from-[#6B4DEB] hover:to-[#4C2AEF] text-white gap-2">
            <Plus size={18} />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <p className="text-sm text-[#8888AA] mb-2">This Month</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">{formatCurrency(thisMonth)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <p className="text-sm text-[#8888AA] mb-2">Total Filtered</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <p className="text-sm text-[#8888AA] mb-2">Avg Expense</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">
            {formatCurrency(filteredAndSortedExpenses.length > 0 ? totalSpent / filteredAndSortedExpenses.length : 0)}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-6">
          <p className="text-sm text-[#8888AA] mb-2">Total Expenses</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">{filteredAndSortedExpenses.length}</p>
        </Card>
      </div>

      {/* Main Layout - Filters (left) + Table (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between lg:block mb-4">
            <h3 className="font-bold text-[#F0F0FF] flex items-center gap-2">
              <Filter size={18} />
              Filters
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden text-[#8888AA] hover:text-[#F0F0FF]"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className={`space-y-4 bg-[#1A1A2B] rounded-lg p-4 border border-[#2A2A3B] ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#8888AA]" size={16} />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#171727] border-[#2A2A3B] text-[#F0F0FF] placeholder-[#8888AA]"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#8888AA]">Category</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categoryTotals.map((cat) => (
                  <label
                    key={cat.name}
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#0F0F1A] rounded transition-colors"
                  >
                    <Checkbox
                      checked={selectedCategories.has(cat.name)}
                      onCheckedChange={() => toggleCategory(cat.name)}
                      className="border-[#2A2A3B]"
                    />
                    <span className="text-sm text-[#F0F0FF] capitalize flex-1">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-xs text-[#8888AA]">
                      {formatCurrency(cat.amount)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2 pt-2 border-t border-[#2A2A3B]">
              <p className="text-sm font-semibold text-[#8888AA]">Payment Method</p>
              <div className="space-y-2">
                {['cash', 'upi', 'card'].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#0F0F1A] rounded transition-colors"
                  >
                    <Checkbox
                      checked={selectedPaymentMethods.has(method)}
                      onCheckedChange={() => togglePaymentMethod(method)}
                      className="border-[#2A2A3B]"
                    />
                    <span className="text-sm text-[#F0F0FF] capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2 pt-2 border-t border-[#2A2A3B]">
              <p className="text-sm font-semibold text-[#8888AA] flex items-center gap-2">
                <Calendar size={14} /> Date Range
              </p>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 bg-[#171727] border border-[#2A2A3B] text-[#F0F0FF] rounded text-sm"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 bg-[#171727] border border-[#2A2A3B] text-[#F0F0FF] rounded text-sm"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategories.size > 0 || selectedPaymentMethods.size > 0 || searchQuery || dateRange.from || dateRange.to) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategories(new Set());
                  setSelectedPaymentMethods(new Set());
                  setSearchQuery('');
                  setDateRange({ from: '', to: '' });
                }}
                className="w-full border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF]"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Table - Right Side */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('csv-input')?.click()}
                className="border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF] gap-2"
              >
                <Upload size={16} />
                Import
              </Button>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  // CSV import implementation
                  toast({ title: 'Import feature coming soon' });
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredAndSortedExpenses.length === 0}
                className="border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF] gap-2"
              >
                <Download size={16} />
                Export
              </Button>
            </div>

            {/* Bulk Delete */}
            {selectedExpenses.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8888AA]">
                  {selectedExpenses.size} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Select Header */}
          <div className="flex items-center gap-2 p-3 bg-[#171727] rounded border border-[#2A2A3B]">
            <Checkbox
              checked={selectedExpenses.size === filteredAndSortedExpenses.length && filteredAndSortedExpenses.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-[#8888AA]">
              {selectedExpenses.size === 0 ? 'Select all' : `${selectedExpenses.size} selected`}
            </span>
          </div>

          {/* Table */}
          {filteredAndSortedExpenses.length === 0 ? (
            <div className="text-center py-12 bg-[#171727] rounded-lg border border-[#2A2A3B]">
              <p className="text-[#8888AA]">No expenses found</p>
            </div>
          ) : (
            <div className="border border-[#2A2A3B] rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#1A1A2B] border-b border-[#2A2A3B]">
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedExpenses.size === filteredAndSortedExpenses.length && filteredAndSortedExpenses.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortBy === 'date') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('date');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      Date {getSortIcon('date')}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortBy === 'description') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('description');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      Description {getSortIcon('description')}
                    </TableHead>
                    <TableHead className="text-center">Category</TableHead>
                    <TableHead className="text-center">Method</TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-white text-right"
                      onClick={() => {
                        if (sortBy === 'amount') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('amount');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      Amount {getSortIcon('amount')}
                    </TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedExpenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="border-b border-[#2A2A3B] hover:bg-[#171727]/50 cursor-pointer"
                    >
                      <TableCell
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(expense.id);
                        }}
                      >
                        <Checkbox
                          checked={selectedExpenses.has(expense.id)}
                          onCheckedChange={() => toggleSelect(expense.id)}
                        />
                      </TableCell>
                      <TableCell className="text-[#8888AA]">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell className="text-white">
                        {editingId === expense.id ? (
                          <Input
                            value={editingData.description || expense.description}
                            onChange={(e) =>
                              setEditingData({ ...editingData, description: e.target.value })
                            }
                            onBlur={() => {
                              if (editingData.description !== expense.description) {
                                handleInlineEdit(expense.id, 'description', editingData.description);
                              }
                            }}
                            className="border-[#2A2A3B]"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            onDoubleClick={() => {
                              setEditingId(expense.id);
                              setEditingData(expense);
                            }}
                            className="cursor-default"
                          >
                            {expense.description}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg">{expense.icon}</span>
                        <span className="text-xs text-[#8888AA] capitalize">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-[#8888AA] capitalize">
                        {expense.paymentMethod}
                      </TableCell>
                      <TableCell className="text-right font-medium text-[#F0F0FF]">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="text-[#8888AA]">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#171727] border-[#2A2A3B]">
                            <DropdownMenuItem
                              className="text-[#F0F0FF]"
                              onClick={() => {
                                setEditingId(expense.id);
                                setEditingData(expense);
                              }}
                            >
                              <Edit2 size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-[#FF5F7E]"
                              onClick={async () => {
                                await apiCall(`/personal-expenses/${expense.id}`, { method: 'DELETE' });
                                fetchExpenses();
                              }}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
