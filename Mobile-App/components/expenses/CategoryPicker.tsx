import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { EXPENSE_CATEGORIES } from '@/src/constants/categories';

interface CategoryPickerProps {
  selected: string;
  onSelect: (category: string) => void;
  description?: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍕',
  transport: '🚕',
  accommodation: '🏨',
  entertainment: '🎬',
  shopping: '🛍️',
  health: '💊',
  utilities: '⚡',
  drinks: '☕',
  activities: '🎢',
  groceries: '🛒',
  flight: '✈️',
  other: '📦',
};

const LEGACY_TO_DISPLAY_CATEGORY: Record<string, string> = {
  Accommodation: 'accommodation',
  Entertainment: 'entertainment',
  Food: 'food',
  Transport: 'transport',
  Fun: 'entertainment',
  Stay: 'accommodation',
};

const normalizeSelectedCategory = (category: string): string => {
  const lower = category.toLowerCase();
  return LEGACY_TO_DISPLAY_CATEGORY[category] || LEGACY_TO_DISPLAY_CATEGORY[lower] || lower;
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
      return rule.category.toLowerCase();
    }
  }

  return null;
};

export const CategoryPicker: React.FC<CategoryPickerProps> = ({ selected, onSelect, description }) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
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
        {EXPENSE_CATEGORIES.map((category) => {
          const isSelected = normalizedSelected === category.id;
          const emoji = CATEGORY_EMOJIS[category.id] || '❓';
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? 'rgba(124, 92, 252, 0.22)' : colors.elevated,
                  borderColor: isSelected ? colors.violet : colors.elevated,
                },
              ]}
              onPress={() => handleSelect(category.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.pillEmoji}>{emoji}</Text>
              <Text
                style={[
                  styles.pillText,
                  { color: isSelected ? '#DCCEFF' : colors.text },
                ]}
              >
                {category.name}
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
