import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/src/services';
import { Group, GroupType } from '@/src/types/group.types';
import { GROUP_TYPE_MAP } from '@/src/types/group.types';
import { ExpensesTab } from '@/components/ExpensesTab';
import { BalancesTab } from '@/components/BalancesTab';
import { TimelineTab } from '@/components/TimelineTab';
import { SummaryTab } from '@/components/SummaryTab';
import { AvatarGroup } from '@/src/components/groups/AvatarGroup';
import { MembersBottomSheet } from '@/src/components/groups/MembersBottomSheet';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/services/api';
import { addMember } from '@/src/services/groups.service';
import { ExpenseFormView } from '@/app/group/add-expense';
import { ExpenseItemSkeleton } from '@/components/SkeletonLoader';

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

type SearchUser = {
  _id: string;
  name?: string;
  email: string;
};

// Map group types to brand colors for premium visual distinction
const getGroupTypeColor = (groupType?: string): string => {
  switch (groupType?.toLowerCase()) {
    case 'trip':
      return '#7C5CFC'; // Violet
    case 'food':
      return '#FFB547'; // Amber
    case 'college':
      return '#38BDF8'; // Sky
    case 'flatmates':
      return '#00E5B0'; // Mint
    case 'event':
      return '#FF5F7E'; // Coral
    default:
      return '#7C5CFC'; // Default to violet
  }
};

export default function GroupDetailScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'timeline' | 'summary'>('expenses');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [addingMemberId, setAddingMemberId] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [membersSheetVisible, setMembersSheetVisible] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState('');
  const [expenseSheetVisible, setExpenseSheetVisible] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | undefined>(undefined);
  const [editingExpenseData, setEditingExpenseData] = useState<string | undefined>(undefined);
  const [expensesRefreshKey, setExpensesRefreshKey] = useState(0);

  // Floating emoji animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const normalizeId = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      const objectValue = value as Record<string, any>;
      const nestedId =
        objectValue.$oid ||
        objectValue._id ||
        objectValue.id ||
        objectValue.userId ||
        objectValue.value;

      if (nestedId === value) {
        return '';
      }

      return normalizeId(nestedId);
    }

    return String(value).trim();
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchGroupDetails();
      }
    }, [id])
  );

  useEffect(() => {
    // Reset timeline tab if group is not a trip
    if (group && activeTab === 'timeline') {
      const isTrip = group.type === GroupType.TRIP;
      if (!isTrip) {
        setActiveTab('expenses');
      }
    }
  }, [group?.type, activeTab]);

  const loadCurrentUser = async () => {
    try {
      setUserLoading(true);
      const userResponse = await apiService.user.getMe();
      const userData = userResponse?.data?.data || userResponse?.data;
      const userId = userData?._id || userData?.id || '';
      const userName = userData?.name || '';

      setCurrentUserId(userId);
      setCurrentUserName(userName);

      if (!userId) {
        console.warn('User profile loaded but missing user id in response');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const groupResponse = await apiService.groups.getById(id as string);
      const groupData = groupResponse?.data?.data || groupResponse?.data;
      setGroup(groupData || null);
    } catch (error: any) {
      console.error('Error fetching group:', error);
      Alert.alert('Error', 'Failed to load group details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    if (!canAddExpense) {
      Alert.alert('Trip Ended', addExpenseBlockedReason);
      return;
    }

    const targetGroupId = normalizeId(id || group?.id || group?._id);
    if (!targetGroupId) {
      Alert.alert('Error', 'Unable to open add expense. Group ID is missing.');
      return;
    }
    setEditingExpenseId(undefined);
    setEditingExpenseData(undefined);
    setExpenseSheetVisible(true);
  };

  const handleEditExpense = (expense: any) => {
    try {
      setEditingExpenseId(expense?._id || expense?.id || undefined);
      setEditingExpenseData(encodeURIComponent(JSON.stringify(expense || {})));
      setExpenseSheetVisible(true);
    } catch {
      Alert.alert('Error', 'Unable to open edit expense');
    }
  };

  const handleViewExpense = (expense: any) => {
    try {
      const expenseId = normalizeId(expense?._id || expense?.id);
      if (!expenseId) {
        Alert.alert('Error', 'Unable to open expense details.');
        return;
      }

      const payload = encodeURIComponent(JSON.stringify(expense || {}));
      router.push(
        `/group/expense/${expenseId}?groupId=${encodeURIComponent(groupId)}&expenseData=${payload}&currentUserId=${encodeURIComponent(
          signedInUserId || ''
        )}&isCreator=${isCreator ? '1' : '0'}` as any
      );
    } catch {
      Alert.alert('Error', 'Unable to open expense details.');
    }
  };

  const handleCloseExpenseSheet = () => {
    setExpenseSheetVisible(false);
  };

  const handleExpenseSaved = async () => {
    setExpensesRefreshKey((prev) => prev + 1);
    await fetchGroupDetails();
  };

  const groupId = normalizeId(id || group?.id || group?._id);

  if (loading || !group) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <ExpenseItemSkeleton />
            <ExpenseItemSkeleton style={{ marginTop: 12 }} />
            <ExpenseItemSkeleton style={{ marginTop: 12 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isTrip = group.type === GroupType.TRIP;
  const isCompletedOrInactive = group.status === 'completed' || group.isActive === false;
  const tripEndDate = group.tripEndDate ? new Date(group.tripEndDate) : null;
  const isTripPastEndDate = Boolean(
    isTrip &&
      tripEndDate &&
      new Date().getTime() > new Date(tripEndDate.setHours(23, 59, 59, 999)).getTime()
  );
  const canAddExpense = !(isTrip && (isCompletedOrInactive || isTripPastEndDate));
  const addExpenseBlockedReason = isCompletedOrInactive
    ? 'This trip is completed. You cannot add new expenses.'
    : 'This trip has ended. You cannot add expenses after the end date.';

  const typeInfo = GROUP_TYPE_MAP[group.type] || GROUP_TYPE_MAP[GroupType.CUSTOM];
  const authUserId = normalizeId((user as any)?._id || user?.id || (user as any)?.userId);
  const groupCreatorId = normalizeId(
    typeof group.createdBy === 'object'
      ? group.createdBy?._id || (group.createdBy as any)?.id || (group.createdBy as any)?.userId
      : group.createdBy
  );
  const signedInUserId = authUserId || normalizeId(currentUserId);
  const isCreator = Boolean(signedInUserId && groupCreatorId && signedInUserId === groupCreatorId);

  const tabs: Array<'expenses' | 'balances' | 'timeline' | 'summary'> = isTrip
    ? ['expenses', 'balances', 'timeline', 'summary']
    : ['expenses', 'balances', 'summary'];
  const memberPreview = (group.members || []).map((member) => ({
    id: normalizeId(member.userId),
    name: member.userName || (typeof member.userId === 'object' ? (member.userId as any)?.name : '') || 'Member',
    email: member.email || (typeof member.userId === 'object' ? (member.userId as any)?.email : '') || 'No email',
  }));

  const membersSheetData = (() => {
    const rows: Array<{ id: string; name: string; email: string; avatar?: string }> = [];
    const seen = new Set<string>();

    const createdByUser = typeof group.createdBy === 'object' ? (group.createdBy as any) : null;
    if (groupCreatorId && !seen.has(groupCreatorId)) {
      rows.push({
        id: groupCreatorId,
        name: createdByUser?.name || 'Creator',
        email: createdByUser?.email || '',
        avatar: createdByUser?.avatar || createdByUser?.profileImage,
      });
      seen.add(groupCreatorId);
    }

    (group.members || []).forEach((member) => {
      const resolvedId = normalizeId(member.userId);
      if (!resolvedId || seen.has(resolvedId)) {
        return;
      }

      const memberUser = typeof member.userId === 'object' ? (member.userId as any) : null;
      rows.push({
        id: resolvedId,
        name: member.userName || memberUser?.name || 'Member',
        email: member.email || memberUser?.email || '',
        avatar: member.avatar || memberUser?.avatar || memberUser?.profileImage,
      });
      seen.add(resolvedId);
    });

    return rows;
  })();
  const membersCount = group.members?.length || 0;

  const totalSpent = Number(group.totalSpent || 0);
  const yourShare = membersCount > 0 ? totalSpent / membersCount : 0;
  const netBalance = Number(group.netBalance || 0);
  const netBalanceColor = netBalance < 0 ? colors.coral : colors.mint;
  const netBalanceLabel = netBalance < 0 ? 'You Owe' : 'Net Balance';

  const formatDateLabel = (value?: Date) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const tripDateRange =
    isTrip && group.tripStartDate && group.tripEndDate
      ? `${formatDateLabel(group.tripStartDate)} - ${formatDateLabel(group.tripEndDate)}`
      : '';

  const budgetLimit = Number(group.tripBudget || 0);
  const budgetProgress = budgetLimit > 0 ? Math.min(totalSpent / budgetLimit, 1) : 0;
  const budgetProgressPercent = Math.round(budgetProgress * 100);

  // Early return only AFTER all hooks have been called
  if (loading || !group) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.violet} />
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    if (userLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.violet} />
        </View>
      );
    }

    if (!currentUserId) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.userErrorText, { color: colors.text }]}>Unable to load your profile.</Text>
          <TouchableOpacity style={[styles.retryUserButton, { backgroundColor: colors.violet }]} onPress={loadCurrentUser}>
            <Text style={styles.retryUserButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case 'expenses':
        return (
          <ExpensesTab
            groupId={groupId}
            currentUserId={currentUserId}
            onAddExpense={handleAddExpense}
            onViewExpense={handleViewExpense}
            onEditExpense={handleEditExpense}
            refreshKey={expensesRefreshKey}
          />
        );
      case 'balances':
        return (
          <BalancesTab
            groupId={groupId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        );
      case 'timeline':
        return (
          <TimelineTab
            groupId={groupId}
            currentUserId={currentUserId}
          />
        );
      case 'summary':
        return (
          <SummaryTab
            groupId={groupId}
            currentUserId={currentUserId}
          />
        );
      default:
        return null;
    }
  };

  const openEditModal = () => {
    setEditedName(group.name || '');
    setEditedDescription(group.description || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!groupId) {
      return;
    }

    const trimmedName = editedName.trim();
    if (!trimmedName) {
      Alert.alert('Validation', 'Group name is required.');
      return;
    }

    try {
      setSavingEdit(true);
      const updated = await apiService.groups.update(groupId, {
        name: trimmedName,
        description: editedDescription.trim(),
      });

      const updatedGroup = updated?.data?.data || updated?.data || updated;
      setGroup((prev) => (prev ? { ...prev, ...updatedGroup } : prev));
      setEditModalVisible(false);
      Alert.alert('Success', 'Group details updated.');
    } catch {
      Alert.alert('Error', 'Failed to update group. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const openAddMemberModal = () => {
    setMemberQuery('');
    setSearchResults([]);
    setMemberModalVisible(true);
  };

  const searchMembers = async (query: string) => {
    setMemberQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const response = await api.get('/user/search', {
        params: { query: query.trim() },
      });

      const usersData = Array.isArray(response?.data?.data) ? response.data.data : [];
      const memberIds = new Set((group.members || []).map((member) => normalizeId(member.userId)));

      const filtered = usersData.filter((candidate: SearchUser) => {
        const candidateId = normalizeId(candidate._id);
        return candidateId && !memberIds.has(candidateId);
      });

      setSearchResults(filtered);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddMember = async (user: SearchUser) => {
    if (!groupId) {
      return;
    }

    const userId = normalizeId(user._id);
    if (!userId) {
      return;
    }

    try {
      setAddingMemberId(userId);
      await addMember(groupId, userId);
      await fetchGroupDetails();
      setSearchResults((prev) => prev.filter((candidate) => normalizeId(candidate._id) !== userId));
      Alert.alert('Success', `${user.name || user.email} added to group.`);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.error || error?.response?.data?.message || 'Failed to add member.'
      );
    } finally {
      setAddingMemberId('');
    }
  };

  const handleArchiveGroup = async () => {
    try {
      if (!groupId) {
        return;
      }

      await apiService.groups.update(groupId, {
        isActive: false,
        status: 'completed',
      });

      setGroup((prev) => (prev ? { ...prev, isActive: false, status: 'completed' } : prev));
      Alert.alert('Success', 'Group archived successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to archive group. Please try again.');
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'This action cannot be undone. Are you sure you want to delete this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!groupId) {
                return;
              }

              await apiService.groups.delete(groupId);
              router.replace('/(tabs)/groups' as any);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete group. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openGroupActions = () => {
    setMenuVisible((prev) => !prev);
  };

  const closeGroupActions = () => {
    setMenuVisible(false);
  };

  const runMenuAction = (action: () => void) => {
    closeGroupActions();
    action();
  };

  const handleSettleUpQuickAction = () => {
    if (!groupId) {
      Alert.alert('Error', 'Unable to open settlement screen. Group ID is missing.');
      return;
    }
    router.push(`/group/settlement?id=${encodeURIComponent(groupId)}` as any);
  };

  const handleMembersQuickAction = () => {
    setMembersSheetVisible(true);
  };

  const handleShareQuickAction = () => {
    Alert.alert('Share', 'Share group link is coming soon.');
  };

  const handleRemoveMember = (member: { id: string; name: string; email: string }) => {
    if (!groupId) {
      return;
    }

    Alert.alert(
      'Remove Member',
      `Remove ${member.name} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingMemberId(member.id);
              await apiService.groups.removeMember(groupId, member.id);
              await fetchGroupDetails();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.response?.data?.error || error?.response?.data?.message || 'Failed to remove member.'
              );
            } finally {
              setRemovingMemberId('');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Header */}
      <View style={[styles.heroWrap, { borderBottomColor: colors.elevated }]}>
        <View style={styles.heroTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity onPress={handleShareQuickAction} style={styles.shareButton} activeOpacity={0.8}>
              <Ionicons name="share-social" size={20} color={colors.violet} />
            </TouchableOpacity>

            {isCreator ? (
              <TouchableOpacity onPress={openGroupActions} style={styles.menuButton} activeOpacity={0.8}>
                <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.menuPlaceholder} />
            )}
          </View>
        </View>

        <View style={styles.heroMainRow}>
          <Animated.View
            style={[
              styles.emojiGlowWrap,
              {
                transform: [{ translateY: floatY }],
              },
            ]}
          >
            <View
              style={[
                styles.emojiGlow,
                {
                  backgroundColor: getGroupTypeColor(group?.type) + '26',
                },
              ]}
            />
            <Text style={styles.groupEmojiHero}>{group.emoji || typeInfo.emoji}</Text>
          </Animated.View>

          <View style={styles.heroTextBlock}>
            <Text style={[styles.groupNameHero, { color: colors.text }]} numberOfLines={1}>
              {group.name}
            </Text>

            <View style={[styles.typeBadge, { backgroundColor: `${colors.violet}20`, borderColor: `${colors.violet}45` }]}>
              <Text style={[styles.typeBadgeText, { color: colors.violet }]}>{typeInfo.label}</Text>
            </View>

            {isTrip && (group.tripDestination || tripDateRange) ? (
              <View style={styles.tripMetaWrap}>
                {group.tripDestination ? (
                  <View style={styles.tripMetaRow}> 
                    <Ionicons name="location" size={13} color={colors.icon} />
                    <Text style={[styles.tripMetaTextHero, { color: colors.icon }]} numberOfLines={1}>
                      {group.tripDestination}
                    </Text>
                  </View>
                ) : null}

                {tripDateRange ? (
                  <View style={styles.tripMetaRow}> 
                    <Ionicons name="calendar" size={13} color={colors.icon} />
                    <Text style={[styles.tripMetaTextHero, { color: colors.icon }]}>{tripDateRange}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity style={styles.membersHeroRow} onPress={() => setMembersSheetVisible(true)} activeOpacity={0.8}>
              <AvatarGroup members={memberPreview} size="medium" />
              <Text style={[styles.membersHeroText, { color: colors.icon }]}>{membersCount} members</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.statsRowContainer, { marginBottom: 12 }]}>
          <View style={[styles.statCellBox, { borderColor: colors.elevated }]}>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Total Spent</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>Rs {totalSpent.toLocaleString('en-IN')}</Text>
          </View>

          <View
            style={[
              styles.statCellBox,
              {
                borderColor: colors.elevated,
                backgroundColor: netBalance < 0 ? `${colors.coral}14` : `${colors.mint}14`,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.icon }]}>{netBalanceLabel}</Text>
            <Text style={[styles.statValue, { color: netBalanceColor }]}>
              Rs {Math.abs(netBalance).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.statCellBox, { borderColor: colors.elevated }]}>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Your Share</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>Rs {yourShare.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          </View>
        </View>

        {isTrip && budgetLimit > 0 ? (
          <View style={styles.budgetWrap}>
            <View style={styles.budgetHeaderRow}>
              <Text style={[styles.budgetLabel, { color: colors.icon }]}>Trip Budget</Text>
              <Text style={[styles.budgetValue, { color: colors.text }]}>Rs {totalSpent.toLocaleString('en-IN')} / Rs {budgetLimit.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.budgetTrack, { backgroundColor: colors.elevated }]}> 
              <View style={[styles.budgetFill, { width: `${budgetProgressPercent}%`, backgroundColor: budgetProgress >= 1 ? colors.coral : colors.mint }]} />
            </View>
          </View>
        ) : null}
      </View>

      {isCreator && menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={closeGroupActions} />
          <View style={[styles.menuPanel, { backgroundColor: colors.background, borderColor: colors.elevated }]}> 
            <TouchableOpacity style={styles.menuItem} onPress={() => runMenuAction(openEditModal)}>
              <Ionicons name="create-outline" size={16} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => runMenuAction(openAddMemberModal)}>
              <Ionicons name="person-add-outline" size={16} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => runMenuAction(handleArchiveGroup)}>
              <Ionicons name="archive-outline" size={16} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Archive Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => runMenuAction(handleDeleteGroup)}>
              <Ionicons name="trash-outline" size={16} color={colors.coral} />
              <Text style={[styles.menuItemText, { color: colors.coral }]}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick Actions - 3 Buttons */}
      <View style={[styles.quickActionsStickyContainer, { backgroundColor: `${colors.violet}08` }]}>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[
              styles.quickActionPrimary,
              { backgroundColor: canAddExpense ? colors.violet : colors.elevated },
              !canAddExpense && styles.quickActionDisabled,
            ]}
            onPress={handleAddExpense}
            disabled={!canAddExpense}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.quickActionPrimaryText}>{canAddExpense ? 'Add Expense' : 'Trip Ended'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionSecondary, { backgroundColor: colors.mint }]}
            onPress={handleSettleUpQuickAction}
            activeOpacity={0.9}
          >
            <Ionicons name="checkmark" size={16} color="#ffffff" />
            <Text style={styles.quickActionText}>Settle Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionSecondary, { backgroundColor: colors.sky }]}
            onPress={handleMembersQuickAction}
            activeOpacity={0.9}
          >
            <Ionicons name="people" size={16} color="#ffffff" />
            <Text style={styles.quickActionText}>Members</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs (sticky strip) */}
      <View style={[styles.tabsStickyWrap, { backgroundColor: colors.background, borderBottomColor: colors.elevated }]}>
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
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      <MembersBottomSheet
        visible={membersSheetVisible}
        onClose={() => setMembersSheetVisible(false)}
        members={membersSheetData}
        creatorId={groupCreatorId}
        currentUserId={signedInUserId}
        isCreator={isCreator}
        removingMemberId={removingMemberId}
        onRemoveMember={handleRemoveMember}
        onAddMember={() => {
          setMembersSheetVisible(false);
          openAddMemberModal();
        }}
      />

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.elevated }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Group</Text>

            <Text style={[styles.inputLabel, { color: colors.icon }]}>Group Name</Text>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Group name"
              placeholderTextColor={colors.icon}
              style={[styles.input, { color: colors.text, borderColor: colors.elevated, backgroundColor: colors.elevated }]}
            />

            <Text style={[styles.inputLabel, { color: colors.icon }]}>Description</Text>
            <TextInput
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Description"
              placeholderTextColor={colors.icon}
              multiline
              style={[
                styles.input,
                styles.textArea,
                { color: colors.text, borderColor: colors.elevated, backgroundColor: colors.elevated },
              ]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.elevated }]}
                onPress={() => setEditModalVisible(false)}
                disabled={savingEdit}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.violet }]}
                onPress={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.primaryButtonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={memberModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMemberModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.elevated }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Member</Text>
            <TextInput
              value={memberQuery}
              onChangeText={searchMembers}
              placeholder="Search by name or email"
              placeholderTextColor={colors.icon}
              style={[styles.input, { color: colors.text, borderColor: colors.elevated, backgroundColor: colors.elevated }]}
            />

            {searchingUsers ? (
              <ActivityIndicator size="small" color={colors.violet} style={styles.searchLoader} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => normalizeId(item._id) || `search-user-${index}`}
                style={styles.searchList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const itemId = normalizeId(item._id);
                  const isAdding = addingMemberId === itemId;

                  return (
                    <View style={[styles.searchItem, { borderBottomColor: colors.elevated }]}> 
                      <View style={styles.searchInfo}>
                        <Text style={[styles.searchName, { color: colors.text }]} numberOfLines={1}>
                          {item.name || 'Unnamed User'}
                        </Text>
                        <Text style={[styles.searchEmail, { color: colors.icon }]} numberOfLines={1}>
                          {item.email}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.addMemberButton, { backgroundColor: colors.violet }]}
                        onPress={() => handleAddMember(item)}
                        disabled={isAdding}
                      >
                        {isAdding ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.addMemberButtonText}>Add</Text>}
                      </TouchableOpacity>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  memberQuery.trim().length >= 2 ? (
                    <Text style={[styles.emptySearchText, { color: colors.icon }]}>No users found</Text>
                  ) : null
                }
              />
            )}

            <TouchableOpacity
              style={[styles.secondaryButton, styles.closeMemberButton, { borderColor: colors.elevated }]}
              onPress={() => setMemberModalVisible(false)}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={expenseSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseExpenseSheet}
      >
        <View style={styles.expenseSheetBackdrop}>
          <TouchableOpacity style={styles.expenseSheetOverlay} activeOpacity={1} onPress={handleCloseExpenseSheet} />
          <View style={[styles.expenseSheetCard, { backgroundColor: colors.background, borderColor: colors.elevated }]}> 
            <ExpenseFormView
              groupId={groupId}
              expenseId={editingExpenseId}
              expenseData={editingExpenseData}
              onClose={handleCloseExpenseSheet}
              onSuccess={handleExpenseSaved}
            />
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userErrorText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 12,
  },
  retryUserButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryUserButtonText: {
    color: '#ffffff',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  heroWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  heroTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMainRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  emojiGlowWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emojiGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  groupEmojiHero: {
    fontSize: 52,
  },
  heroTextBlock: {
    flex: 1,
  },
  groupNameHero: {
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
  },
  tripMetaWrap: {
    marginBottom: 8,
    gap: 4,
  },
  tripMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripMetaTextHero: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  membersHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  membersHeroText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPlaceholder: {
    width: 40,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuPanel: {
    position: 'absolute',
    top: 62,
    right: 16,
    width: 182,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  statsRowContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCellBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
  },
  statDivider: {
    width: 1,
    opacity: 0.7,
  },
  budgetWrap: {
    width: '100%',
    marginBottom: 4,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  budgetLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  budgetValue: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
  },
  budgetTrack: {
    height: 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: 12,
  },
  quickActionsStickyContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#7C5CFC15',
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionPrimary: {
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  quickActionDisabled: {
    opacity: 0.7,
  },
  quickActionSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionPill: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabsStickyWrap: {
    zIndex: 20,
    elevation: 6,
    borderBottomWidth: 1,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  expenseSheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  expenseSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  expenseSheetCard: {
    height: '94%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Syne_700Bold',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  searchLoader: {
    marginTop: 12,
  },
  searchList: {
    marginTop: 10,
    maxHeight: 260,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchInfo: {
    flex: 1,
  },
  searchName: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  searchEmail: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  addMemberButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 58,
    alignItems: 'center',
  },
  addMemberButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  emptySearchText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  closeMemberButton: {
    marginTop: 14,
    flex: 0,
  },
});
