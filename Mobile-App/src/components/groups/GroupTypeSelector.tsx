import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  border: 'rgba(255, 255, 255, 0.08)',
};

export type GroupTypeSelectorValue =
  | 'trip'
  | 'college'
  | 'flatmates'
  | 'event'
  | 'food_run'
  | 'office'
  | 'custom';

type GroupTypeOption = {
  value: GroupTypeSelectorValue;
  emoji: string;
  label: string;
  description: string;
};

const GROUP_TYPE_OPTIONS: GroupTypeOption[] = [
  { value: 'trip', emoji: '✈️', label: 'Trip', description: 'Travel & vacation expenses' },
  { value: 'college', emoji: '🎓', label: 'College', description: 'Shared student expenses' },
  { value: 'flatmates', emoji: '🏠', label: 'Flatmates', description: 'Rent, bills and groceries' },
  { value: 'event', emoji: '🎉', label: 'Event', description: 'Party and event planning' },
  { value: 'food_run', emoji: '🍔', label: 'Food Run', description: 'Quick food and snack splits' },
  { value: 'office', emoji: '💼', label: 'Office', description: 'Team lunches and office costs' },
  { value: 'custom', emoji: '➕', label: 'Custom', description: 'Create your own group style' },
];

interface GroupTypeSelectorProps {
  selectedType: GroupTypeSelectorValue | null;
  onSelectType: (type: GroupTypeSelectorValue) => void;
}

export function GroupTypeSelector({ selectedType, onSelectType }: GroupTypeSelectorProps) {
  return (
    <View style={styles.grid}>
      {GROUP_TYPE_OPTIONS.map((option) => {
        const isSelected = selectedType === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.typeCard, isSelected && styles.typeCardSelected]}
            onPress={() => onSelectType(option.value)}
            activeOpacity={0.8}
          >
            <Text style={styles.typeEmoji}>{option.emoji}</Text>
            <Text style={styles.typeLabel}>{option.label}</Text>
            <Text style={styles.typeDesc}>{option.description}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 144,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCardSelected: {
    borderColor: COLORS.violet,
    backgroundColor: 'rgba(124, 92, 252, 0.16)',
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    lineHeight: 14,
  },
});
