import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettlements } from '@/src/hooks/useSettlements';
import { useAuth } from '@/src/context';

interface Settlement {
    id: string;
    fromUserId?: string;
    toUserId?: string;
    fromUserName: string;
    toUserName: string;
    amount: number;
    note?: string;
    createdAt?: string;
}

interface FriendCardSummary {
    friendId: string;
    friendName: string;
    netBalance: number;
    transactionCount: number;
}

export default function FriendsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const { settlements: pendingSettlements, summary: pendingSummary } = useSettlements();

        const [settlements, setSettlements] = useState<Settlement[]>([]);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);

        const currentUserId = String((user as any)?.id || (user as any)?._id || '');

        useEffect(() => {
                fetchUserSettlements();
        }, []);

        useFocusEffect(
            useCallback(() => {
                fetchUserSettlements();
            }, [])
        );

        const fetchUserSettlements = async () => {
            try {
                setLoading(true);
                const response = await apiService.settlements.getUserSettlements();
                const data = response?.data?.data || response?.data || [];
        
                const normalizedSettlements = (Array.isArray(data) ? data : []).map((item: any, index: number) => ({
                    id: item.id || item._id || `settlement-${index}`,
                    fromUserId: String(item.fromUser?._id || item.fromUser?.id || item.fromUserId || ''),
                    toUserId: String(item.toUser?._id || item.toUser?.id || item.toUserId || ''),
                    fromUserName: item.fromUserName || item.fromUser?.name || 'Unknown',
                    toUserName: item.toUserName || item.toUser?.name || 'Unknown',
                    amount: Number(item.amount || 0),
                    note: item.note || '',
                    createdAt: item.createdAt,
                }));
        
                setSettlements(normalizedSettlements);
            } catch (error) {
                console.error('Error fetching settlements:', error);
                setSettlements([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        const onRefresh = () => {
            setRefreshing(true);
            fetchUserSettlements();
        };

        const friendCards: FriendCardSummary[] = React.useMemo(() => {
            const map = new Map<string, FriendCardSummary>();

            settlements.forEach((item) => {
                const fromId = String(item.fromUserId || '');
                const toId = String(item.toUserId || '');

                let friendId = '';
                let friendName = '';
                let delta = 0;

                if (currentUserId && fromId === currentUserId) {
                    friendId = toId || item.toUserName;
                    friendName = item.toUserName;
                    delta = -Number(item.amount || 0);
                } else if (currentUserId && toId === currentUserId) {
                    friendId = fromId || item.fromUserName;
                    friendName = item.fromUserName;
                    delta = Number(item.amount || 0);
                } else {
                    friendId = toId || item.toUserName;
                    friendName = item.toUserName;
                    delta = Number(item.amount || 0);
                }

                const key = String(friendId || friendName || 'Unknown');
                const existing = map.get(key);
                if (!existing) {
                    map.set(key, {
                        friendId: key,
                        friendName: friendName || 'Unknown',
                        netBalance: delta,
                        transactionCount: 1,
                    });
                    return;
                }

                existing.netBalance += delta;
                existing.transactionCount += 1;
            });

            return Array.from(map.values()).sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));
        }, [settlements, currentUserId]);

        const pendingByFriend = React.useMemo(() => {
            const map = new Map<string, { pending: number; overdue: number }>();

            pendingSettlements.forEach((item) => {
                const friendId = String(item.friend?.id || '');
                if (!friendId) {
                    return;
                }

                const prev = map.get(friendId) || { pending: 0, overdue: 0 };
                prev.pending += 1;
                if (item.status === 'overdue') {
                    prev.overdue += 1;
                }
                map.set(friendId, prev);
            });

            return map;
        }, [pendingSettlements]);

    return (
                <SafeAreaView
                    style={[styles.container, { backgroundColor: colors.background }]}
                    edges={['top', 'left', 'right', 'bottom']}
                >
                    <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Friends</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.icon }]}>Manage balances and settlements</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.settlementsPill}
                            onPress={() => router.push('/settlements' as any)}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.settlementsPillText}>Settlements</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    ) : friendCards.length === 0 ? (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={[
                                styles.emptyContainer,
                                { paddingBottom: 110 + insets.bottom },
                            ]}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#6366f1"
                                />
                            }
                        >
                            <Ionicons name="swap-horizontal-outline" size={64} color={colors.icon} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No friends to show</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>Settlement activity will appear here</Text>
                        </ScrollView>
                    ) : (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={[
                                styles.listContent,
                                { paddingBottom: 24 + insets.bottom },
                            ]}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#6366f1"
                                />
                            }
                        >
                            {friendCards.map((friend) => {
                                const badge = pendingByFriend.get(friend.friendId) || { pending: 0, overdue: 0 };
                                const amountColor = friend.netBalance >= 0 ? '#22c55e' : '#ff5f7e';

                                return (
                                <TouchableOpacity
                                    key={friend.friendId}
                                    style={[
                                        styles.settlementCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: colors.elevated,
                                        },
                                    ]}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/friends/[id]' as any,
                                            params: { id: friend.friendId, name: friend.friendName },
                                        })
                                    }
                                    activeOpacity={0.88}
                                >
                                    <View style={styles.settlementLeft}>
                                        <View style={styles.avatarRow}>
                                            <View style={[styles.avatar, { backgroundColor: '#6366f1' }]}>
                                                <Text style={styles.avatarText}>
                                                    {friend.friendName.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[styles.settlementNames, { color: colors.text }]}
                                                numberOfLines={1}
                                            >
                                                {friend.friendName}
                                            </Text>
                                            <Text style={[styles.settlementDate, { color: colors.icon }]}> 
                                                {friend.transactionCount} transaction{friend.transactionCount !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.settlementRight}>
                                        <Text style={[styles.settlementAmount, { color: amountColor }]}>
                                            ₹{Math.abs(friend.netBalance).toFixed(2)}
                                        </Text>

                                        <View style={styles.badgesRow}>
                                            <Text style={[styles.pendingBadgeText, { color: colors.icon }]}>
                                                {badge.pending} pending
                                            </Text>
                                            {badge.overdue > 0 ? (
                                                <Text style={styles.overdueBadgeText}>⚠️ {badge.overdue} overdue</Text>
                                            ) : null}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                );
                            })}

                            <View
                                style={[
                                    styles.summaryStrip,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.elevated,
                                    },
                                ]}
                            >
                                <Text style={[styles.summaryLabel, { color: colors.icon }]}>📊 Across all friends</Text>

                                <View style={styles.summaryValuesRow}>
                                    <Text style={styles.summaryOweText}>
                                        You owe ₹{Number(pendingSummary?.totalYouOwe || 0).toFixed(2)}
                                    </Text>
                                    <Text style={styles.summaryGetText}>
                                        You get ₹{Number(pendingSummary?.totalYouGet || 0).toFixed(2)}
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={() => router.push('/settlements' as any)} activeOpacity={0.9}>
                                    <Text style={styles.summaryLinkText}>View All Settlements →</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
        header: {
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: '800',
            fontFamily: 'Syne',
            marginBottom: 4,
        },
        headerSubtitle: {
            fontSize: 14,
            fontWeight: '500',
        },
        settlementsPill: {
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7,
            backgroundColor: 'rgba(124,92,252,0.14)',
        },
        settlementsPillText: {
            color: '#9B7FFF',
            fontSize: 12,
            fontFamily: 'DMSans_700Bold',
        },
        scrollView: {
            flex: 1,
        },
        listContent: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
        },
        loadingContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
        },
    title: {
        fontSize: 24,
        fontWeight: '800',
        fontFamily: 'Syne',
    },
        emptyTitle: {
            fontSize: 20,
            fontWeight: '700',
            marginTop: 16,
        },
    subtitle: {
        fontSize: 16,
        marginTop: 8,
        },
        emptySubtitle: {
            fontSize: 14,
            marginTop: 8,
            textAlign: 'center',
        },
        settlementCard: {
            flexDirection: 'row',
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        settlementLeft: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        avatarRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatar: {
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarText: {
            fontSize: 11,
            fontWeight: '700',
            color: '#ffffff',
        },
        settlementNames: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 2,
        },
        settlementNote: {
            fontSize: 12,
            marginBottom: 2,
        },
        settlementDate: {
            fontSize: 11,
        },
        settlementRight: {
            alignItems: 'flex-end',
            marginLeft: 8,
        },
        settlementAmount: {
            fontSize: 16,
            fontWeight: '700',
        },
        badgesRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 4,
        },
        pendingBadgeText: {
            fontSize: 11,
            fontFamily: 'DMSans_500Medium',
        },
        overdueBadgeText: {
            color: '#FF5F7E',
            fontSize: 11,
            fontFamily: 'DMSans_700Bold',
        },
        summaryStrip: {
            marginTop: 6,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
        },
        summaryLabel: {
            fontSize: 12,
            fontFamily: 'DMSans_600SemiBold',
            marginBottom: 8,
        },
        summaryValuesRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
            gap: 12,
        },
        summaryOweText: {
            color: '#FF5F7E',
            fontSize: 13,
            fontFamily: 'Syne_700Bold',
            flex: 1,
        },
        summaryGetText: {
            color: '#00E5B0',
            fontSize: 13,
            fontFamily: 'Syne_700Bold',
            textAlign: 'right',
            flex: 1,
        },
        summaryLinkText: {
            color: '#9B7FFF',
            fontSize: 12,
            fontFamily: 'DMSans_700Bold',
    },
});
