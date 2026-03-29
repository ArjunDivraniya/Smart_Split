/**
 * Notification utilities: formatting, type mapping, icons, etc.
 */

export const getTimeAgo = (createdAt?: string): string => {
  if (!createdAt) return 'just now';

  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  return `${Math.floor(diffDays / 30)}mo`;
};

export interface NotificationTypeConfig {
  emoji: string;
  backgroundColor: string;
  borderColor?: string;
}

export const getNotificationTypeConfig = (type: string): NotificationTypeConfig => {
  const configs: Record<string, NotificationTypeConfig> = {
    expense_added: {
      emoji: '💸',
      backgroundColor: '#7C5CFC',
      borderColor: 'rgba(124,92,252,0.3)',
    },
    settled: {
      emoji: '✅',
      backgroundColor: '#00E5B0',
      borderColor: 'rgba(0,229,176,0.3)',
    },
    budget_alert: {
      emoji: '🚨',
      backgroundColor: '#FF5F7E',
      borderColor: 'rgba(255,95,126,0.3)',
    },
    payment_reminder: {
      emoji: '⏰',
      backgroundColor: '#FFB547',
      borderColor: 'rgba(255,181,71,0.3)',
    },
    group_invite: {
      emoji: '👥',
      backgroundColor: '#7C5CFC',
      borderColor: 'rgba(124,92,252,0.3)',
    },
    monthly_report: {
      emoji: '📊',
      backgroundColor: '#38BDF8',
      borderColor: 'rgba(56,189,248,0.3)',
    },
    payment_received: {
      emoji: '💰',
      backgroundColor: '#00E5B0',
      borderColor: 'rgba(0,229,176,0.3)',
    },
    payment_confirmed: {
      emoji: '✅',
      backgroundColor: '#22C55E',
      borderColor: 'rgba(34,197,94,0.3)',
    },
    partial_payment: {
      emoji: '🧾',
      backgroundColor: '#FFB547',
      borderColor: 'rgba(255,181,71,0.3)',
    },
    mark_received: {
      emoji: '✔️',
      backgroundColor: '#14B8A6',
      borderColor: 'rgba(20,184,166,0.3)',
    },
  };

  return (
    configs[type] || {
      emoji: '🔔',
      backgroundColor: '#7C5CFC',
      borderColor: 'rgba(124,92,252,0.3)',
    }
  );
};
