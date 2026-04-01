import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SplitResult, formatAmount } from '@/src/utils/splitCalculator';

interface SplitPreviewProps {
  splitResults: SplitResult[] | null;
  currentUserId: string;
  totalAmount: number;
  validationError?: string;
}

const roundTo2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const SplitPreview: React.FC<SplitPreviewProps> = ({
  splitResults,
  currentUserId,
  totalAmount,
  validationError,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency

  const splitSum = useMemo(() => {
    if (!splitResults || splitResults.length === 0) {
      return 0;
    }
    return roundTo2(splitResults.reduce((sum, member) => sum + Number(member.amount || 0), 0));
  }, [splitResults]);

  const totalMismatch = useMemo(() => {
    if (!splitResults || splitResults.length === 0 || totalAmount <= 0) {
      return false;
    }
    return Math.abs(splitSum - roundTo2(totalAmount)) > 0.01;
  }, [splitResults, splitSum, totalAmount]);

  const warningText = useMemo(() => {
    if (totalMismatch) {
      return `Split doesn't add up to ₹${formatAmount(totalAmount)}`;
    }
    return validationError || '';
  }, [totalMismatch, totalAmount, validationError]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Split Preview</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>Live calculation</Text>
      </View>

      {!splitResults || splitResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.icon }]}>Select members and amount to see preview</Text>
        </View>
      ) : (
        <View style={styles.rowsWrap}>
          {splitResults.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            return (
              <View
                key={member.userId}
                style={[
                  styles.memberRow,
                  {
                    backgroundColor: isCurrentUser ? 'rgba(124, 92, 252, 0.18)' : colors.background,
                    borderColor: isCurrentUser ? colors.violet : colors.elevated,
                  },
                ]}
              >
                <View style={styles.memberLeft}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isCurrentUser ? colors.violet : colors.elevated },
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: isCurrentUser ? '#ffffff' : colors.text }]}> 
                      {member.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.nameText, { color: colors.text }]}> 
                    {isCurrentUser ? 'You' : member.userName}
                  </Text>
                </View>

                <Text style={styles.amountText}>₹{formatAmount(member.amount)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {(warningText || validationError) && (
        <View style={styles.warningRow}>
          <Ionicons name="warning" size={16} color="#EF4444" />
          <Text style={styles.warningText}>{warningText || validationError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  emptyState: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  rowsWrap: {
    gap: 8,
  },
  memberRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  nameText: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  amountText: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    color: '#22C55E',
    marginLeft: 12,
  },
  warningRow: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 8,
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    flex: 1,
  },
});

export default SplitPreview;
