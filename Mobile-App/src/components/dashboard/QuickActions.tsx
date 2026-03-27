import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionsProps {
  onAddPress: () => void;
  onGroupPress: () => void;
  onSettlePress: () => void;
}

const ACTIONS = [
  {
    key: 'add',
    label: 'Add',
    icon: 'add',
    backgroundColor: '#7C5CFC',
  },
  {
    key: 'group',
    label: 'Group',
    icon: 'people',
    backgroundColor: '#00E5B0',
  },
  {
    key: 'settle',
    label: 'Settle',
    icon: 'checkmark-circle',
    backgroundColor: '#FFB547',
  },
] as const;

export function QuickActions({ onAddPress, onGroupPress, onSettlePress }: QuickActionsProps) {
  const handlers = {
    add: onAddPress,
    group: onGroupPress,
    settle: onSettlePress,
  } as const;

  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.key}
          style={[styles.button, { backgroundColor: action.backgroundColor }]}
          onPress={handlers[action.key]}
          activeOpacity={0.85}
        >
          <Ionicons name={action.icon} size={16} color="#FFFFFF" />
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default QuickActions;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
});