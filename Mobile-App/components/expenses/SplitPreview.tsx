import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SplitResult, formatAmount } from '@/src/utils/splitCalculator';

interface SplitPreviewProps {
  splitResults: SplitResult[] | null;
  paidByUserId: string;
  paidByUserName: string;
  totalAmount: number;
  currentUserId: string;
  validationError?: string;
}

export const SplitPreview: React.FC<SplitPreviewProps> = ({
  splitResults,
  paidByUserId,
  paidByUserName,
  totalAmount,
  currentUserId,
  validationError,
}) => {
  if (validationError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.headerTitle}>Invalid Split</Text>
        </View>
        
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      </View>
    );
  }

  if (!splitResults || splitResults.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="eye-outline" size={20} color="#64748b" />
          <Text style={styles.headerTitle}>Split Preview</Text>
        </View>
        
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Select members to see split preview</Text>
        </View>
      </View>
    );
  }

  const currentUserSplit = splitResults.find((s) => s.userId === currentUserId);
  const userOwes = currentUserSplit?.amount || 0;
  const userPaid = paidByUserId === currentUserId ? totalAmount : 0;
  const getsBack = userPaid - userOwes;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="eye" size={20} color="#6366f1" />
        <Text style={styles.headerTitle}>Split Preview</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Paid by</Text>
          <Text style={styles.summaryValue}>
            {paidByUserId === currentUserId ? 'You' : paidByUserName}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={[styles.summaryValue, styles.amountHighlight]}>
            ₹{formatAmount(totalAmount)}
          </Text>
        </View>

        {paidByUserId === currentUserId && (
          <View style={[styles.highlightBox, getsBack > 0 ? styles.highlightBoxPositive : styles.highlightBoxNegative]}>
            <Ionicons
              name={getsBack > 0 ? 'trending-up' : getsBack < 0 ? 'trending-down' : 'checkmark-circle'}
              size={20}
              color={getsBack > 0 ? '#22c55e' : getsBack < 0 ? '#ef4444' : '#64748b'}
            />
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightLabel}>
                {getsBack > 0 ? 'You get back' : getsBack < 0 ? 'You owe extra' : "You're settled"}
              </Text>
              {getsBack !== 0 && (
                <Text style={[styles.highlightAmount, { color: getsBack > 0 ? '#22c55e' : '#ef4444' }]}>
                  ₹{formatAmount(Math.abs(getsBack))}
                </Text>
              )}
            </View>
          </View>
        )}

        {paidByUserId !== currentUserId && userOwes > 0 && (
          <View style={[styles.highlightBox, styles.highlightBoxNeutral]}>
            <Ionicons name="wallet" size={20} color="#6366f1" />
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightLabel}>You owe</Text>
              <Text style={[styles.highlightAmount, { color: '#6366f1' }]}>
                ₹{formatAmount(userOwes)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Split Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Split Breakdown</Text>
        
        <ScrollView style={styles.breakdownList} nestedScrollEnabled>
          {splitResults.map((result, index) => {
            const isCurrentUser = result.userId === currentUserId;
            const isPayer = result.userId === paidByUserId;

            return (
              <View
                key={result.userId}
                style={[
                  styles.breakdownRow,
                  isCurrentUser && styles.breakdownRowHighlight,
                ]}
              >
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownAvatar, isCurrentUser && styles.breakdownAvatarCurrent]}>
                    <Text style={styles.breakdownAvatarText}>
                      {result.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View>
                    <Text style={[styles.breakdownName, isCurrentUser && styles.breakdownNameCurrent]}>
                      {isCurrentUser ? 'You' : result.userName}
                    </Text>
                    <Text style={styles.breakdownPercentage}>
                      {result.percentage.toFixed(1)}% of total
                    </Text>
                  </View>

                  {isPayer && (
                    <View style={styles.payerBadge}>
                      <Ionicons name="card" size={12} color="#ffffff" />
                      <Text style={styles.payerBadgeText}>Paid</Text>
                    </View>
                  )}
                </View>

                <View style={styles.breakdownRight}>
                  <Text style={[styles.breakdownAmount, isCurrentUser && styles.breakdownAmountCurrent]}>
                    ₹{formatAmount(result.amount)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  amountHighlight: {
    fontSize: 16,
    color: '#6366f1',
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  highlightBoxPositive: {
    backgroundColor: '#dcfce7',
  },
  highlightBoxNegative: {
    backgroundColor: '#fef2f2',
  },
  highlightBoxNeutral: {
    backgroundColor: '#ede9fe',
  },
  highlightTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  highlightLabel: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  highlightAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  breakdownContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  breakdownList: {
    maxHeight: 200,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  breakdownRowHighlight: {
    backgroundColor: '#ede9fe',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  breakdownAvatarCurrent: {
    backgroundColor: '#8b5cf6',
  },
  breakdownAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  breakdownNameCurrent: {
    fontWeight: '700',
    color: '#8b5cf6',
  },
  breakdownPercentage: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  payerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  payerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  breakdownRight: {
    marginLeft: 12,
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  breakdownAmountCurrent: {
    color: '#8b5cf6',
  },
});
