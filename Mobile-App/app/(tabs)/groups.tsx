import { StyleSheet, View, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMemo, useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GroupCard } from '../../src/components/groups/GroupCard';
import { Group, GroupType } from '@/src/types/group.types';
import { useGroups } from '@/src/hooks/useGroups';

type GroupFilter = 'all' | 'active' | 'trips' | 'archived';

export default function GroupsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { groups, loading, error, refreshGroups } = useGroups();
    const [selectedFilter, setSelectedFilter] = useState<GroupFilter>('all');

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
            refreshGroups();
        }, [refreshGroups])
    );

    const handleCreateGroup = () => {
        router.push('/group/create');
    };

    const handleGroupPress = (group: Group) => {
        const groupId = group.id || group._id;
        if (!groupId) {
            return;
        }
        router.push(`/group/${groupId}` as any);
    };

    const renderLoadingSkeleton = () => {
        const skeletonRows = Array.from({ length: 4 }, (_, index) => index);
        return (
            <View style={styles.skeletonList}>
                {skeletonRows.map((item) => (
                    <View
                        key={`skeleton-${item}`}
                        style={[styles.skeletonCard, { backgroundColor: colors.elevated }]}
                    >
                        <View style={styles.skeletonHeaderRow}>
                            <View style={[styles.skeletonCircle, { backgroundColor: colors.icon }]} />
                            <View style={styles.skeletonTextBlock}>
                                <View style={[styles.skeletonLineLg, { backgroundColor: colors.icon }]} />
                                <View style={[styles.skeletonLineSm, { backgroundColor: colors.icon }]} />
                            </View>
                        </View>
                        <View style={[styles.skeletonLineMd, { backgroundColor: colors.icon }]} />
                        <View style={[styles.skeletonLineFull, { backgroundColor: colors.icon }]} />
                    </View>
                ))}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIllustrationOuter, { backgroundColor: colors.elevated }]}> 
                <View style={[styles.emptyIllustrationInner, { borderColor: colors.icon }]}> 
                    <Ionicons name="people-outline" size={46} color={colors.icon} />
                </View>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No groups found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>Create a new group to start tracking shared expenses.</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.elevated }]}> 
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Groups</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                        {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
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
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={48} color={colors.coral} />
                        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: colors.violet }]}
                            onPress={refreshGroups}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredGroups.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={filteredGroups}
                        style={styles.list}
                        keyExtractor={(item, index) => item.id || item._id || `group-${index}`}
                        renderItem={({ item }) => (
                            <GroupCard
                                group={item}
                                onPress={() => handleGroupPress(item)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
                    onPress={handleCreateGroup}
                    activeOpacity={0.9}
                >
                    <Ionicons name="add" size={22} color="#FFF" />
                    <Text style={styles.fabButtonText}>New Group</Text>
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
