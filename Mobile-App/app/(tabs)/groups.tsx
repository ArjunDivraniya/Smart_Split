import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services';
import { GroupCard } from '@/src/components/groups/GroupCard';
import { Group, GroupType, GROUP_TYPE_MAP } from '@/src/types/group.types';

export default function GroupsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const router = useRouter();

    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<'all' | GroupType>('all');

    const filterOptions: Array<{ key: 'all' | GroupType; label: string }> = [
        { key: 'all', label: 'All' },
        ...Object.values(GroupType).map((type) => ({
            key: type,
            label: GROUP_TYPE_MAP[type].label,
        })),
    ];

    const filteredGroups = selectedFilter === 'all'
        ? groups
        : groups.filter((group) => group.type === selectedFilter);

    useEffect(() => {
        fetchGroups();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchGroups();
        }, [])
    );

    const fetchGroups = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.groups.getAll();
            const payload = response?.data;
            const groupsData: Group[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                    ? payload.data
                    : [];

            setGroups(groupsData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                'Failed to load groups';

            setError(errorMessage);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = () => {
        router.push('/group/create');
    };

    const handleGroupPress = (groupId: string) => {
        router.push(`/group/${groupId}` as any);
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.violet} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Groups</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                        {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.violet }]}
                    onPress={handleCreateGroup}
                >
                    <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color={colors.coral} />
                    <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: colors.violet }]}
                        onPress={fetchGroups}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : groups.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color={colors.icon} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Groups Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                        Create your first group to start tracking shared expenses
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: colors.violet }]}
                        onPress={handleCreateGroup}
                    >
                        <Ionicons name="add" size={20} color="#FFF" />
                        <Text style={styles.emptyButtonText}>Create Group</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
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

                    {filteredGroups.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="funnel-outline" size={64} color={colors.icon} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No groups in this category</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>Try another filter to find your group</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredGroups}
                            style={styles.list}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <GroupCard
                                    group={item}
                                    onPress={() => handleGroupPress(item.id)}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => (
                                <View style={[styles.separator, { backgroundColor: colors.elevated }]} />
                            )}
                        />
                    )}
                </>
            )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
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
    createButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
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
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        fontFamily: 'Syne',
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'DMSans_400Regular',
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },
    emptyButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 14,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
    },
    separator: {
        height: 1,
        marginVertical: 8,
    },
});
