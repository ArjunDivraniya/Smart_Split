import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type AvatarGroupSize = 'small' | 'medium';

type AvatarGroupMember = {
  id?: string;
  name?: string;
  userName?: string;
  email?: string;
};

interface AvatarGroupProps {
  members: AvatarGroupMember[];
  size?: AvatarGroupSize;
}

const MAX_VISIBLE = 4;

const SIZE_MAP = {
  small: {
    avatar: 24,
    text: 10,
    overlap: 8,
  },
  medium: {
    avatar: 32,
    text: 12,
    overlap: 10,
  },
} as const;

const AVATAR_PALETTE = [
  '#7C5CFC',
  '#00C2A8',
  '#F59E0B',
  '#EC4899',
  '#14B8A6',
  '#3B82F6',
  '#F97316',
  '#8B5CF6',
  '#22C55E',
  '#EF4444',
];

const getMemberName = (member: AvatarGroupMember): string => {
  return member.name || member.userName || member.email || 'U';
};

const getInitial = (name: string): string => {
  const normalized = name.trim();
  if (!normalized) {
    return 'U';
  }

  const parts = normalized.split(' ').filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return normalized[0].toUpperCase();
};

const colorFromName = (name: string): string => {
  const normalized = name.toLowerCase();
  let hash = 0;

  for (let i = 0; i < normalized.length; i += 1) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[colorIndex];
};

export function AvatarGroup({ members, size = 'small' }: AvatarGroupProps) {
  const visibleMembers = members.slice(0, MAX_VISIBLE);
  const extraMembers = Math.max(0, members.length - MAX_VISIBLE);
  const metrics = SIZE_MAP[size];

  return (
    <View style={styles.container}>
      {visibleMembers.map((member, index) => {
        const displayName = getMemberName(member);
        const avatarColor = colorFromName(displayName);

        return (
          <View
            key={member.id || `${displayName}-${index}`}
            style={[
              styles.avatar,
              {
                width: metrics.avatar,
                height: metrics.avatar,
                borderRadius: metrics.avatar / 2,
                marginLeft: index === 0 ? 0 : -metrics.overlap,
                zIndex: visibleMembers.length - index,
                backgroundColor: avatarColor,
              },
            ]}
          >
            <Text style={[styles.avatarText, { fontSize: metrics.text }]}>{getInitial(displayName)}</Text>
          </View>
        );
      })}

      {extraMembers > 0 && (
        <View
          style={[
            styles.avatar,
            styles.moreAvatar,
            {
              width: metrics.avatar,
              height: metrics.avatar,
              borderRadius: metrics.avatar / 2,
              marginLeft: visibleMembers.length > 0 ? -metrics.overlap : 0,
              zIndex: 0,
            },
          ]}
        >
          <Text style={[styles.avatarText, { fontSize: metrics.text }]}>+{extraMembers}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#241F3A',
  },
  moreAvatar: {
    backgroundColor: '#3B3557',
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans_700Bold',
  },
});
