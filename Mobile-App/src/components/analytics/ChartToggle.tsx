import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChartToggleProps {
  active: 'categories' | 'monthly-trend';
  onChange: (value: 'categories' | 'monthly-trend') => void;
}

const OPTIONS: Array<{ key: 'categories' | 'monthly-trend'; label: string }> = [
  { key: 'categories', label: 'Categories' },
  { key: 'monthly-trend', label: 'Monthly Trend' },
];

export const ChartToggle = ({ active, onChange }: ChartToggleProps) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isActive = option.key === active;

        return (
          <TouchableOpacity
            key={option.key}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ChartToggle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#14141F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#1A1A2B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: '#7C5CFC',
  },
  optionText: {
    color: '#8888AA',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  optionTextActive: {
    color: '#F0F0FF',
    fontFamily: 'DMSans_700Bold',
  },
});
