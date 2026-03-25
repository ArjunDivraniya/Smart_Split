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
  const colors = Colors[colorScheme];
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
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${colors.violet}22` },
            isPaidByCurrentUser && styles.iconCirclePaid,
          ]}
        >
          <Ionicons
            name={getCategoryIcon(expense.category) as any}
            size={24}
            color={isPaidByCurrentUser ? '#22c55e' : '#6366f1'}
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.description, { color: colors.text }]}>{expense.description}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.paidBy, { color: colors.icon }]}>
            {`${payerName} paid`}
          </Text>
          <Text style={[styles.date, { color: colors.icon }]}> • {formattedDate}</Text>
          {expense.category && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.elevated }]}> 
              <Text style={[styles.categoryText, { color: colors.text }]}>{expense.category}</Text>
            </View>
          )}
        </View>
        {splitCount > 0 && (
          <Text style={[styles.splitInfo, { color: colors.icon }]}>Split among {splitCount} people</Text>
        )}
        {expense.notes && (
          <Text style={[styles.notes, { color: colors.icon }]} numberOfLines={1}>
            {expense.notes}
          </Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        <Text style={[styles.amount, isPaidByCurrentUser && styles.amountPaid]}>
          ₹{expense.amount.toFixed(2)}
        </Text>
        {expense.receiptUrl && (
          <Ionicons name="receipt" size={16} color="#94a3b8" />
        )}
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Ionicons name="pencil" size={20} color="#6366f1" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePaid: {
    backgroundColor: '#dcfce7',
  },
  contentContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  paidBy: {
    fontSize: 13,
    color: '#64748b',
  },
  date: {
    fontSize: 13,
    color: '#94a3b8',
  },
  categoryBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  notes: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  splitInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  rightContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  amountPaid: {
    color: '#22c55e',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});
