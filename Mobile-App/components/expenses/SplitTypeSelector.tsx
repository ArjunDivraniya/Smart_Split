import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SplitType } from '@/src/utils/splitCalculator';

const SPLIT_TYPES = [
  {
    id: 'equally' as SplitType,
    label: 'Equal',
    description: 'Split equally among members',
    icon: 'people',
    color: '#10b981',
  },
  {
    id: 'percentage' as SplitType,
    label: 'Percentage',
    description: 'Split by custom percentages',
    icon: 'pie-chart',
    color: '#f59e0b',
  },
  {
    id: 'unequally' as SplitType,
    label: 'Exact Amount',
    description: 'Enter exact amounts',
    icon: 'calculator',
    color: '#3b82f6',
  },
  {
    id: 'shares' as SplitType,
    label: 'Shares',
    description: 'Split by share ratio',
    icon: 'git-network',
    color: '#8b5cf6',
  },
];

interface SplitTypeSelectorProps {
  selected: SplitType;
  onSelect: (type: SplitType) => void;
}

export const SplitTypeSelector: React.FC<SplitTypeSelectorProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Split Type</Text>
      <Text style={styles.sublabel}>How should this expense be split?</Text>
      
      <View style={styles.grid}>
        {SPLIT_TYPES.map((type) => {
          const isSelected = selected === type.id;
          
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                isSelected && { ...styles.typeCardSelected, borderColor: type.color },
              ]}
              onPress={() => onSelect(type.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isSelected ? type.color : `${type.color}20` },
                ]}
              >
                <Ionicons
                  name={type.icon as any}
                  size={28}
                  color={isSelected ? '#ffffff' : type.color}
                />
              </View>
              
              <Text style={[styles.typeLabel, isSelected && { color: type.color }]}>
                {type.label}
              </Text>
              
              <Text style={styles.typeDescription}>{type.description}</Text>

              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: type.color }]}>
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
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
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginHorizontal: '1%',
    marginBottom: 12,
    position: 'relative',
  },
  typeCardSelected: {
    borderWidth: 2,
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
