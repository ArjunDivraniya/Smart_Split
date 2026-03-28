import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { ChartToggle } from '@/src/components/analytics/ChartToggle';
import { MonthSelector } from '@/src/components/analytics/MonthSelector';
import { DonutChart } from '@/src/components/analytics/DonutChart';
import { BarChart } from '@/src/components/analytics/BarChart';
import { InsightCard } from '@/src/components/analytics/InsightCard';
import { FriendSpendingCard } from '@/src/components/analytics/FriendSpendingCard';
import { ChartSkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { hapticImpactLight } from '@/src/utils/haptics';

export default function AnalyticsScreen() {
    const router = useRouter();

    const {
        loading,
        error,
        selectedMonth,
        selectedYear,
        activeChart,
        monthlyData,
        categoryGrandTotal,
        categoryData,
        insights,
        groupVsPersonalSummary,
        friendSpending,
        setSelectedMonth,
        setSelectedYear,
        setActiveChart,
        refreshAnalytics,
    } = useAnalytics();

    const [refreshing, setRefreshing] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);

    const chartOpacity = useRef(new Animated.Value(1)).current;
    const chartTranslateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        chartOpacity.setValue(0);
        chartTranslateY.setValue(16);

        Animated.parallel([
            Animated.timing(chartOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(chartTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [activeChart, chartOpacity, chartTranslateY]);

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            void hapticImpactLight();
            await refreshAnalytics();
        } finally {
            setRefreshing(false);
        }
    };

    const sortedCategories = useMemo(
        () => [...categoryData].sort((a, b) => b.total - a.total),
        [categoryData]
    );

    const visibleCategories = showAllCategories ? sortedCategories : sortedCategories.slice(0, 4);
    const topFriendAmount = friendSpending[0]?.totalShared || 0;
    const hasAnalyticsData =
        categoryGrandTotal > 0 ||
        sortedCategories.length > 0 ||
        friendSpending.length > 0 ||
        Number(groupVsPersonalSummary.totalGroup || 0) > 0 ||
        Number(groupVsPersonalSummary.totalPersonal || 0) > 0;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C5CFC" />}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <View style={styles.monthSelectorCompactWrap}>
                        <MonthSelector
                            month={selectedMonth}
                            year={selectedYear}
                            onChange={(month, year) => {
                                setSelectedMonth(month);
                                setSelectedYear(year);
                            }}
                        />
                    </View>
                </View>

                {!loading && error && !hasAnalyticsData ? (
                    <View style={styles.emptyWrap}>
                        <ErrorState onRetry={onRefresh} />
                    </View>
                ) : !loading && !hasAnalyticsData ? (
                    <View style={styles.emptyWrap}>
                        <EmptyState
                            emoji="📊"
                            title="Add expenses to see insights"
                            subtitle="Track group or personal expenses to unlock analytics trends"
                            actionLabel="Add Expense"
                            onAction={() => router.push('/(tabs)/groups' as any)}
                        />
                    </View>
                ) : (
                    <>

                        <View style={styles.sectionSpacing}>
                            {loading && !insights.length ? (
                                <View style={styles.placeholderCard}>
                                    <ActivityIndicator size="small" color="#7C5CFC" />
                                    <Text style={styles.placeholderText}>Loading smart insights...</Text>
                                </View>
                            ) : (
                                <InsightCard insights={insights} />
                            )}
                        </View>

                        <View style={styles.sectionSpacing}>
                            <ChartToggle
                                active={activeChart === 'monthly' ? 'categories' : 'monthly-trend'}
                                onChange={(value) => setActiveChart(value === 'categories' ? 'monthly' : 'group-vs-personal')}
                            />
                        </View>

                        <Animated.View
                            style={[
                                styles.sectionSpacing,
                                {
                                    opacity: chartOpacity,
                                    transform: [{ translateY: chartTranslateY }],
                                },
                            ]}
                        >
                            {loading && !categoryData.length && !monthlyData.length ? (
                                <ChartSkeletonLoader />
                            ) : activeChart === 'monthly' ? (
                                <DonutChart categories={categoryData} totalAmount={categoryGrandTotal} />
                            ) : (
                                <BarChart monthlyData={monthlyData} mode="split" />
                            )}
                        </Animated.View>

                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Category Breakdown</Text>

                    {loading && !visibleCategories.length ? (
                        <Text style={styles.emptyText}>Loading categories...</Text>
                    ) : null}

                    {visibleCategories.map((item) => (
                        <TouchableOpacity
                            key={`${item.category}-${item.total}`}
                            style={styles.categoryRow}
                            onPress={() =>
                                router.push({
                                    pathname: '/analytics/[category]',
                                    params: {
                                        category: item.category,
                                        month: String(selectedMonth),
                                        year: String(selectedYear),
                                    },
                                } as any)
                            }
                        >
                            <View style={styles.categoryLeft}>
                                <Text style={styles.categoryEmoji}>{item.emoji || '📦'}</Text>
                                <Text style={styles.categoryName}>{item.category}</Text>
                            </View>
                            <View style={styles.categoryRight}>
                                <Text style={styles.categoryMeta}>{item.percentage}%</Text>
                                <Text style={styles.categoryAmount}>₹{Math.round(item.total).toLocaleString('en-IN')}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {sortedCategories.length > 4 ? (
                        <TouchableOpacity onPress={() => setShowAllCategories((prev) => !prev)}>
                            <Text style={styles.linkText}>{showAllCategories ? 'Show less categories ↑' : 'See all categories →'}</Text>
                        </TouchableOpacity>
                    ) : null}
                        </View>

                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>Group vs Personal</Text>

                    <View style={styles.ratioRow}>
                        <Text style={styles.ratioLabel}>Group</Text>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.max(6, groupVsPersonalSummary.groupPercent)}%`,
                                        backgroundColor: '#7C5CFC',
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.ratioValue}>
                            {groupVsPersonalSummary.groupPercent}% ₹{Math.round(groupVsPersonalSummary.totalGroup).toLocaleString('en-IN')}
                        </Text>
                    </View>

                    <View style={styles.ratioRow}>
                        <Text style={styles.ratioLabel}>Personal</Text>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.max(6, groupVsPersonalSummary.personalPercent)}%`,
                                        backgroundColor: '#00E5B0',
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.ratioValue}>
                            {groupVsPersonalSummary.personalPercent}% ₹{Math.round(groupVsPersonalSummary.totalPersonal).toLocaleString('en-IN')}
                        </Text>
                    </View>
                        </View>

                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>You spend most with</Text>

                    {loading && !friendSpending.length ? (
                        <Text style={styles.emptyText}>Loading friend spending...</Text>
                    ) : null}

                    {friendSpending.slice(0, 3).map((friend) => (
                        <FriendSpendingCard key={friend.friendId} friend={friend} maxTotal={topFriendAmount} />
                    ))}

                    {!friendSpending.length && !loading ? (
                        <Text style={styles.emptyText}>No shared friend spending data yet.</Text>
                    ) : null}
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={{ height: 90 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F1A',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerRow: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    headerTitle: {
        color: '#F0F0FF',
        fontSize: 26,
        fontFamily: 'Syne_800ExtraBold',
    },
    monthSelectorCompactWrap: {
        flex: 1,
        maxWidth: 230,
    },
    sectionSpacing: {
        marginTop: 14,
    },
    emptyWrap: {
        minHeight: 420,
        justifyContent: 'center',
    },
    loaderCard: {
        minHeight: 220,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        backgroundColor: '#14141F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderCard: {
        minHeight: 90,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        backgroundColor: '#14141F',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    placeholderText: {
        color: '#8888AA',
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
    },
    panel: {
        marginTop: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        backgroundColor: '#14141F',
        padding: 12,
        gap: 10,
    },
    panelTitle: {
        color: '#F0F0FF',
        fontSize: 16,
        fontFamily: 'Syne_700Bold',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryEmoji: {
        fontSize: 16,
    },
    categoryName: {
        color: '#F0F0FF',
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
    },
    categoryRight: {
        alignItems: 'flex-end',
    },
    categoryMeta: {
        color: '#8888AA',
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
    },
    categoryAmount: {
        color: '#FFB547',
        fontSize: 13,
        fontFamily: 'DMSans_600SemiBold',
    },
    linkText: {
        color: '#9B7FFF',
        fontSize: 13,
        fontFamily: 'DMSans_600SemiBold',
        marginTop: 6,
    },
    ratioRow: {
        gap: 7,
    },
    ratioLabel: {
        color: '#F0F0FF',
        fontSize: 13,
        fontFamily: 'DMSans_600SemiBold',
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    ratioValue: {
        color: '#8888AA',
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
    },
    emptyText: {
        color: '#8888AA',
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
    },
    errorText: {
        marginTop: 12,
        color: '#FF5F7E',
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
    },
});
