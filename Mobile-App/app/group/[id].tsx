import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { AvatarGroup } from '@/src/components/groups/AvatarGroup';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/services/api';
import { addMember } from '@/src/services/groups.service';

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
    router.push(`/group/add-expense?id=${id}`);
  };

  const groupId = normalizeId(id || group?.id || group?._id);

  if (loading || !group) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.violet} />
        </View>
      </SafeAreaView>
    );
  }

  const isTrip = group.type === GroupType.TRIP;
  const authUserId = normalizeId((user as any)?._id || user?.id || (user as any)?.userId);
  const groupCreatorId = normalizeId(
    typeof group.createdBy === 'object'
      ? group.createdBy?._id || (group.createdBy as any)?.id || (group.createdBy as any)?.userId
      : group.createdBy
  );
  const signedInUserId = authUserId || normalizeId(currentUserId);
  const isCreator = Boolean(signedInUserId && groupCreatorId && signedInUserId === groupCreatorId);

  const tabs = isTrip 
    ? ['expenses', 'balances', 'timeline', 'summary']
    : ['expenses', 'balances', 'summary'];
  const memberPreview = (group.members || []).map((member) => ({
    id: member.userId,
    name: member.userName,
    email: member.email,
  }));

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
    const actions = [
      'Edit Group',
      'Add Member',
      'Archive Group',
      'Delete Group',
      'Cancel',
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: actions,
          cancelButtonIndex: 4,
          destructiveButtonIndex: 3,
          userInterfaceStyle: colorScheme,
        },
        (selectedIndex) => {
          if (selectedIndex === 0) openEditModal();
          if (selectedIndex === 1) openAddMemberModal();
          if (selectedIndex === 2) handleArchiveGroup();
          if (selectedIndex === 3) handleDeleteGroup();
        }
      );
      return;
    }

    Alert.alert('Group Actions', 'Choose an action', [
      { text: 'Edit Group', onPress: openEditModal },
      { text: 'Add Member', onPress: openAddMemberModal },
      { text: 'Archive Group', onPress: handleArchiveGroup },
      { text: 'Delete Group', onPress: handleDeleteGroup, style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
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
            <View style={styles.groupMetaRow}>
              <Text style={[styles.groupInfo, { color: colors.icon }]}>
                {group.members?.length || 0} members
              </Text>
              <AvatarGroup members={memberPreview} size="medium" />
            </View>
          </View>
        </View>
        {isCreator ? (
          <TouchableOpacity onPress={openGroupActions} style={styles.menuButton} activeOpacity={0.8}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.menuPlaceholder} />
        )}
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
  },
  groupMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPlaceholder: {
    width: 32,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
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
