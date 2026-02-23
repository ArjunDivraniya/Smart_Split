import { Router } from 'express';
import { getNotifications, markAllAsRead } from '../controllers/notification.controller';
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
 * @route   PUT /api/notifications
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/', markAllAsRead);

export default router;
