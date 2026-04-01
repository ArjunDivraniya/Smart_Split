import React, { useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useGroups } from '@/src/hooks/useGroups';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Group } from '@/src/types/group.types';

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, any>;
    return String(obj._id || obj.id || '').trim();
  }

  return String(value).trim();
};

const getGroupId = (group: Group): string => normalizeId(group.id || group._id);

export default function SelectGroupForExpenseScreen() {
  const router = useRouter();
  const colors = Colors.dark; // Forced dark theme for premium look

  const { groups, loading, error } = useGroups();

  const activeGroups = useMemo(() => groups.filter((g) => g?.isActive !== false), [groups]);

  const openAddGroupExpense = (group: Group) => {
    const groupId = getGroupId(group);
    if (!groupId) {
      return;
    }

    router.push(`/group/add-expense?id=${encodeURIComponent(groupId)}` as any);
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={styles.backdrop} onPress={() => router.back()}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      </Pressable>

      <View style={[styles.sheetWrap, { backgroundColor: colors.background }]}>
        <View style={styles.sheetHandle} />

        <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.text }]}>Select Group</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>Choose a group and tap + to add expense</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <Text style={[styles.stateText, { color: colors.icon }]}>Loading groups...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Text style={[styles.stateText, { color: colors.coral }]}>{error}</Text>
          </View>
        ) : activeGroups.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={[styles.stateText, { color: colors.icon }]}>No active groups found.</Text>
          </View>
        ) : (
          <FlatList
            data={activeGroups}
            keyExtractor={(item, index) => getGroupId(item) || `group-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const groupId = getGroupId(item);
              const emoji = item.emoji || item.customEmoji || '👥';
              const membersCount = Array.isArray(item.members) ? item.members.length : 0;

              return (
                <View style={[styles.groupRow, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
                  <TouchableOpacity
                    style={styles.groupInfo}
                    activeOpacity={0.82}
                    onPress={() => openAddGroupExpense(item)}
                  >
                    <View style={[styles.emojiWrap, { backgroundColor: `${colors.violet}1F` }]}>
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </View>
                    <View style={styles.groupTextWrap}>
                      <Text style={[styles.groupName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.groupMeta, { color: colors.icon }]} numberOfLines={1}>
                        {membersCount} members • Tap + to add expense
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.addIconBtn, { backgroundColor: colors.violet }]}
                    activeOpacity={0.9}
                    onPress={() => openAddGroupExpense(item)}
                    disabled={!groupId}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetWrap: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Syne_700Bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'DMSans_400Regular',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 26,
    gap: 10,
  },
  groupRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  groupTextWrap: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
  },
  groupMeta: {
    fontSize: 11,
    marginTop: 3,
    fontFamily: 'DMSans_400Regular',
  },
  addIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stateText: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'DMSans_500Medium',
  },
});