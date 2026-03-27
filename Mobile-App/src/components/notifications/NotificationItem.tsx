import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppNotification } from '@/src/hooks/useNotifications';

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

const getIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'payment_reminder':
      return 'alarm-outline';
    case 'settled':
      return 'checkmark-done-circle-outline';
    case 'expense_added':
      return 'receipt-outline';
    case 'budget_alert':
      return 'warning-outline';
    case 'group_invite':
      return 'people-outline';
    case 'monthly_report':
      return 'stats-chart-outline';
    default:
      return 'notifications-outline';
  }
};

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !notification.isRead ? styles.unreadCard : null]}
      onPress={() => onPress(notification)}
      activeOpacity={0.88}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={getIcon(notification.type)} size={20} color="#9B7FFF" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
      </View>

      {!notification.isRead ? <View style={styles.dot} /> : null}
    </TouchableOpacity>
  );
}

export default NotificationItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    backgroundColor: '#14141F',
    padding: 12,
    marginBottom: 10,
  },
  unreadCard: {
    backgroundColor: '#1A1A2B',
    borderColor: 'rgba(124,92,252,0.24)',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(124,92,252,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#F0F0FF',
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 2,
  },
  message: {
    color: '#A0A0BF',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5F7E',
    marginLeft: 8,
  },
});
