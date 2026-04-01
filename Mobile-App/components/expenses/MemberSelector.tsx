import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SplitType, Participant } from '@/src/utils/splitCalculator';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MemberSelectorProps {
  members: Array<{ userId: string; userName: string }>;
  selected: Participant[];
  onToggle: (userId: string) => void;
  splitType: SplitType;
  onValueChange: (userId: string, value: number) => void;
  currentUserId: string;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  members,
  selected,
  onToggle,
  splitType,
  onValueChange,
  currentUserId,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const isSelected = (userId: string) => selected.some((s) => s.userId === userId);
  const getValue = (userId: string) => selected.find((s) => s.userId === userId)?.value || 0;

  const renderValueInput = (userId: string) => {
    if (splitType === 'equally') return null;

    if (splitType === 'shares') {
      const currentShares = Math.max(0, Math.floor(getValue(userId)));
      return (
        <View style={[styles.sharesStepper, { backgroundColor: colors.background, borderColor: colors.elevated }]}> 
          <TouchableOpacity
            style={[styles.stepperBtn, { borderRightColor: colors.elevated }]}
            onPress={() => onValueChange(userId, Math.max(0, currentShares - 1))}
            activeOpacity={0.85}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.stepperValueWrap}>
            <Text style={[styles.stepperValue, { color: colors.text }]}>{currentShares}</Text>
            <Text style={[styles.stepperLabel, { color: colors.icon }]}>share{currentShares === 1 ? '' : 's'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.stepperBtn, { borderLeftColor: colors.elevated }]}
            onPress={() => onValueChange(userId, currentShares + 1)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      );
    }

    let placeholder = '';
    let suffix = '';

    switch (splitType) {
      case 'percentage':
        placeholder = '0';
        suffix = '%';
        break;
      case 'unequally':
        placeholder = '0';
        suffix = '₹';
        break;
    }

    return (
      <View style={[styles.valueInputContainer, { backgroundColor: colors.background, borderColor: colors.elevated }]}>
        <TextInput
          style={[styles.valueInput, { color: colors.text }]}
          value={getValue(userId).toString()}
          onChangeText={(text) => {
            const num = parseFloat(text) || 0;
            onValueChange(userId, num);
          }}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
        />
        <Text style={[styles.valueSuffix, { color: colors.icon }]}>{suffix}</Text>
      </View>
    );
  };

  const getInputLabel = () => {
    switch (splitType) {
      case 'percentage':
        return 'Enter percentage for each member';
      case 'unequally':
        return 'Enter exact amount for each member';
      case 'shares':
        return 'Enter share count for each member';
      default:
        return 'Select members to include';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>Split Among</Text>
        <Text style={[styles.count, { color: colors.icon }]}> 
          {selected.length} of {members.length} selected
        </Text>
      </View>
      
      <Text style={[styles.sublabel, { color: colors.icon }]}>{getInputLabel()}</Text>

      <View style={styles.membersList}>
        {members.map((member) => {
          const selected = isSelected(member.userId);
          const isCurrentUser = member.userId === currentUserId;

          return (
            <View key={member.userId} style={[styles.memberRow, selected && { backgroundColor: `${colors.violet}12`, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }]}>
              <TouchableOpacity
                style={styles.memberInfo}
                onPress={() => onToggle(member.userId)}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colors.elevated },
                    selected && styles.checkboxSelected,
                  ]}
                >
                  {selected && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.memberDetails}>
                  <Text style={[styles.memberName, { color: colors.text }]}> 
                    {isCurrentUser ? 'You' : member.userName}
                  </Text>
                  {isCurrentUser && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>You</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {selected && renderValueInput(member.userId)}
            </View>
          );
        })}
      </View>

      {splitType !== 'equally' && (
        <TouchableOpacity
          style={[styles.selectAllButton, { borderTopColor: colors.elevated }]}
          onPress={() => {
            members.forEach((m) => {
              if (!isSelected(m.userId)) {
                onToggle(m.userId);
              }
            });
          }}
        >
          <Ionicons name="people" size={16} color="#6366f1" />
          <Text style={styles.selectAllText}>Select All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  count: {
    fontSize: 13,
  },
  sublabel: {
    fontSize: 13,
    marginBottom: 12,
  },
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  memberDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  youBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#22c55e',
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
  },
  valueInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  valueSuffix: {
    fontSize: 13,
    marginLeft: 6,
  },
  sharesStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    minWidth: 126,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepperLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 12,
    borderTopWidth: 1,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
  },
});
