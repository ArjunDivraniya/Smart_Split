import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Participant, SplitType } from '@/src/utils/splitCalculator';

interface SplitTypeSelectorProps {
  selected: SplitType;
  onSelect: (type: SplitType) => void;
  totalAmount?: number;
  participants?: Participant[];
}

type SplitOption = {
  value: SplitType;
  label: string;
};

const SPLIT_OPTIONS: SplitOption[] = [
  { value: 'equally', label: 'Equal' },
  { value: 'percentage', label: '% Percentage' },
  { value: 'unequally', label: 'Exact' },
  { value: 'shares', label: 'Shares' },
];

const roundTo2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const SplitTypeSelector: React.FC<SplitTypeSelectorProps> = ({
  selected,
  onSelect,
  totalAmount = 0,
  participants = [],
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency

  const percentageStatus = useMemo(() => {
    if (selected !== 'percentage') {
      return null;
    }

    const total = roundTo2(
      participants.reduce((sum, member) => sum + Number(member.value || 0), 0)
    );
    const isValid = Math.abs(total - 100) < 0.01;

    return {
      text: `Total: ${total.toFixed(2)}% ${isValid ? '(100% complete)' : '(must be 100%)'}`,
      valid: isValid,
    };
  }, [selected, participants]);

  const exactStatus = useMemo(() => {
    if (selected !== 'unequally') {
      return null;
    }

    const entered = roundTo2(
      participants.reduce((sum, member) => sum + Number(member.value || 0), 0)
    );
    const expected = roundTo2(totalAmount);
    const isValid = Math.abs(entered - expected) < 0.01;

    return {
      text: `Total: ₹${entered.toFixed(2)} / ₹${expected.toFixed(2)} ${
        isValid ? '(matched)' : '(must match expense)'
      }`,
      valid: isValid,
    };
  }, [selected, participants, totalAmount]);

  const helperText = useMemo(() => {
    switch (selected) {
      case 'equally':
        return 'Equal split auto-divides amount among selected members.';
      case 'percentage':
        return 'Set percentage for each member. Total must equal 100%.';
      case 'unequally':
        return 'Set exact amount for each member. Total must match expense.';
      case 'shares':
        return 'Set share counts. 2 shares means double payment vs 1 share.';
      default:
        return '';
    }
  }, [selected]);

  const runningStatus = percentageStatus || exactStatus;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
      <Text style={[styles.title, { color: colors.text }]}>Split Type</Text>

      <View style={[styles.segmentWrap, { backgroundColor: colors.background, borderColor: colors.elevated }]}>
        {SPLIT_OPTIONS.map((option) => {
          const isSelected = option.value === selected;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                isSelected && {
                  backgroundColor: 'rgba(124, 92, 252, 0.22)',
                  borderColor: colors.violet,
                },
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: isSelected ? '#DCCEFF' : colors.icon },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.helperText, { color: colors.icon }]}>{helperText}</Text>

      {runningStatus && (
        <Text
          style={[
            styles.runningText,
            { color: runningStatus.valid ? '#22C55E' : '#EF4444' },
          ]}
        >
          {runningStatus.text}
        </Text>
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: 'DMSans_700Bold',
  },
  segmentWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
  },
  helperText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'DMSans_400Regular',
  },
  runningText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
});

export default SplitTypeSelector;
