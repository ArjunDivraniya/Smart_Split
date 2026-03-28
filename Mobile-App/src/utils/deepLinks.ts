import type { AppNotification } from '@/src/hooks/useNotifications';

export const deepLinkPaths = {
  group: (id: string) => `/group/${id}`,
  settlements: '/settlements',
  settlementsOverdue: '/settlements?filter=overdue',
  friend: (id: string) => `/friends/${id}`,
  budget: '/budget',
  notifications: '/notifications',
};

export const deepLinkUrls = {
  group: (id: string) => `smartsplit://group/${id}`,
  settlements: 'smartsplit://settlements',
  settlementsOverdue: 'smartsplit://settlements?filter=overdue',
  friend: (id: string) => `smartsplit://friends/${id}`,
  budget: 'smartsplit://budget',
  notifications: 'smartsplit://notifications',
};

export const getNotificationDeepLinkPath = (notification: AppNotification): string | null => {
  switch (notification.type) {
    case 'payment_reminder':
      return deepLinkPaths.settlementsOverdue;
    case 'settled':
      return '/settlements?filter=done';
    case 'expense_added':
    case 'group_invite': {
      const groupId = String(notification.meta?.groupId || '').trim();
      return groupId ? deepLinkPaths.group(groupId) : null;
    }
    case 'budget_alert':
      return deepLinkPaths.budget;
    case 'monthly_report':
      return '/(tabs)/analytics';
    default:
      return null;
  }
};
