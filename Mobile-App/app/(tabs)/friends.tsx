import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Settlement {
    id: string;
    fromUserName: string;
    toUserName: string;
    amount: number;
    note?: string;
    createdAt?: string;
}

export default function FriendsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();

        const [settlements, setSettlements] = useState<Settlement[]>([]);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);

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

    return (
                <SafeAreaView
                    style={[styles.container, { backgroundColor: colors.background }]}
                    edges={['top', 'left', 'right', 'bottom']}
                >
                    <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Settlement History
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                            All your transactions
                        </Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    ) : settlements.length === 0 ? (
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
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                No settlements yet
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                                Start settling with friends
                            </Text>
                        </ScrollView>
                    ) : (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={[
                                styles.listContent,
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
                            {settlements.map((settlement) => (
                                <View
                                    key={settlement.id}
                                    style={[
                                        styles.settlementCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: colors.elevated,
                                        },
                                    ]}
                                >
                                    <View style={styles.settlementLeft}>
                                        <View style={styles.avatarRow}>
                                            <View style={[styles.avatar, { backgroundColor: '#6366f1' }]}>
                                                <Text style={styles.avatarText}>
                                                    {settlement.fromUserName.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <Ionicons
                                                name="arrow-forward"
                                                size={18}
                                                color={colors.icon}
                                                style={{ marginHorizontal: 8 }}
                                            />
                                            <View style={[styles.avatar, { backgroundColor: '#22c55e' }]}>
                                                <Text style={styles.avatarText}>
                                                    {settlement.toUserName.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[styles.settlementNames, { color: colors.text }]}
                                                numberOfLines={1}
                                            >
                                                {settlement.fromUserName} → {settlement.toUserName}
                                            </Text>
                                            {settlement.note && (
                                                <Text
                                                    style={[styles.settlementNote, { color: colors.icon }]}
                                                    numberOfLines={1}
                                                >
                                                    {settlement.note}
                                                </Text>
                                            )}
                                            {settlement.createdAt && (
                                                <Text style={[styles.settlementDate, { color: colors.icon }]}>
                                                    {new Date(settlement.createdAt).toLocaleDateString('en-IN')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.settlementRight}>
                                        <Text style={[styles.settlementAmount, { color: colors.text }]}>
                                            ₹{settlement.amount.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
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
});
