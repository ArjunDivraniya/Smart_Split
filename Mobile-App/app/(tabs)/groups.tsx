import { StyleSheet, View, Text, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMemo, useState, useCallback } from 'react';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GroupCard } from '../../src/components/groups/GroupCard';
import { Group, GroupType } from '@/src/types/group.types';
import { useGroups } from '@/src/hooks/useGroups';
import { apiService } from '@/src/services';
import { GroupCardSkeleton } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { hapticImpactLight } from '@/src/utils/haptics';

type GroupFilter = 'all' | 'active' | 'trips' | 'archived';

const normalizeId = (value: unknown): string => {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'object') {
        const objectValue = value as Record<string, any>;
        const nestedId = objectValue._id || objectValue.id || objectValue.userId || objectValue.$oid;
        return nestedId ? String(nestedId).trim() : '';
    }

    return String(value).trim();
};

const extractUserIdFromMe = (response: any): string => {
    const payload = response?.data?.data || response?.data || {};
    const user = payload?.user || payload;

    return normalizeId(user?._id || user?.id || user?.userId);
};

const getGroupKey = (group: Group, index: number): string => {
    return normalizeId(group.id || group._id) || `group-${index}`;
};

export default function GroupsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const insets = useSafeAreaInsets();
    const isExpensePickerMode = mode === 'add-expense';

    const { groups, loading, error, refreshGroups, deleteGroup } = useGroups();
    const [selectedFilter, setSelectedFilter] = useState<GroupFilter>('all');
    const [currentUserId, setCurrentUserId] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const filterOptions: Array<{ key: GroupFilter; label: string }> = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'trips', label: 'Trips' },
        { key: 'archived', label: 'Archived' },
    ];

    const filteredGroups = useMemo(() => {
        switch (selectedFilter) {
            case 'active':
                return groups.filter((group) => group.isActive);
            case 'trips':
                return groups.filter((group) => group.type === GroupType.TRIP);
            case 'archived':
                return groups.filter((group) => !group.isActive);
            case 'all':
            default:
                return groups;
        }
    }, [groups, selectedFilter]);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                await refreshGroups();

                try {
                    const userResponse = await apiService.user.getMe();
                    setCurrentUserId(extractUserIdFromMe(userResponse));
                } catch {
                    setCurrentUserId('');
                }
            };

            loadData();
        }, [refreshGroups])
    );

    const handleCreateGroup = () => {
        router.push('/group/create');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        void hapticImpactLight();
        await refreshGroups();
        setRefreshing(false);
    };

    const handleGroupPress = (group: Group) => {
        const groupId = group.id || group._id;
        if (!groupId) {
            return;
        }

        if (isExpensePickerMode) {
            router.push(`/group/add-expense?id=${encodeURIComponent(String(groupId))}` as any);
            return;
        }

        router.push(`/group/${groupId}` as any);
    };

    const handleEditGroup = (group: Group) => {
        const groupId = group.id || group._id;
        if (!groupId) {
            return;
        }

        Alert.alert('Edit Group', 'Group editing screen will be added next.');
    };

    const handleDeleteGroup = (group: Group) => {
        const groupId = group.id || group._id;
        if (!groupId) {
            return;
        }

        Alert.alert(
            'Delete Group',
            `Are you sure you want to delete ${group.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const deleted = await deleteGroup(groupId);
                        if (!deleted) {
                            Alert.alert('Error', 'Failed to delete group. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const renderLoadingSkeleton = () => {
        const skeletonRows = Array.from({ length: 3 }, (_, index) => index);
        return (
            <View style={styles.skeletonList}>
                {skeletonRows.map((item) => (
                    <GroupCardSkeleton
                        key={`skeleton-${item}`}
                        style={{ marginBottom: 12 }}
                    />
                ))}
            </View>
        );
    };

    const renderEmptyState = () => (
        <EmptyState
            emoji="👥"
            title={isExpensePickerMode ? 'No groups found' : 'No groups yet. Create your first group!'}
            subtitle={isExpensePickerMode ? 'Create a group first' : 'Split your first trip, room, or event with friends.'}
            actionLabel={isExpensePickerMode ? undefined : 'Create Group'}
            onAction={isExpensePickerMode ? undefined : handleCreateGroup}
        />
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.elevated }]}> 
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {isExpensePickerMode ? 'Select Group' : 'Groups'}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                        {isExpensePickerMode
                            ? 'Choose a group to add expense'
                            : `${filteredGroups.length} ${filteredGroups.length === 1 ? 'group' : 'groups'}`}
                    </Text>
                </View>

                <View style={styles.filterContainer}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={filterOptions}
                        keyExtractor={(item) => item.key}
                        contentContainerStyle={styles.filterListContent}
                        renderItem={({ item }) => {
                            const isSelected = selectedFilter === item.key;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: isSelected ? colors.violet : colors.elevated,
                                            borderColor: isSelected ? colors.violet : colors.elevated,
                                        },
                                    ]}
                                    onPress={() => setSelectedFilter(item.key)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            { color: isSelected ? '#FFF' : colors.icon },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                {loading ? (
                    renderLoadingSkeleton()
                ) : error ? (
                    <ErrorState onRetry={handleRefresh} />
                ) : (
                    <FlatList
                        data={filteredGroups}
                        style={styles.list}
                        keyExtractor={(item, index) => getGroupKey(item, index)}
                        renderItem={({ item }) => (
                            <GroupCard
                                group={item}
                                currentUserId={currentUserId}
                                onPress={() => handleGroupPress(item)}
                                onEdit={handleEditGroup}
                                onDelete={handleDeleteGroup}
                            />
                        )}
                        contentContainerStyle={[
                            styles.listContent,
                            filteredGroups.length === 0 ? styles.listEmptyContent : null,
                        ]}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListEmptyComponent={renderEmptyState()}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                )}

                <TouchableOpacity
                    style={[
                        styles.fabButton,
                        {
                            backgroundColor: colors.violet,
                            bottom: (Platform.OS === 'ios' ? 98 : 82) + insets.bottom,
                        },
                    ]}
                    onPress={isExpensePickerMode ? () => router.push('/(tabs)/groups') : handleCreateGroup}
                    activeOpacity={0.9}
                >
                    <Ionicons name={isExpensePickerMode ? 'list' : 'add'} size={22} color="#FFF" />
                    <Text style={styles.fabButtonText}>{isExpensePickerMode ? 'View Groups' : 'New Group'}</Text>
                </TouchableOpacity>
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
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        fontFamily: 'Syne',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'DMSans_400Regular',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
    },
    filterListContent: {
        paddingRight: 12,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        marginRight: 8,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 12,
        fontFamily: 'DMSans_600SemiBold',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 110,
    },
    listEmptyContent: {
        flexGrow: 1,
    },
    separator: {
        height: 2,
    },
    skeletonList: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 110,
    },
    skeletonCard: {
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        minHeight: 140,
    },
    skeletonHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    skeletonCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: 12,
    },
    skeletonTextBlock: {
        flex: 1,
    },
    skeletonLineLg: {
        height: 10,
        width: '62%',
        borderRadius: 5,
        marginBottom: 8,
    },
    skeletonLineSm: {
        height: 8,
        width: '36%',
        borderRadius: 4,
    },
    skeletonLineMd: {
        height: 9,
        width: '72%',
        borderRadius: 5,
        marginBottom: 10,
    },
    skeletonLineFull: {
        height: 9,
        width: '100%',
        borderRadius: 5,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
        fontFamily: 'DMSans_400Regular',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontFamily: 'DMSans_600SemiBold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 88,
    },
    emptyIllustrationOuter: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    emptyIllustrationInner: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
        fontFamily: 'Syne',
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'DMSans_400Regular',
        maxWidth: 280,
    },
    fabButton: {
        position: 'absolute',
        right: 18,
        borderRadius: 999,
        paddingHorizontal: 18,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 50,
        gap: 6,
    },
    fabButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
    },
});
