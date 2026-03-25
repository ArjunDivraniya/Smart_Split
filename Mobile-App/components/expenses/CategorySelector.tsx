import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORIES = [
  { id: 'Food', label: 'Food', icon: 'fast-food', color: '#f59e0b' },
  { id: 'Transport', label: 'Transport', icon: 'car', color: '#3b82f6' },
  { id: 'Accommodation', label: 'Stay', icon: 'bed', color: '#8b5cf6' },
  { id: 'Entertainment', label: 'Entertainment', icon: 'game-controller', color: '#ec4899' },
  { id: 'Shopping', label: 'Shopping', icon: 'cart', color: '#10b981' },
  { id: 'Fuel', label: 'Fuel', icon: 'water', color: '#14b8a6' },
  { id: 'Other', label: 'Other', icon: 'ellipsis-horizontal', color: '#6366f1' },
];

interface CategorySelectorProps {
  selected: string;
  onSelect: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect }) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selected === category.id;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { borderColor: colors.elevated, backgroundColor: colors.background },
                isSelected && { borderColor: category.color, backgroundColor: `${category.color}18` },
              ]}
              onPress={() => onSelect(category.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isSelected ? category.color : `${category.color}20` },
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={isSelected ? '#ffffff' : category.color}
                />
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: colors.icon },
                  isSelected && { ...styles.categoryLabelSelected, color: category.color },
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
  container: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginRight: 12,
    minWidth: 80,
  },
  categoryCardSelected: {
    borderWidth: 2,
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryLabelSelected: {
    fontWeight: '700',
  },
});
