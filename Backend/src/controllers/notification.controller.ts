import { Response } from 'express';
import Notification from '../models/Notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

const getTimeAgo = (dateValue: Date): string => {
  const now = new Date();
  const createdAt = new Date(dateValue);
  const diffMs = now.getTime() - createdAt.getTime();

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return 'Just now';
  }

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (diffMs < 2 * dayMs) {
    return 'Yesterday';
  }

  const days = Math.floor(diffMs / dayMs);
  return `${days} days ago`;
};

const parseAmountFromMessage = (message: string): number | undefined => {
  const rupeeMatch = message.match(/₹\s*([\d,]+(?:\.\d+)?)/);
  if (!rupeeMatch) {
    return undefined;
  }

  const parsed = Number(rupeeMatch[1].replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const NOTIFICATION_TITLES: Record<string, string> = {
  invite: 'Group Invitation',
  expense: 'Expense Update',
  activity: 'Group Activity',
  system: 'System Notification',
  settled: 'Settlement Update',
  expense_added: 'New Expense Added',
  budget_alert: 'Budget Alert',
};

// Get User Notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
      : 50;

    const unreadOnly = String(req.query.unreadOnly || '').toLowerCase() === 'true';

    const baseFilter: Record<string, any> = { recipient: userId };
    if (unreadOnly) {
      baseFilter.isRead = false;
    }

    const [notificationDocs, unreadCount, totalCount] = await Promise.all([
      Notification.find(baseFilter)
      .sort({ createdAt: -1 })
      .populate('sender', 'name profileImage')
      .populate('trip', 'name')
      .limit(limit),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      Notification.countDocuments({ recipient: userId }),
    ]);

    const notifications = notificationDocs.map((notification: any) => {
      const groupId = notification.trip?._id?.toString?.() || notification.trip?.toString?.();
      const friendId = notification.sender?._id?.toString?.() || notification.sender?.toString?.();
      const amount = parseAmountFromMessage(String(notification.message || ''));

      const meta: { groupId?: string; friendId?: string; amount?: number } = {};
      if (groupId) {
        meta.groupId = groupId;
      }
      if (friendId) {
        meta.friendId = friendId;
      }
      if (typeof amount === 'number') {
        meta.amount = amount;
      }

      return {
        id: notification._id.toString(),
        type: notification.type,
        title: NOTIFICATION_TITLES[notification.type] || 'Notification',
        message: notification.message,
        isRead: Boolean(notification.isRead),
        meta,
        createdAt: notification.createdAt,
        timeAgo: getTimeAgo(notification.createdAt),
      };
    });

    return res.status(200).json({
      notifications,
      unreadCount,
      totalCount,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Mark All Notifications as Read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    await Notification.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true } });

    return res.status(200).json({
      success: true,
      message: 'All marked as read',
    });
  } catch (error: any) {
    console.error('Mark notifications as read error:', error);
    return res.status(500).json({ message: error.message });
  }
};
