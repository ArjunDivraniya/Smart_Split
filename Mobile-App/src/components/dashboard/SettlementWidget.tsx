import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettlements } from '@/src/hooks/useSettlements';

const formatCurrency = (value: number): string => `₹${Math.round(value || 0).toLocaleString('en-IN')}`;

export function SettlementWidget() {
  const router = useRouter();
  const {
    summary,
    loading,
    isAllSettled,
    hasOverdue,
    overdueSettlements,
  } = useSettlements();

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    floating.start();

    return () => {
      floating.stop();
    };
  }, [floatAnim]);

  useEffect(() => {
    if (!hasOverdue) {
      pulseAnim.setValue(1);
      return;
    }

    const pulser = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulser.start();
    return () => pulser.stop();
  }, [hasOverdue, pulseAnim]);

  const pendingOverdueDays = useMemo(() => {
    if (!overdueSettlements.length) {
      return 0;
    }

    return overdueSettlements.reduce((max, item) => Math.max(max, item.daysPending || 0), 0);
  }, [overdueSettlements]);

  const data = summary || {
    totalYouOwe: 0,
    totalYouGet: 0,
    netBalance: 0,
    pendingCount: 0,
    overdueCount: 0,
    partialCount: 0,
  };

  if (loading) {
    return (
      <TouchableOpacity style={styles.widgetCard} onPress={() => router.push('/settlements' as any)} activeOpacity={0.9}>
        <View style={styles.loadingRow}>
          <View style={styles.loadingBlock} />
          <View style={styles.loadingBlock} />
        </View>
        <View style={styles.loadingLine} />
      </TouchableOpacity>
    );
  }

  if (isAllSettled) {
    return (
      <TouchableOpacity
        style={[styles.widgetCard, styles.allSettledCard]}
        onPress={() => router.push('/settlements' as any)}
        activeOpacity={0.9}
      >
        <Animated.Text style={[styles.allSettledEmoji, { transform: [{ translateY: floatAnim }] }]}>🎉</Animated.Text>
        <Text style={styles.allSettledTitle}>All Settled Up!</Text>
        <Text style={styles.allSettledSubtitle}>No pending settlements</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.widgetCard} onPress={() => router.push('/settlements' as any)} activeOpacity={0.9}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>💰 Pending Settlements</Text>
        <Text style={styles.seeAllText}>See All →</Text>
      </View>

      <View style={styles.columnsRow}>
        <View style={styles.column}>
          <Text style={styles.columnLabel}>📤 You Owe</Text>
          <Text style={[styles.columnAmount, styles.oweAmount]}>{formatCurrency(data.totalYouOwe)}</Text>
          <Text style={styles.columnPending}>{data.pendingCount} pending</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.column}>
          <Text style={styles.columnLabel}>📥 You Get</Text>
          <Text style={[styles.columnAmount, styles.getAmount]}>{formatCurrency(data.totalYouGet)}</Text>
          <Text style={styles.columnPending}>{data.pendingCount} pending</Text>
        </View>
      </View>

      {hasOverdue ? (
        <Animated.View style={[styles.overdueRow, { opacity: pulseAnim }]}>
          <Text style={styles.overdueText}>
            ⚠️ {data.overdueCount} overdue · longest {pendingOverdueDays} days
          </Text>
        </Animated.View>
      ) : null}
    </TouchableOpacity>
  );
}

export default SettlementWidget;

const styles = StyleSheet.create({
  widgetCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#14141F',
    padding: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  loadingBlock: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  loadingLine: {
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '62%',
  },
  allSettledCard: {
    backgroundColor: 'rgba(0,229,176,0.12)',
    borderColor: 'rgba(0,229,176,0.35)',
    alignItems: 'center',
    paddingVertical: 18,
  },
  allSettledEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  allSettledTitle: {
    color: '#00E5B0',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  allSettledSubtitle: {
    color: '#95B8AE',
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#F0F0FF',
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
  },
  seeAllText: {
    color: '#9B7FFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    color: '#AAAAC4',
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    marginBottom: 4,
  },
  columnAmount: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    marginBottom: 3,
  },
  oweAmount: {
    color: '#FF5F7E',
  },
  getAmount: {
    color: '#00E5B0',
  },
  columnPending: {
    color: '#777796',
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 12,
  },
  overdueRow: {
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,95,126,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,95,126,0.25)',
  },
  overdueText: {
    color: '#FF5F7E',
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
});
