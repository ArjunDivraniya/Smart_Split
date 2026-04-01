import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ChartToggleProps {
  active: 'categories' | 'monthly-trend';
  onChange: (value: 'categories' | 'monthly-trend') => void;
}

const OPTIONS: Array<{ key: 'categories' | 'monthly-trend'; label: string }> = [
  { key: 'categories', label: 'Categories' },
  { key: 'monthly-trend', label: 'Monthly Trend' },
];

export const ChartToggle = ({ active, onChange }: ChartToggleProps) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
      {OPTIONS.map((option) => {
        const isActive = option.key === active;

        return (
          <TouchableOpacity
            key={option.key}
            style={[styles.option, { backgroundColor: colors.elevated }, isActive && styles.optionActive]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionText, { color: isActive ? colors.text : colors.icon }, isActive && styles.optionTextActive]}>{option.label}</Text>
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: '#7C5CFC',
  },
  optionText: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  optionTextActive: {
    fontFamily: 'DMSans_700Bold',
  },
});
