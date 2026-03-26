import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CategoryPickerProps {
  selected: string;
  onSelect: (category: string) => void;
  description?: string;
}

type CategoryItem = {
  value: string;
  label: string;
  emoji: string;
};

const CATEGORIES: CategoryItem[] = [
  { value: 'Stay', label: 'Stay', emoji: '🏨' },
  { value: 'Food', label: 'Food', emoji: '🍔' },
  { value: 'Transport', label: 'Transport', emoji: '🚕' },
  { value: 'Fun', label: 'Fun', emoji: '🎬' },
  { value: 'Shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'Utilities', label: 'Utilities', emoji: '⚡' },
  { value: 'Gifts', label: 'Gifts', emoji: '🎁' },
  { value: 'Gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'Travel', label: 'Travel', emoji: '✈️' },
  { value: 'Health', label: 'Health', emoji: '💊' },
  { value: 'Education', label: 'Education', emoji: '📚' },
  { value: 'Other', label: 'Other', emoji: '➕' },
];

const LEGACY_TO_DISPLAY_CATEGORY: Record<string, string> = {
  Accommodation: 'Stay',
  Entertainment: 'Fun',
};

const normalizeSelectedCategory = (category: string): string => {
  return LEGACY_TO_DISPLAY_CATEGORY[category] || category;
};

const KEYWORD_CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: 'Stay', keywords: ['hotel', 'hostel', 'resort', 'stay', 'room', 'airbnb'] },
  { category: 'Transport', keywords: ['uber', 'ola', 'taxi', 'cab', 'metro', 'bus', 'auto', 'fuel', 'petrol', 'diesel'] },
  { category: 'Food', keywords: ['zomato', 'swiggy', 'food', 'meal', 'dinner', 'lunch', 'breakfast', 'restaurant', 'cafe'] },
  { category: 'Travel', keywords: ['flight', 'train', 'ticket', 'trip', 'travel', 'airport'] },
  { category: 'Utilities', keywords: ['electricity', 'water bill', 'wifi', 'internet', 'rent', 'utility'] },
  { category: 'Shopping', keywords: ['amazon', 'flipkart', 'mall', 'shopping', 'store'] },
  { category: 'Health', keywords: ['medicine', 'hospital', 'doctor', 'health', 'pharmacy'] },
  { category: 'Education', keywords: ['book', 'course', 'class', 'tuition', 'education'] },
  { category: 'Gaming', keywords: ['game', 'steam', 'xbox', 'playstation'] },
  { category: 'Gifts', keywords: ['gift', 'present', 'birthday'] },
  { category: 'Fun', keywords: ['movie', 'cinema', 'party', 'fun', 'entertainment'] },
];

const getSuggestedCategory = (description?: string): string | null => {
  const input = (description || '').trim().toLowerCase();
  if (!input) {
    return null;
  }

  for (const rule of KEYWORD_CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => input.includes(keyword))) {
      return rule.category;
    }
  }

  return null;
};

export const CategoryPicker: React.FC<CategoryPickerProps> = ({ selected, onSelect, description }) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [manualOverride, setManualOverride] = useState(false);
  const lastSuggestionRef = useRef<string | null>(null);

  const normalizedSelected = useMemo(() => normalizeSelectedCategory(selected), [selected]);

  useEffect(() => {
    const suggestion = getSuggestedCategory(description);

    if (suggestion !== lastSuggestionRef.current) {
      setManualOverride(false);
      lastSuggestionRef.current = suggestion;
    }

    if (suggestion && suggestion !== normalizedSelected && !manualOverride) {
      onSelect(suggestion);
    }
  }, [description, normalizedSelected, manualOverride, onSelect]);

  const handleSelect = (category: string) => {
    setManualOverride(true);
    onSelect(category);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = normalizedSelected === category.value;
          return (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? 'rgba(124, 92, 252, 0.22)' : colors.elevated,
                  borderColor: isSelected ? colors.violet : colors.elevated,
                },
              ]}
              onPress={() => handleSelect(category.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.pillEmoji}>{category.emoji}</Text>
              <Text
                style={[
                  styles.pillText,
                  { color: isSelected ? '#DCCEFF' : colors.text },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  pillEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
});

export default CategoryPicker;
