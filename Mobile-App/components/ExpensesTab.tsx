import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services/api';
import { ExpenseItem } from '@/components/ExpenseItem';

interface ExpensesTabProps {
  groupId: string;
  currentUserId: string;
  onAddExpense: () => void;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  paidBy: {
    _id: string;
    name: string;
  };
  category?: string;
  date: string;
  receiptUrl?: string;
  notes?: string;
}

const CATEGORIES = ['All', 'Food', 'Transport', 'Accommodation', 'Entertainment', 'Shopping', 'Other'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'date', order: 'desc' },
  { label: 'Oldest First', value: 'date', order: 'asc' },
  { label: 'Highest Amount', value: 'amount', order: 'desc' },
  { label: 'Lowest Amount', value: 'amount', order: 'asc' },
];

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  groupId,
  currentUserId,
  onAddExpense,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paidFilter, setPaidFilter] = useState<'all' | 'me' | 'others'>('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [groupId, selectedCategory, paidFilter, sortBy, sortOrder]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        sortOrder,
      };
      
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      
      if (paidFilter === 'me') {
        params.paid = currentUserId;
      } else if (paidFilter === 'others') {
        params.paid = `!${currentUserId}`;
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiService.groupExpenses.getAll(groupId, params);
      const expensesData = response?.data?.data || response?.data || [];
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.groups.removeExpense(groupId, expenseId);
              fetchExpenses();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const handleSearch = () => {
    fetchExpenses();
  };

  const renderFilterBar = () => (
    <View style={styles.filterBarContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); fetchExpenses(); }}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="options" size={20} color="#6366f1" />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Category</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCategory === item && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === item && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Paid By Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Paid By</Text>
          <View style={styles.paidFilterRow}>
            {['all', 'me', 'others'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  paidFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setPaidFilter(filter as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    paidFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {filter === 'all' ? 'All' : filter === 'me' ? 'Me' : 'Others'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort Options */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sort By</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SORT_OPTIONS}
            keyExtractor={(item) => `${item.value}-${item.order}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  sortBy === item.value && sortOrder === item.order && styles.filterChipActive,
                ]}
                onPress={() => {
                  setSortBy(item.value);
                  setSortOrder(item.order);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sortBy === item.value && sortOrder === item.order && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptySubtitle}>Add your first expense to get started</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddExpense}>
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFilterBar()}
      {renderFilters()}
      
      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            currentUserId={currentUserId}
            onPress={() => {
              // TODO: Navigate to expense detail
            }}
            onDelete={() => handleDeleteExpense(item._id)}
          />
        )}
        ListEmptyComponent={renderEmptyState()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={expenses.length === 0 && styles.emptyList}
      />

      {expenses.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={onAddExpense}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBarContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#1e293b',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginHorizontal: 4,
    marginLeft: 12,
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  paidFilterRow: {
    flexDirection: 'row',
    paddingLeft: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
