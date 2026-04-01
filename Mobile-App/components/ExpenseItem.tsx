import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ExpenseItemProps {
  expense: {
    _id: string;
    description: string;
    amount: number;
    splitCount?: number;
    paidBy: {
      _id: string;
      name: string;
    };
    category?: string;
    date: string;
    receiptUrl?: string;
    notes?: string;
  };
  currentUserId: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  currentUserId,
  onPress,
  onEdit,
  onDelete,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const isPaidByCurrentUser = expense.paidBy._id === currentUserId;
  const payerName = isPaidByCurrentUser ? 'You' : expense.paidBy?.name || 'Unknown';
  const splitCount = Number(expense.splitCount || 0);
  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      Food: 'fast-food',
      Transport: 'car',
      Accommodation: 'bed',
      Entertainment: 'game-controller',
      Shopping: 'cart',
      Other: 'ellipsis-horizontal',
    };
    return icons[category || 'Other'] || 'ellipsis-horizontal';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.elevated,
          borderColor: `${colors.violet}30`,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${isPaidByCurrentUser ? colors.mint : colors.violet}15` },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(expense.category) as any}
            size={22}
            color={isPaidByCurrentUser ? colors.mint : colors.violet}
          />
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {expense.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.icon }]}>
            {payerName} · {formattedDate}
          </Text>
          {expense.category && (
            <View style={[styles.categoryTag, { backgroundColor: `${colors.violet}10` }]}>
              <Text style={[styles.categoryTagText, { color: colors.icon }]}>
                {expense.category}
              </Text>
            </View>
          )}
        </View>
        
        {expense.notes ? (
          <Text style={[styles.notesText, { color: colors.tabIconDefault }]} numberOfLines={1}>
            {expense.notes}
          </Text>
        ) : splitCount > 0 ? (
          <Text style={[styles.splitText, { color: colors.tabIconDefault }]}>
            Split among {splitCount} people
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSection}>
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amountText,
              { color: isPaidByCurrentUser ? colors.mint : colors.text },
            ]}
          >
            ₹{expense.amount.toLocaleString('en-IN')}
          </Text>
          {expense.receiptUrl && (
            <Ionicons name="receipt-outline" size={12} color={colors.icon} style={styles.receiptIcon} />
          )}
        </View>

        {(onEdit || onDelete) && (
          <View style={styles.actionRow}>
            {onEdit && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="pencil" size={18} color={colors.violet} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{ marginLeft: 12 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.coral} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  leftSection: {
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular_Italic',
    marginTop: 2,
  },
  splitText: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
  },
  receiptIcon: {
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
