import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/src/services';
import { Group, GroupType } from '@/src/types/group.types';
import { ExpensesTab } from '@/components/ExpensesTab';
import { BalancesTab } from '@/components/BalancesTab';
import { TimelineTab } from '@/components/TimelineTab';
import { SummaryTab } from '@/components/SummaryTab';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'timeline' | 'summary'>('expenses');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const userResponse = await apiService.user.getMe();
      setCurrentUserId(userResponse.data._id);
      setCurrentUserName(userResponse.data.name);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const groupResponse = await apiService.groups.getById(id as string);
      setGroup(groupResponse.data);
    } catch (error: any) {
      console.error('Error fetching group:', error);
      Alert.alert('Error', 'Failed to load group details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    // TODO: Implement add expense flow
    Alert.alert('Coming Soon', 'Add expense functionality will be implemented next');
  };

  if (loading || !group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.violet} />
      </View>
    );
  }

  const isTrip = group.type === GroupType.TRIP;
  const tabs = isTrip 
    ? ['expenses', 'balances', 'timeline', 'summary']
    : ['expenses', 'balances', 'summary'];

  const renderTabContent = () => {
    if (!currentUserId) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.violet} />
        </View>
      );
    }

    switch (activeTab) {
      case 'expenses':
        return (
          <ExpensesTab
            groupId={id as string}
            currentUserId={currentUserId}
            onAddExpense={handleAddExpense}
          />
        );
      case 'balances':
        return (
          <BalancesTab
            groupId={id as string}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        );
      case 'timeline':
        return (
          <TimelineTab
            groupId={id as string}
            currentUserId={currentUserId}
          />
        );
      case 'summary':
        return (
          <SummaryTab
            groupId={id as string}
            currentUserId={currentUserId}
          />
        );
      default:
        return null;
    }
  };

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
        {tabs.map((tab) => (
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

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  tabContent: {
    flex: 1,
  },
});
