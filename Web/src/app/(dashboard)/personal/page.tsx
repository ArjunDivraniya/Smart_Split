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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { apiCall } from '@/lib/api-client';

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

const CATEGORY_COLORS: Record<string, string> = {
  food: 'from-[#FF6B6B] to-[#FF8E8E]',
  transport: 'from-[#4ECDC4] to-[#6FE7D8]',
  entertainment: 'from-[#FFE66D] to-[#FFD93D]',
  shopping: 'from-[#95E5E5] to-[#80D8D8]',
  utilities: 'from-[#A0C4FF] to-[#BFDBFE]',
  health: 'from-[#FFB6C1] to-[#FFC9CC]',
  other: 'from-[#D4A5A5] to-[#E8B8B8]',
};

export default function PersonalExpensesPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
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
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses
    .filter((e) =>
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategories.size === 0 || selectedCategories.has(e.category)) &&
      (selectedPaymentMethods.size === 0 || selectedPaymentMethods.has(e.paymentMethod))
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses
    .filter((e) => {
      const now = new Date();
      const expDate = new Date(e.date);
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const toggleSelectAll = () => {
    if (selectedExpenses.size === filteredExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(filteredExpenses.map((e) => e.id)));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F0F0FF] to-[#8888AA] bg-clip-text text-transparent">
            Personal Expenses
          </h1>
          <p className="text-[#8888AA]">Track your individual spending</p>
        </div>
        <Link href="/personal/add">
          <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5] hover:from-[#8B6DFF] hover:to-[#7B5CE5] text-white">
            <Plus size={20} className="mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4">
          <p className="text-sm text-[#8888AA] mb-2">This Month</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">₹{thisMonth.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4">
          <p className="text-sm text-[#8888AA] mb-2">Total Filtered</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">₹{totalSpent.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4">
          <p className="text-sm text-[#8888AA] mb-2">Avg Expense</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">
            ₹{(filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-[#14141F] to-[#0F0F1A] border-[#1A1A2B] p-4">
          <p className="text-sm text-[#8888AA] mb-2">Total Expenses</p>
          <p className="text-2xl font-bold text-[#F0F0FF]">{filteredExpenses.length}</p>
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

          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Search */}
            <Input
              placeholder="Search description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1A1A2B] border-[#2A2A3B] text-[#F0F0FF] placeholder-[#8888AA]"
            />

            {/* Category Filter */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#8888AA]">Category</p>
              <div className="space-y-2">
                {categoryTotals.map((cat) => (
                  <label
                    key={cat.name}
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#1A1A2B] rounded transition-colors"
                  >
                    <Checkbox
                      checked={selectedCategories.has(cat.name)}
                      onCheckedChange={() => toggleCategory(cat.name)}
                      className="border-[#2A2A3B]"
                    />
                    <span className="text-sm text-[#F0F0FF] capitalize">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-xs text-[#8888AA] ml-auto">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#8888AA]">Payment Method</p>
              <div className="space-y-2">
                {['cash', 'upi', 'card'].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#1A1A2B] rounded transition-colors"
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
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#8888AA] flex items-center gap-2">
                <Calendar size={14} /> Date Range
              </p>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A2B] border border-[#2A2A3B] text-[#F0F0FF] rounded text-sm"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A2B] border border-[#2A2A3B] text-[#F0F0FF] rounded text-sm"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategories.size > 0 || selectedPaymentMethods.size > 0 || searchQuery) && (
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF]"
              >
                <Upload size={16} className="mr-2" />
                Import CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#2A2A3B] text-[#8888AA] hover:text-[#F0F0FF]"
              >
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 bg-[#1A1A2B] border border-[#2A2A3B] text-[#F0F0FF] rounded-lg text-sm"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="category-asc">Category</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedExpenses.size > 0 && (
            <div className="flex items-center gap-4 p-4 bg-[#1A1A2B]/50 rounded-lg border border-[#2A2A3B]">
              <span className="text-sm text-[#8888AA]">{selectedExpenses.size} selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#FF9999]"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          )}

          {/* Expense Table */}
          <div className="overflow-x-auto border border-[#1A1A2B] rounded-lg bg-[#14141F]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1A2B] bg-[#0F0F1A]">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-[#2A2A3B]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8888AA]">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8888AA]">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8888AA]">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8888AA]">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#8888AA]">Amount</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-[#8888AA]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-[#1A1A2B] hover:bg-[#1A1A2B]/50 transition-colors"
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedExpenses.has(expense.id)}
                        onCheckedChange={() => toggleSelect(expense.id)}
                        className="border-[#2A2A3B]"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[#F0F0FF] font-medium">{expense.description}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-[#8888AA] capitalize">
                        {expense.icon} {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-[#8888AA] capitalize">{expense.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-3 text-[#8888AA] text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-[#F0F0FF]">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button className="p-1 hover:bg-[#2A2A3B] rounded transition-colors text-[#8888AA] hover:text-[#F0F0FF]">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#8888AA] mb-4">No expenses found</p>
              <Link href="/personal/add">
                <Button className="bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE5]">
                  Add your first expense
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
