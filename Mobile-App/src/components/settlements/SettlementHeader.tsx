import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SettlementSummary } from '@/src/types/settlement.types';

interface SettlementHeaderProps {
  summary: SettlementSummary;
  onSettleAll: () => void;
}

const formatCurrency = (value: number): string => {
  return `₹${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;
};

export function SettlementHeader({ summary, onSettleAll }: SettlementHeaderProps) {
  const netMeta = useMemo(() => {
    if (summary.netBalance > 0) {
      return {
        color: '#00E5B0',
        trend: 'in your favor',
      };
    }

    if (summary.netBalance < 0) {
      return {
        color: '#FF5F7E',
        trend: 'you owe more',
      };
    }

    return {
      color: '#9A9AB6',
      trend: 'balanced',
    };
  }, [summary.netBalance]);

  const showSettleAll = summary.totalYouOwe > 0;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.statBox, styles.oweBox]}>
          <Text style={styles.labelText}>📤 You Owe</Text>
          <Text style={[styles.amountText, styles.oweAmount]}>{formatCurrency(summary.totalYouOwe)}</Text>
          <Text style={styles.mutedText}>{summary.totalYouOwe > 0 ? `${summary.pendingCount} pending` : '0 pending'}</Text>
        </View>

        <View style={[styles.statBox, styles.getBox]}>
          <Text style={styles.labelText}>📥 You Get</Text>
          <Text style={[styles.amountText, styles.getAmount]}>{formatCurrency(summary.totalYouGet)}</Text>
          <Text style={styles.mutedText}>{summary.totalYouGet > 0 ? `${summary.pendingCount} pending` : '0 pending'}</Text>
        </View>
      </View>

      <View style={styles.netLine}>
        <Text style={styles.netLabel}>Net Balance: </Text>
        <Text style={[styles.netAmount, { color: netMeta.color }]}>{formatCurrency(summary.netBalance)}</Text>
        <Text style={styles.netTrend}> · {netMeta.trend}</Text>
      </View>

      {showSettleAll ? (
        <TouchableOpacity style={styles.buttonOuter} onPress={onSettleAll} activeOpacity={0.9}>
          <LinearGradient
            colors={['#7C5CFC', '#6A48FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Settle All You Owe →</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default SettlementHeader;

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  oweBox: {
    backgroundColor: 'rgba(255,95,126,0.12)',
    borderColor: 'rgba(255,95,126,0.50)',
  },
  getBox: {
    backgroundColor: 'rgba(0,229,176,0.12)',
    borderColor: 'rgba(0,229,176,0.50)',
  },
  labelText: {
    color: '#C4C4DD',
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    marginBottom: 6,
  },
  amountText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 26,
    lineHeight: 30,
    marginBottom: 5,
  },
  oweAmount: {
    color: '#FF5F7E',
  },
  getAmount: {
    color: '#00E5B0',
  },
  mutedText: {
    color: '#9A9AB6',
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  netLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  netLabel: {
    color: '#C4C4DD',
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  netAmount: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
  },
  netTrend: {
    color: '#9A9AB6',
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  buttonOuter: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
});
