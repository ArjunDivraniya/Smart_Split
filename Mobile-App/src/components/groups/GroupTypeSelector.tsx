// Mobile-App/src/components/groups/GroupTypeSelector.tsx

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupType, GROUP_TYPE_MAP } from '@/src/types/group.types';

const COLORS = {
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

interface GroupTypeSelectorProps {
  selectedType: GroupType | null;
  onSelectType: (type: GroupType) => void;
}

export function GroupTypeSelector({
  selectedType,
  onSelectType,
}: GroupTypeSelectorProps) {
  const types = Object.values(GroupType);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Group Type</Text>
        <Text style={styles.subtitle}>
          Select the type that best fits your group
        </Text>
      </View>

      <ScrollView
        style={styles.gridScroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View style={styles.grid}>
          {types.map((type) => {
            const typeInfo = GROUP_TYPE_MAP[type];
            const isSelected = selectedType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeCard,
                  isSelected && styles.typeCardSelected,
                ]}
                onPress={() => onSelectType(type)}
                activeOpacity={0.7}
              >
                <View style={styles.typeCardContent}>
                  <Text style={styles.typeEmoji}>{typeInfo.emoji}</Text>
                  <Text style={styles.typeLabel}>{typeInfo.label}</Text>
                  <Text style={styles.typeDesc}>{typeInfo.description}</Text>

                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={COLORS.mint}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedType && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color={COLORS.violet} />
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '600' }}>
              {GROUP_TYPE_MAP[selectedType].label}
            </Text>
            {selectedType === GroupType.TRIP &&
              ' groups include special trip tracking with daily expense timeline and budget monitoring.'}
            {selectedType !== GroupType.TRIP &&
              ' groups are perfect for splitting regular shared expenses.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    position: 'relative',
  },
  typeCardSelected: {
    borderColor: COLORS.violet,
    backgroundColor: `${COLORS.violet}15`,
  },
  typeCardContent: {
    alignItems: 'center',
    width: '100%',
  },
  typeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    lineHeight: 14,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: `${COLORS.violet}15`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${COLORS.violet}30`,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 16,
  },
});
