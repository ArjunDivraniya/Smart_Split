import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const getMonthLabel = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const MonthSelector = ({ month, year, onChange }: MonthSelectorProps) => {
  const now = new Date();
  const maxDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const selectedDate = useMemo(() => new Date(year, month - 1, 1), [month, year]);
  const canGoNext = selectedDate < maxDate;
  const canGoPrev = selectedDate > minDate;

  const moveMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);

    if (next > maxDate || next < minDate) {
      return;
    }

    onChange(next.getMonth() + 1, next.getFullYear());
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => moveMonth(-1)}
        disabled={!canGoPrev}
        activeOpacity={0.75}
        style={[styles.arrowButton, !canGoPrev && styles.arrowButtonDisabled]}
      >
        <Ionicons name="chevron-back" size={18} color={canGoPrev ? '#F0F0FF' : '#55556A'} />
      </TouchableOpacity>

      <Text style={styles.label}>{getMonthLabel(month, year)}</Text>

      <TouchableOpacity
        onPress={() => moveMonth(1)}
        disabled={!canGoNext}
        activeOpacity={0.75}
        style={[styles.arrowButton, !canGoNext && styles.arrowButtonDisabled]}
      >
        <Ionicons name="chevron-forward" size={18} color={canGoNext ? '#F0F0FF' : '#55556A'} />
      </TouchableOpacity>
    </View>
  );
};

export default MonthSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14141F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2B',
  },
  arrowButtonDisabled: {
    backgroundColor: '#11111A',
  },
  label: {
    color: '#F0F0FF',
    fontSize: 15,
    fontFamily: 'Syne_700Bold',
  },
});
