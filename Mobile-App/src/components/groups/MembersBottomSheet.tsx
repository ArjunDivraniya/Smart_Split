import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type MemberItem = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

interface MembersBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  members: MemberItem[];
  creatorId: string;
  currentUserId: string;
  isCreator: boolean;
  removingMemberId?: string;
  onRemoveMember?: (member: MemberItem) => void;
  onAddMember?: () => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0] || 'U').slice(0, 2).toUpperCase();
};

const avatarColorFromName = (name: string): string => {
  const palette = ['#7C5CFC', '#00C2A8', '#F59E0B', '#EC4899', '#3B82F6', '#22C55E'];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

export function MembersBottomSheet({
  visible,
  onClose,
  members,
  creatorId,
  currentUserId,
  isCreator,
  removingMemberId,
  onRemoveMember,
  onAddMember,
}: MembersBottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Members</Text>
            <View style={styles.headerActions}>
              {isCreator ? (
                <TouchableOpacity style={styles.addButton} onPress={onAddMember}>
                  <Ionicons name="person-add" size={16} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={members}
            keyExtractor={(item, index) => item.id || `member-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isMemberCreator = item.id === creatorId;
              const canRemove = isCreator && item.id !== currentUserId;
              const isRemoving = removingMemberId === item.id;

              return (
                <View style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: avatarColorFromName(item.name) }]}>
                    <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                  </View>

                  <View style={styles.meta}>
                    <View style={styles.nameRow}>
                      <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                      {isMemberCreator ? (
                        <View style={styles.creatorBadge}>
                          <Text style={styles.creatorBadgeText}>Creator</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.emailText} numberOfLines={1}>{item.email}</Text>
                  </View>

                  {canRemove ? (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemoveMember?.(item)}
                      disabled={isRemoving}
                    >
                      {isRemoving ? (
                        <ActivityIndicator size="small" color="#FF5F7E" />
                      ) : (
                        <Text style={styles.removeButtonText}>Remove</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No members found</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#12121B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '74%',
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C5CFC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  title: {
    color: '#F3F4FF',
    fontSize: 18,
    fontFamily: 'Syne_700Bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  meta: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  nameText: {
    color: '#F5F6FF',
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    maxWidth: '72%',
  },
  emailText: {
    color: '#9BA0B8',
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  creatorBadge: {
    backgroundColor: 'rgba(124, 92, 252, 0.2)',
    borderColor: 'rgba(124, 92, 252, 0.45)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  creatorBadgeText: {
    color: '#A594FF',
    fontSize: 10,
    fontFamily: 'DMSans_600SemiBold',
  },
  removeButton: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FF5F7E',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  emptyText: {
    color: '#9BA0B8',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'DMSans_400Regular',
  },
});
