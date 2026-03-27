import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '@/src/services/api';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  meta?: {
    groupId?: string;
    [key: string]: any;
  };
}

const toNotification = (item: any, index: number): AppNotification => {
  const id = String(item?._id || item?.id || `notification-${index}`);

  return {
    id,
    type: String(item?.type || 'system'),
    title: String(item?.title || 'Notification'),
    message: String(item?.message || ''),
    isRead: Boolean(item?.isRead ?? item?.read ?? false),
    createdAt: item?.createdAt,
    meta: item?.meta || item?.data || {},
  };
};

const getErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Failed to process notifications'
  );
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.notifications.getAll();
      const payload = response?.data?.data || response?.data || [];
      const normalized = (Array.isArray(payload) ? payload : []).map(toNotification);
      setNotifications(normalized);
    } catch (err: any) {
      setError(getErrorMessage(err));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await apiService.notifications.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
        );
      } catch (err: any) {
        setError(getErrorMessage(err));
      }
    },
    []
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
  };
};

export default useNotifications;
