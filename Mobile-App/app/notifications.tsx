import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationItem from '@/src/components/notifications/NotificationItem';
import useNotifications, { AppNotification } from '@/src/hooks/useNotifications';
import { NotificationSkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { hapticImpactLight } from '@/src/utils/haptics';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const bellAnimation = new Animated.Value(0);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );

  const readNotifications = useMemo(
    () => notifications.filter((n) => n.isRead),
    [notifications]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    void hapticImpactLight();
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

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
          router.push('/(tabs)/analytics' as any);
          break;
        default:
          break;
      }
    },
    [markAsRead, router]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  }, [markAllAsRead, unreadCount]);

  const handleClearAll = useCallback(async () => {
    if (notifications.length > 0) {
      await clearAllNotifications();
    }
  }, [clearAllNotifications, notifications.length]);

  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      await deleteNotification(notificationId);
    },
    [deleteNotification]
  );

  // Animate bell icon on mount
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bellAnimation]);

  const bellScale = bellAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <MaterialIcons name="arrow-back" size={24} color="#F0F0FF" />
            </TouchableOpacity>
            <Text style={styles.title}>Notifications</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.skeletonContent}>
          <NotificationSkeletonLoader style={{ marginBottom: 12 }} />
          <NotificationSkeletonLoader style={{ marginBottom: 12 }} />
          <NotificationSkeletonLoader style={{ marginBottom: 12 }} />
          <NotificationSkeletonLoader style={{ marginBottom: 12 }} />
          <NotificationSkeletonLoader />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color="#F0F0FF" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Action buttons */}
        {notifications.length > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                unreadCount === 0 && styles.actionButtonDisabled,
              ]}
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <MaterialIcons name="check" size={16} color="#00E5B0" />
              <Text style={styles.actionText}>Mark All Read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearAll}
            >
              <MaterialIcons name="delete-outline" size={16} color="#FF5F7E" />
              <Text style={styles.actionText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {error ? (
        <ErrorState onRetry={handleRefresh} />
      ) : notifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={[styles.emptyContent, { justifyContent: 'center' }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#7C5CFC"
            />
          }
        >
          <EmptyState
            emoji="🔔"
            title="No notifications yet"
            subtitle="You'll see expense updates, settlement confirmations, and budget alerts here"
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#7C5CFC"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Unread section */}
          {unreadNotifications.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>UNREAD</Text>
                <Text style={styles.sectionCount}>({unreadNotifications.length})</Text>
              </View>
              <View style={styles.divider} />

              {unreadNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={handleNotificationTap}
                  onDelete={handleDeleteNotification}
                />
              ))}

              {readNotifications.length > 0 && (
                <>
                  <View style={[styles.sectionHeader, styles.sectionHeaderTop]}>
                    <Text style={styles.sectionTitle}>EARLIER</Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}
            </View>
          )}

          {/* Read section */}
          {readNotifications.length > 0 && unreadNotifications.length === 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>EARLIER</Text>
              </View>
              <View style={styles.divider} />
            </View>
          )}

          {readNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={handleNotificationTap}
              onDelete={handleDeleteNotification}
            />
          ))}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#F0F0FF',
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    color: '#F0F0FF',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  sectionHeaderTop: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#80809E',
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionCount: {
    color: '#80809E',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyBell: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F0F0FF',
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#80809E',
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 18,
    textAlign: 'center',
  },
  skeletonContent: {
    padding: 16,
    paddingBottom: 24,
  },
});
