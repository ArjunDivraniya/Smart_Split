import { Router } from 'express';
import {
	clearAllNotifications,
	getNotifications,
	markAllAsRead,
	markNotificationAsRead,
} from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', getNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private
 */
router.put('/:id/read', markNotificationAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

/**
 * @route   DELETE /api/notifications/clear
 * @desc    Clear all notifications for current user
 * @access  Private
 */
router.delete('/clear', clearAllNotifications);

/**
 * @route   PUT /api/notifications
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/', markAllAsRead);

export default router;
