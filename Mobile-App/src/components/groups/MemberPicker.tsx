import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MemberItem {
  userId: string;
  userName: string;
}

interface MemberPickerProps {
  members: MemberItem[];
  selectedMemberIds: string[];
  currentUserId?: string;
  onToggle: (userId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const MemberPicker: React.FC<MemberPickerProps> = ({
  members,
  selectedMemberIds,
  currentUserId,
  onToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency

  const allSelected = members.length > 0 && selectedMemberIds.length === members.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Included Members</Text>
        <TouchableOpacity
          onPress={allSelected ? onDeselectAll : onSelectAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.toggleText, { color: colors.violet }]}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {members.map((member) => {
          const isSelected = selectedMemberIds.includes(member.userId);
          const isCurrentUser = currentUserId === member.userId;

          return (
            <TouchableOpacity
              key={member.userId}
              style={styles.memberItem}
              onPress={() => onToggle(member.userId)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.avatarWrap,
                  {
                    borderColor: isSelected ? colors.violet : 'transparent',
                    opacity: isSelected ? 1 : 0.45,
                    backgroundColor: colors.elevated,
                  },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: isSelected ? colors.violet : colors.background }]}>
                  <Text style={[styles.avatarText, { color: isSelected ? '#ffffff' : colors.text }]}>
                    {member.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.memberName,
                  { color: colors.text, opacity: isSelected ? 1 : 0.55 },
                ]}
                numberOfLines={1}
              >
                {isCurrentUser ? 'You' : member.userName}
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
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  scrollContent: {
    paddingRight: 12,
    gap: 10,
  },
  memberItem: {
    alignItems: 'center',
    width: 72,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
  },
  memberName: {
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
});

export default MemberPicker;
