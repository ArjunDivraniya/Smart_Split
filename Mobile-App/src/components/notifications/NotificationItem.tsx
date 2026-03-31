import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppNotification } from '@/src/hooks/useNotifications';
import { getTimeAgo, getNotificationTypeConfig } from '@/src/utils/notifications';

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onDelete?: (notificationId: string) => void;
}

export function NotificationItem({
  notification,
  onPress,
  onDelete,
}: NotificationItemProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [showDelete, setShowDelete] = useState(false);
  const typeConfig = getNotificationTypeConfig(notification.type);
  const timeAgo = getTimeAgo(notification.createdAt);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          Animated.event(
            [null, { dx: pan.x }],
            { useNativeDriver: false }
          )(evt, gestureState);
          if (gestureState.dx < -50) {
            setShowDelete(true);
          } else {
            setShowDelete(false);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -80) {
          Animated.timing(pan, {
            toValue: { x: -100, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          setShowDelete(false);
        }
      },
    })
  ).current;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  const handleReset = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    setShowDelete(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          pan.getLayout(),
          styles.cardContainer,
          !notification.isRead && styles.unreadContainer,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            !notification.isRead && styles.unreadCard,
          ]}
          onPress={() => {
            handleReset();
            onPress(notification);
          }}
          activeOpacity={0.9}
        >
          {/* Left border for unread */}
          {!notification.isRead && <View style={styles.leftBorder} />}

          {/* Icon with colored background */}
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: `${typeConfig.backgroundColor}20` },
            ]}
          >
            <Text style={styles.emoji}>{typeConfig.emoji}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                !notification.isRead && styles.titleBold,
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text
              style={[
                styles.message,
                !notification.isRead ? styles.messageUnread : styles.messageRead,
              ]}
              numberOfLines={2}
            >
              {notification.message}
            </Text>
          </View>

          {/* Time and unread dot */}
          <View style={styles.rightSection}>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
            {!notification.isRead && <View style={styles.unreadDot} />}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default NotificationItem;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 12,
  },
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#14141F', // Ensure it's opaque to hide the button behind it
    zIndex: 2, // Higher than the delete button
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141F',
    padding: 12,
    borderRadius: 12,
    minHeight: 76,
  },
  unreadCard: {
    backgroundColor: 'rgba(124,92,252,0.12)', // Increased opacity for better contrast
  },
  unreadContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  leftBorder: {
    width: 6, // Slightly wider
    height: '100%',
    backgroundColor: '#7C5CFC',
    marginRight: 10,
    borderRadius: 3,
    marginLeft: -12,
    paddingLeft: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  emoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#F0F0FF',
    fontSize: 14, // Slightly larger
    fontFamily: 'DMSans_700Bold',
    marginBottom: 4,
    fontWeight: '700',
  },
  titleBold: {
    color: '#FFFFFF',
  },
  message: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 16,
  },
  messageUnread: {
    color: '#F3F3FF', // Lighter for unread
  },
  messageRead: {
    color: '#80809E',
    opacity: 0.7,
  },
  rightSection: {
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    flexShrink: 0,
  },
  timeAgo: {
    color: '#80809E',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C5CFC', // Matching brand color
    marginTop: 2,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 90, // Match the toValue in panRelease
    backgroundColor: '#FF5F7E',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Lower than the card container
    borderRadius: 12,
  },
  deleteText: {
    color: '#F0F0FF',
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
});
