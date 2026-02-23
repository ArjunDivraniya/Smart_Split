import { Response } from 'express';
import Notification from '../models/Notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Get User Notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profileImage')
      .populate('trip', 'name')
      .limit(50);

    return res.status(200).json({
      success: true,
      data: notifications,
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
