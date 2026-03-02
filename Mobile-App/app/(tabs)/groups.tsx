import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services';
import { GroupCard } from '@/src/components/groups/GroupCard';
import { Group } from '@/src/types/group.types';

export default function GroupsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const router = useRouter();
    
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch groups on mount
    useEffect(() => {
        fetchGroups();
    }, []);

    // Refetch groups when tab is focused
    useFocusEffect(
        useCallback(() => {
            fetchGroups();
        }, [])
    );

    const fetchGroups = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('πŸ"„ Fetching groups from API...');
            const response = await apiService.groups.getAll();
            const payload = response?.data;
            const groupsData: Group[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                    ? payload.data
                    : [];

            console.log('βœ… Groups fetched successfully:', groupsData.length, 'groups');
            
            // Log group types to verify unified data
            const groupsByType: Record<string, number> = {};
            groupsData.forEach((group: Group) => {
                groupsByType[group.type] = (groupsByType[group.type] || 0) + 1;
            });
            console.log('πŸ"ƒ Group types distribution:', groupsByType);
            
            // Verify both id and _id are present in the unified response
            if (groupsData.length > 0) {
                const firstGroup = groupsData[0];
                console.log('πŸ"Ž Sample group structure:', {
                    hasId: !!firstGroup.id,
                    has_id: !!firstGroup._id,
                    type: firstGroup.type
                });
            }
            
            setGroups(groupsData);
        } catch (err: any) {
            console.error('❌ Error fetching groups:', err);
            console.error('Full error object:', JSON.stringify(err, null, 2));
            
            const errorMessage = 
                err?.response?.data?.error || 
                err?.response?.data?.message || 
                err?.message || 
                'Failed to load groups';
            
            console.error('📢 Error message:', errorMessage);
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
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.violet} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Groups</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                        {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.violet }]}
                    onPress={handleCreateGroup}
                >
                    <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {error ? (
                <View style={[styles.errorContainer]}>
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
                <View style={[styles.emptyContainer]}>
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
                <FlatList
                    data={groups}
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
        </View>
    );
}

const styles = StyleSheet.create({
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
