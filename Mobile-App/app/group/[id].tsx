import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/src/services';
import { Group, GroupType } from '@/src/types/group.types';
import { TimelineTab } from '@/src/components/groups/TimelineTab';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  date: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export default function GroupDetailScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balance' | 'timeline'>('expenses');

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const groupResponse = await apiService.groups.getById(id as string);
      setGroup(groupResponse.data);
      setExpenses(groupResponse.data.expenses || []);

      // Fetch settlements
      const settlementsResponse = await apiService.groups.getSettlements(id as string);
      setSettlements(settlementsResponse.data || []);
    } catch (error: any) {
      console.error('Error fetching group:', error);
      Alert.alert('Error', 'Failed to load group details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    router.push(`/group/${id}/add-expense` as any);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.groups.removeExpense(id as string, expenseId);
            setExpenses(expenses.filter((e) => e.id !== expenseId));
            Alert.alert('Success', 'Expense deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete expense');
          }
        },
      },
    ]);
  };

  if (loading || !group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.violet} />
      </View>
    );
  }

  const isTrip = group.type === GroupType.TRIP;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.groupEmoji]}>{group.emoji}</Text>
          <View>
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
            <Text style={[styles.groupInfo, { color: colors.icon }]}>
              {group.members?.length || 0} members
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Trip Info Banner (if trip) */}
      {isTrip && group.tripStartDate && group.tripEndDate && (
        <View style={[styles.tripBanner, { backgroundColor: colors.elevated }]}>
          <View style={styles.tripInfo}>
            <Ionicons name="calendar" size={16} color={colors.mint} />
            <Text style={[styles.tripDate, { color: colors.text }]}>
              {new Date(group.tripStartDate).toLocaleDateString()} - {new Date(group.tripEndDate).toLocaleDateString()}
            </Text>
          </View>
          {group.tripDestination && (
            <View style={styles.tripInfo}>
              <Ionicons name="location" size={16} color={colors.mint} />
              <Text style={[styles.tripLocation, { color: colors.text }]}>
                {group.tripDestination}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.elevated }]}>
        {['expenses', 'balance', ...(isTrip ? ['timeline'] : [])].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                borderBottomColor: activeTab === tab ? colors.violet : 'transparent',
              },
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab ? colors.violet : colors.icon,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <View>
            {expenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={colors.icon} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Expenses</Text>
                <Text style={[styles.emptyDesc, { color: colors.icon }]}>
                  Add your first expense to this group
                </Text>
              </View>
            ) : (
              <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.expenseItem,
                      { backgroundColor: colors.elevated, borderColor: colors.card },
                    ]}
                  >
                    <View style={styles.expenseContent}>
                      <View>
                        <Text style={[styles.expenseDesc, { color: colors.text }]}>
                          {item.description}
                        </Text>
                        <Text style={[styles.expenseCategory, { color: colors.icon }]}>
                          {item.category} • Paid by {item.paidBy}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.expenseAmount, { color: colors.mint }]}>
                      ₹{item.amount}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteExpense(item.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash" size={18} color={colors.coral} />
                    </TouchableOpacity>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        )}

        {/* Balance Tab */}
        {activeTab === 'balance' && (
          <View>
            {settlements.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={48} color={colors.mint} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>All Settled</Text>
                <Text style={[styles.emptyDesc, { color: colors.icon }]}>
                  No pending settlements
                </Text>
              </View>
            ) : (
              <FlatList
                data={settlements}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.settlementItem,
                      { backgroundColor: colors.elevated, borderColor: colors.card },
                    ]}
                  >
                    <View style={styles.settlementContent}>
                      <Text style={[styles.settlementText, { color: colors.text }]}>
                        <Text style={{ fontFamily: 'DMSans_600SemiBold' }}>{item.from}</Text> owes{' '}
                        <Text style={{ fontFamily: 'DMSans_600SemiBold' }}>{item.to}</Text>
                      </Text>
                    </View>
                    <Text style={[styles.settlementAmount, { color: colors.coral }]}>
                      ₹{item.amount}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Timeline Tab (if trip) */}
        {activeTab === 'timeline' && isTrip && (
          <TimelineTab group={group} expenses={expenses} />
        )}
      </ScrollView>

      {/* Add Expense Button */}
      <View style={[styles.footer, { borderTopColor: colors.elevated }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.violet }]}
          onPress={handleAddExpense}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupEmoji: {
    fontSize: 32,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Syne',
  },
  groupInfo: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  tripBanner: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripDate: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    flex: 1,
  },
  tripLocation: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Syne',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  expenseContent: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans_500Medium',
  },
  expenseCategory: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
  deleteButton: {
    padding: 8,
  },
  separator: {
    height: 8,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settlementContent: {
    flex: 1,
  },
  settlementText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  settlementAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
});
