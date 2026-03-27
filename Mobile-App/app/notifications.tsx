import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import NotificationItem from '@/src/components/notifications/NotificationItem';
import useNotifications, { AppNotification } from '@/src/hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
  } = useNotifications();

  const handleNotificationTap = useCallback(
    async (notification: AppNotification) => {
      await markAsRead(notification.id);

      switch (notification.type) {
        case 'payment_reminder':
          router.push({ pathname: '/settlements' as any, params: { filter: 'overdue' } });
          break;
        case 'settled':
          router.push({ pathname: '/settlements' as any, params: { filter: 'done' } });
          break;
        case 'expense_added':
          if (notification.meta?.groupId) {
            router.push(`/group/${notification.meta.groupId}` as any);
          }
          break;
        case 'budget_alert':
          router.push('/budget' as any);
          break;
        case 'group_invite':
          if (notification.meta?.groupId) {
            router.push(`/group/${notification.meta.groupId}` as any);
          }
          break;
        case 'monthly_report':
          router.push('/analytics' as any);
          break;
        default:
          break;
      }
    },
    [markAsRead, router]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size='large' color='#7C5CFC' />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor='#7C5CFC' />}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={handleNotificationTap}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#F0F0FF',
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyWrap: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#A0A0BF',
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
});
