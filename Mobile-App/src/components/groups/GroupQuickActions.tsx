import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GroupQuickActionsProps {
  colors: any;
  onAddExpense: () => void;
  onSettleUp: () => void;
  onMembers: () => void;
  onShare: () => void;
}

export const GroupQuickActions: React.FC<GroupQuickActionsProps> = ({
  colors,
  onAddExpense,
  onSettleUp,
  onMembers,
  onShare,
}) => {
  return (
    <View style={[styles.quickActionsStickyContainer, { backgroundColor: `${colors.violet}08`, borderBottomColor: colors.elevated }]}>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionPrimary, { backgroundColor: colors.violet }]}
          onPress={onAddExpense}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text style={styles.quickActionPrimaryText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionPill, { backgroundColor: colors.mint }]}
          onPress={onSettleUp}
          activeOpacity={0.9}
        >
          <Ionicons name="checkmark" size={16} color="#ffffff" />
          <Text style={styles.quickActionText}>Settle Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionPill, { backgroundColor: colors.elevated, borderColor: colors.elevated }]}
          onPress={onMembers}
          activeOpacity={0.9}
        >
          <Ionicons name="people-outline" size={16} color={colors.text} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionPill, { backgroundColor: colors.elevated, borderColor: colors.elevated }]}
          onPress={onShare}
          activeOpacity={0.9}
        >
          <Ionicons name="share-social-outline" size={16} color={colors.text} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionsStickyContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionPrimary: {
    flex: 1.3,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  quickActionPill: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
});
